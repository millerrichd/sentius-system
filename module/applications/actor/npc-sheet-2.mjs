import ActorSheet5eNPC from "./npc-sheet.mjs";
import ActorSheetV2Mixin from "./sheet-v2-mixin.mjs";
import { simplifyBonus } from "../../utils.mjs";

/**
 * An Actor sheet for NPCs.
 * @mixes ActorSheetV2
 */
export default class ActorSheet5eNPC2 extends ActorSheetV2Mixin(ActorSheet5eNPC) {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sentius2", "sheet", "actor", "npc", "vertical-tabs"],
      width: 700,
      height: 700,
      resizable: true,
      scrollY: [".sheet-body"],
      tabs: [{ navSelector: ".tabs", contentSelector: ".tab-body", initial: "features" }]
    });
  }

  /** @override */
  static TABS = [
    { tab: "features", label: "SENTIUS.Features", icon: "fas fa-list" },
    { tab: "inventory", label: "SENTIUS.Inventory", svg: "backpack" },
    { tab: "spells", label: "TYPES.Item.spellPl", icon: "fas fa-book" },
    { tab: "effects", label: "SENTIUS.Effects", icon: "fas fa-bolt" },
    { tab: "biography", label: "SENTIUS.Biography", icon: "fas fa-feather" }
  ];

  /**
   * The description currently being edited.
   * @type {string|null}
   */
  editingDescriptionTarget = null;

  /* -------------------------------------------- */

  /** @override */
  get template() {
    if ( !game.user.isGM && this.actor.limited ) return "systems/sentius/templates/actors/limited-sheet-2.hbs";
    return "systems/sentius/templates/actors/npc-sheet-2.hbs";
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _renderOuter() {
    const html = await super._renderOuter();
    this._renderSourceOuter(html);
    // XP value.
    html[0].querySelector(".header-elements")?.insertAdjacentHTML("beforeend", '<div class="cr-xp"></div>');
    return html;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _render(force=false, options={}) {
    await super._render(force, options);
    this._renderSource();
    const [elements] = this.element.find(".header-elements");
    if ( !elements || this.actor.limited ) return;
    const xp = this.actor.system.details.xp.value;
    elements.querySelector(".cr-xp").innerHTML = xp === null ? "" : game.i18n.format("SENTIUS.ExperiencePointsFormat", {
      value: new Intl.NumberFormat(game.i18n.lang).format(xp)
    });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async getData(options) {
    const context = await super.getData(options);
    const { attributes, resources } = this.actor.system;
    context.encumbrance = attributes.encumbrance;

    // Ability Scores
    Object.entries(context.abilities).forEach(([k, ability]) => {
      ability.key = k;
      ability.abbr = CONFIG.SENTIUS.abilities[k]?.abbreviation ?? "";
      ability.baseValue = context.source.abilities[k]?.value ?? 0;
      ability.icon = CONFIG.SENTIUS.abilities[k]?.icon;
    });

    // Show Death Saves
    context.showDeathSaves = !foundry.utils.isEmpty(this.actor.classes)
      || this.actor.getFlag("sentius", "showDeathSaves");

    // Speed
    context.speed = Object.entries(CONFIG.SENTIUS.movementTypes).reduce((obj, [k, label]) => {
      const value = attributes.movement[k];
      if ( value ) {
        obj[k] = { label, value };
        if ( (k === "fly") && attributes.movement.hover ) obj.fly.icons = [{
          icon: "fas fa-cloud", label: game.i18n.localize("SENTIUS.MovementHover")
        }];
      }
      return obj;
    }, {});

    // Skills & Tools
    const skillSetting = new Set(game.settings.get("sentius", "defaultSkills"));
    context.skills = Object.fromEntries(Object.entries(context.skills).filter(([k, v]) => {
      return v.value || skillSetting.has(k) || v.bonuses.check || v.bonuses.passive;
    }));

    // Senses
    if ( this.actor.system.skills.prc ) {
      context.senses.passivePerception = {
        label: game.i18n.localize("SENTIUS.PassivePerception"), value: this.actor.system.skills.prc.passive
      };
    }

    // Legendary Actions & Resistances
    const plurals = new Intl.PluralRules(game.i18n.lang, { type: "ordinal" });
    ["legact", "legres"].forEach(res => {
      const { max, value } = resources[res];
      context[res] = Array.fromRange(max, 1).map(n => {
        const i18n = res === "legact" ? "LegAct" : "LegRes";
        const filled = value >= n;
        const classes = ["pip"];
        if ( filled ) classes.push("filled");
        return {
          n, filled,
          tooltip: `SENTIUS.${i18n}`,
          label: game.i18n.format(`SENTIUS.${i18n}N.${plurals.select(n)}`, { n }),
          classes: classes.join(" ")
        };
      });
    });
    context.hasLegendaries = resources.legact.max || resources.legres.max || resources.lair.initiative;

    // Spellcasting
    this._prepareSpellcasting(context);

    // Biographies
    const enrichmentOptions = {
      secrets: this.actor.isOwner, relativeTo: this.actor, rollData: context.rollData
    };

    context.enriched = {
      public: await TextEditor.enrichHTML(this.actor.system.details.biography.public, enrichmentOptions),
      value: context.biographyHTML
    };

    if ( this.editingDescriptionTarget ) {
      context.editingDescriptionTarget = this.editingDescriptionTarget;
      context.enriched.editing = this.editingDescriptionTarget.endsWith("public")
        ? context.enriched.public
        : context.enriched.value;
    }

    return context;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _prepareItems(context) {
    super._prepareItems(context);
    const classes = [];
    const inventory = {};
    const inventoryTypes = Object.entries(CONFIG.Item.dataModels)
      .filter(([, model]) => model.metadata?.inventoryItem)
      .sort(([, lhs], [, rhs]) => (lhs.metadata.inventoryOrder - rhs.metadata.inventoryOrder));
    for ( const [type] of inventoryTypes ) {
      inventory[type] = { label: `${CONFIG.Item.typeLabels[type]}Pl`, items: [], dataset: { type } };
      if ( type === "container" ) context.containers = inventory.container.items;
    }
    const features = context.features.filter(section => {
      if ( section.dataset.type === "loot" ) {
        section.items.forEach(i => inventory[i.type]?.items.push(i));
        return false;
      }
      if ( (section.dataset.type === "feat") ) {
        if ( !("activation.type" in section.dataset) ) section.dataset.type = "passive";
        for ( let i = section.items.length; i--; ) {
          const item = section.items[i];
          if ( (item.type === "class") || (item.type === "subclass") ) {
            classes.push(item);
            section.items.splice(i, 1);
            context.itemContext[item.id].prefixedImage = item.img ? foundry.utils.getRoute(item.img) : null;
          }
        }
      }
      if ( section.dataset.type === "weapon" ) inventory.weapon.items = section.items;
      return true;
    });
    // TODO: These labels should be pluralised.
    Object.entries(CONFIG.SENTIUS.abilityActivationTypes).forEach(([type, label]) => features.push({
      label, items: [], hasActions: true, dataset: { type }
    }));
    context.features = {
      sections: features,
      filters: [
        { key: "action", label: "SENTIUS.Action" },
        { key: "bonus", label: "SENTIUS.BonusAction" },
        { key: "reaction", label: "SENTIUS.Reaction" },
        { key: "legendary", label: "SENTIUS.LegendaryActionLabel" },
        { key: "lair", label: "SENTIUS.LairActionLabel" }
      ]
    };
    features.forEach(section => {
      section.categories = [
        {
          classes: "item-uses", label: "SENTIUS.Uses", itemPartial: "sentius.column-uses",
          activityPartial: "sentius.activity-column-uses"
        },
        {
          classes: "item-roll", label: "SENTIUS.SpellHeader.Roll", itemPartial: "sentius.column-roll",
          activityPartial: "sentius.activity-column-roll"
        },
        {
          classes: "item-formula", label: "SENTIUS.SpellHeader.Formula", itemPartial: "sentius.column-formula",
          activityPartial: "sentius.activity-column-formula"
        },
        {
          classes: "item-controls", itemPartial: "sentius.column-feature-controls",
          activityPartial: "sentius.activity-column-controls"
        }
      ];
    });
    context.inventory = Object.values(inventory);
    context.inventory.push({ label: "SENTIUS.Contents", items: [], dataset: { type: "all" } });
    context.inventory.forEach(section => {
      section.categories = [
        { activityPartial: "sentius.activity-column-price" },
        { activityPartial: "sentius.activity-column-weight" },
        { activityPartial: "sentius.activity-column-quantity" },
        { activityPartial: "sentius.activity-column-uses" }
      ];
    });
    context.classes = classes;
    context.hasClasses = classes.length;
  }

  /* -------------------------------------------- */

  /**
   * Prepare spellcasting data for display.
   * @param {object} context  The display context.
   * @protected
   */
  _prepareSpellcasting(context) {
    const { abilities, attributes, bonuses, details } = this.actor.system;
    context.spellcasting = [];
    const msak = simplifyBonus(bonuses.msak.attack, context.rollData);
    const rsak = simplifyBonus(bonuses.rsak.attack, context.rollData);
    // TODO: Consider if we want to handle multiclassing for NPC spellcasters.
    const spellcaster = Object.values(this.actor.classes).find(cls => cls.system.spellcasting.progression !== "none");
    const ability = spellcaster?.spellcasting.ability ?? attributes.spellcasting;
    const spellAbility = abilities[ability];
    const mod = spellAbility?.mod ?? 0;
    const attackBonus = msak === rsak ? msak : 0;
    context.spellcasting.push({
      label: game.i18n.format("SENTIUS.SpellcastingClass", {
        class: spellcaster?.name ?? game.i18n.format("SENTIUS.NPC.Label")
      }),
      level: spellcaster?.system.levels ?? details.spellLevel,
      ability: {
        ability, mod,
        label: CONFIG.SENTIUS.abilities[ability]?.abbreviation
      },
      attack: mod + attributes.prof + attackBonus,
      save: spellAbility?.dc ?? 0,
      noSpellcaster: !spellcaster,
      concentration: {
        mod: attributes.concentration.save,
        tooltip: game.i18n.format("SENTIUS.AbilityConfigure", { ability: game.i18n.localize("SENTIUS.Concentration") })
      }
    });
  }

  /* -------------------------------------------- */
  /*  Event Listeners & Handlers                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".short-rest").on("click", this._onShortRest.bind(this));
    html.find(".long-rest").on("click", this._onLongRest.bind(this));

    if ( this.isEditable ) {
      html.find(".editor-edit").on("click", this._onEditBiography.bind(this));
    }
  }

  /* -------------------------------------------- */

  /**
   * Take a short rest, calling the relevant function on the Actor instance.
   * @param {Event} event             The triggering click event.
   * @returns {Promise<RestResult>}  Result of the rest action.
   * @protected
   */
  async _onShortRest(event) {
    event.preventDefault();
    await this._onSubmit(event);
    return this.actor.shortRest();
  }

  /* -------------------------------------------- */

  /**
   * Take a long rest, calling the relevant function on the Actor instance.
   * @param {Event} event             The triggering click event.
   * @returns {Promise<RestResult>}  Result of the rest action.
   * @protected
   */
  async _onLongRest(event) {
    event.preventDefault();
    await this._onSubmit(event);
    return this.actor.longRest();
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async activateEditor(name, options={}, initialContent="") {
    options.relativeLinks = true;
    options.plugins = {
      menu: ProseMirror.ProseMirrorMenu.build(ProseMirror.defaultSchema, {
        compact: true,
        destroyOnSave: true,
        onSave: () => {
          this.saveEditor(name, { remove: true });
          this.editingDescriptionTarget = null;
        }
      })
    };
    return super.activateEditor(name, options, initialContent);
  }

  /* -------------------------------------------- */

  /**
   * Handle editing a biography section.
   * @param {PointerEvent} event  The triggering event.
   * @protected
   */
  _onEditBiography(event) {
    const { target } = event.currentTarget.closest("[data-target]").dataset;
    this.editingDescriptionTarget = target;
    this.render();
  }
}