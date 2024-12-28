import BaseConfigSheet from "../api/base-config-sheet.mjs";

/**
 * Configuration application for an actor's concentration checks.
 */
export default class ConcentrationConfig extends BaseConfigSheet {
  /** @override */
  static DEFAULT_OPTIONS = {
    ability: null,
    position: {
      width: 500
    }
  };

  /* -------------------------------------------- */

  /** @override */
  static PARTS = {
    config: {
      template: "systems/sentius/templates/actors/config/concentration-config.hbs"
    }
  };

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /** @override */
  get title() {
    return game.i18n.format("SENTIUS.ABILITY.Configure.Title", { ability: game.i18n.localize("SENTIUS.Concentration") });
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    const source = this.document.system._source;

    context.data = source.attributes?.concentration ?? {};
    context.fields = this.document.system.schema.fields.attributes.fields.concentration.fields;
    const ability = CONFIG.SENTIUS.abilities[CONFIG.SENTIUS.defaultAbilities.concentration]?.label?.toLowerCase();
    context.abilityOptions = [
      { value: "", label: ability ? game.i18n.format("SENTIUS.DefaultSpecific", { default: ability }) : "" },
      { rule: true },
      ...Object.entries(CONFIG.SENTIUS.abilities).map(([value, { label }]) => ({ value, label }))
    ];
    context.advantageModeOptions = [
      { value: -1, label: game.i18n.localize("SENTIUS.Disadvantage") },
      { value: 0, label: game.i18n.localize("SENTIUS.Normal") },
      { value: 1, label: game.i18n.localize("SENTIUS.Advantage") }
    ];

    if ( this.document.system.bonuses?.abilities ) context.global = {
      data: source.bonuses?.abilities ?? {},
      fields: this.document.system.schema.fields.bonuses.fields.abilities.fields
    };

    return context;
  }
}
