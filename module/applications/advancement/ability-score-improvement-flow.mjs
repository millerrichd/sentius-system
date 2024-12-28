import AdvancementFlow from "./advancement-flow.mjs";

/**
 * Inline application that presents the player with a choice between ability score improvement and taking a feat.
 */
export default class AbilityScoreImprovementFlow extends AdvancementFlow {

  /**
   * Player assignments to abilities.
   * @type {Object<string, number>}
   */
  assignments = {};

  /* -------------------------------------------- */

  /**
   * The dropped feat item.
   * @type {Item5e}
   */
  feat;

  /* -------------------------------------------- */

  /** @inheritDoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      dragDrop: [{ dropSelector: "form" }],
      template: "systems/sentius/templates/advancement/ability-score-improvement-flow.hbs"
    });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async retainData(data) {
    await super.retainData(data);
    this.assignments = this.retainedData.assignments ?? {};
    const featUuid = Object.values(this.retainedData.feat ?? {})[0];
    if ( featUuid ) this.feat = await fromUuid(featUuid);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async getData() {
    const points = {
      assigned: Object.keys(CONFIG.SENTIUS.abilities).reduce((assigned, key) => {
        if ( !this.advancement.canImprove(key) || this.advancement.configuration.locked.has(key) ) return assigned;
        return assigned + (this.assignments[key] ?? 0);
      }, 0),
      cap: this.advancement.configuration.cap ?? Infinity,
      total: this.advancement.configuration.points
    };
    points.available = points.total - points.assigned;

    const formatter = new Intl.NumberFormat(game.i18n.lang, { signDisplay: "always" });

    const abilities = Object.entries(CONFIG.SENTIUS.abilities).reduce((obj, [key, data]) => {
      if ( !this.advancement.canImprove(key) ) return obj;
      const ability = this.advancement.actor.system.abilities[key];
      const assignment = this.assignments[key] ?? 0;
      const fixed = this.advancement.configuration.fixed[key] ?? 0;
      const locked = this.advancement.configuration.locked.has(key);
      const value = Math.min(ability.value + fixed + assignment, ability.max);
      const max = locked ? value : Math.min(value + points.available, ability.max);
      const min = Math.min(ability.value + fixed, ability.max);
      obj[key] = {
        key, max, min, value,
        name: `abilities.${key}`,
        label: data.label,
        initial: ability.value + fixed,
        delta: (value - ability.value) ? formatter.format(value - ability.value) : null,
        showDelta: true,
        isDisabled: !!this.feat,
        isLocked: !!locked || (ability.value >= ability.max),
        canIncrease: (value < max) && ((fixed + assignment) < points.cap) && !locked && !this.feat,
        canDecrease: (value > (ability.value + fixed)) && !locked && !this.feat
      };
      return obj;
    }, {});

    const pluralRules = new Intl.PluralRules(game.i18n.lang);
    return foundry.utils.mergeObject(super.getData(), {
      abilities, points,
      feat: this.feat,
      staticIncrease: !this.advancement.configuration.points,
      pointCap: game.i18n.format(
        `SENTIUS.ADVANCEMENT.AbilityScoreImprovement.CapDisplay.${pluralRules.select(points.cap)}`, {points: points.cap}
      ),
      pointsRemaining: game.i18n.format(
        `SENTIUS.ADVANCEMENT.AbilityScoreImprovement.PointsRemaining.${pluralRules.select(points.available)}`,
        {points: points.available}
      )
    });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".adjustment-button").click(this._onClickButton.bind(this));
    html.find("a[data-uuid]").click(this._onClickFeature.bind(this));
    html.find("[data-action='delete']").click(this._onItemDelete.bind(this));
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _onChangeInput(event) {
    super._onChangeInput(event);
    const input = event.currentTarget;
    const key = input.closest("[data-score]").dataset.score;
    if ( isNaN(input.valueAsNumber) ) this.assignments[key] = 0;
    else {
      this.assignments[key] = Math.min(
        Math.clamp(input.valueAsNumber, Number(input.min), Number(input.max)) - Number(input.dataset.initial),
        (this.advancement.configuration.cap - (this.advancement.configuration.fixed[key] ?? 0)) ?? Infinity
      );
    }
    this.render();
  }

  /* -------------------------------------------- */

  /**
   * Handle clicking the plus and minus buttons.
   * @param {Event} event  Triggering click event.
   */
  _onClickButton(event) {
    event.preventDefault();
    const action = event.currentTarget.dataset.action;
    const key = event.currentTarget.closest("li").dataset.score;

    this.assignments[key] ??= 0;
    if ( action === "decrease" ) this.assignments[key] -= 1;
    else if ( action === "increase" ) this.assignments[key] += 1;
    else return;

    this.render();
  }

  /* -------------------------------------------- */

  /**
   * Handle clicking on a feature during item grant to preview the feature.
   * @param {MouseEvent} event  The triggering event.
   * @protected
   */
  async _onClickFeature(event) {
    event.preventDefault();
    const uuid = event.currentTarget.dataset.uuid;
    const item = await fromUuid(uuid);
    item?.sheet.render(true);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _updateObject(event, formData) {
    // TODO: Pass through retained feat data
    await this.advancement.apply(this.level, {
      type: this.feat ? "feat" : "asi",
      assignments: this.assignments,
      featUuid: this.feat?.uuid,
      retainedItems: this.retainedData?.retainedItems
    });
  }

  /* -------------------------------------------- */
  /*  Drag & Drop                                 */
  /* -------------------------------------------- */

  /**
   * Handle deleting a dropped feat.
   * @param {Event} event  The originating click event.
   * @protected
   */
  async _onItemDelete(event) {
    event.preventDefault();
    this.feat = null;
    this.render();
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onDrop(event) {
    if ( !this.advancement.allowFeat ) return false;

    // Try to extract the data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch(err) {
      return false;
    }

    if ( data.type !== "Item" ) return false;
    const item = await Item.implementation.fromDropData(data);

    if ( (item.type !== "feat") || (item.system.type.value !== "feat") ) {
      ui.notifications.error("SENTIUS.ADVANCEMENT.AbilityScoreImprovement.Warning.Type", {localize: true});
      return null;
    }

    // If a feat has a level pre-requisite, make sure it is less than or equal to current character level
    if ( (item.system.prerequisites?.level ?? -Infinity) > this.advancement.actor.system.details.level ) {
      ui.notifications.error(game.i18n.format("SENTIUS.ADVANCEMENT.AbilityScoreImprovement.Warning.Level", {
        level: item.system.prerequisites.level
      }));
      return null;
    }

    this.feat = item;
    this.render();
  }
}