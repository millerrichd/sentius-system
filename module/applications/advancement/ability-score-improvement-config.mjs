import AdvancementConfig from "./advancement-config.mjs";

/**
 * Configuration application for ability score improvements.
 */
export default class AbilityScoreImprovementConfig extends AdvancementConfig {

  /** @inheritDoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/sentius/templates/advancement/ability-score-improvement-config.hbs"
    });
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  getData() {
    const abilities = Object.entries(CONFIG.SENTIUS.abilities).reduce((obj, [key, data]) => {
      if ( !this.advancement.canImprove(key) ) return obj;
      const fixed = this.advancement.configuration.fixed[key] ?? 0;
      obj[key] = {
        key,
        name: `configuration.fixed.${key}`,
        label: data.label,
        locked: this.advancement.configuration.locked.has(key),
        value: fixed,
        canIncrease: true,
        canDecrease: true
      };
      return obj;
    }, {});

    return foundry.utils.mergeObject(super.getData(), {
      abilities,
      points: {
        key: "points",
        name: "configuration.points",
        label: game.i18n.localize("SENTIUS.ADVANCEMENT.AbilityScoreImprovement.FIELDS.points.label"),
        min: 0,
        value: this.advancement.configuration.points,
        canIncrease: true,
        canDecrease: this.advancement.configuration.points > 0
      }
    });
  }

  /* -------------------------------------------- */
  /*  Event Listeners & Handlers                  */
  /* -------------------------------------------- */

  /** @override */
  async prepareConfigurationUpdate(configuration) {
    configuration.locked = configuration.locked?.filter(l => l);
    return configuration;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".adjustment-button").click(this._onClickButton.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * Handle clicking the plus and minus buttons.
   * @param {Event} event  Triggering click event.
   */
  _onClickButton(event) {
    event.preventDefault();
    const action = event.currentTarget.dataset.action;
    const input = event.currentTarget.closest("li").querySelector("input");

    if ( action === "decrease" ) input.valueAsNumber -= 1;
    else if ( action === "increase" ) input.valueAsNumber += 1;

    this.submit();
  }
}
