import BaseConfigSheet from "../api/base-config-sheet.mjs";

const { BooleanField } = foundry.data.fields;

/**
 * Configuration application for an actor's initiative.
 */
export default class InitiativeConfig extends BaseConfigSheet {

  /** @override */
  static DEFAULT_OPTIONS = {
    position: {
      width: 420
    }
  };

  /* -------------------------------------------- */

  /** @override */
  static PARTS = {
    config: {
      template: "systems/sentius/templates/actors/config/initiative-config.hbs"
    }
  };

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /** @override */
  get title() {
    return game.i18n.localize("SENTIUS.Initiative");
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    const source = this.document._source;

    const defaultAbility = CONFIG.SENTIUS.abilities[CONFIG.SENTIUS.defaultAbilities.initiative];
    context.abilityOptions = [
      { value: "", label: game.i18n.format("SENTIUS.DefaultSpecific", { default: defaultAbility.label.toLowerCase() }) },
      { rule: true },
      ...Object.entries(CONFIG.SENTIUS.abilities).map(([value, { label }]) => ({ value, label }))
    ];
    context.data = source.system.attributes.init;
    context.fields = this.document.system.schema.fields.attributes.fields.init.fields;

    const ability = this.document.system.attributes.init.ability || CONFIG.SENTIUS.defaultAbilities.initiative;
    const abilityConfig = CONFIG.SENTIUS.abilities[ability];
    context.ability = {
      label: game.i18n.format("SENTIUS.AbilityCheckConfigure", { ability: abilityConfig.label }),
      global: {
        field: this.document.system.schema.fields.bonuses.fields.abilities.fields.check,
        name: "system.bonuses.abilities.check",
        value: source.system.bonuses.abilities.check
      },
      local: {
        field: this.document.system.schema.fields.abilities.model.fields.bonuses.fields.check,
        name: `system.abilities.${ability}.bonuses.check`,
        value: source.system.abilities[ability]?.bonuses.check
      }
    };

    context.flags = {
      alert: {
        field: new BooleanField({ label: game.i18n.localize("SENTIUS.FlagsAlert") }),
        name: "flags.sentius.initiativeAlert",
        value: source.flags.sentius?.initiativeAlert
      },
      advantage: {
        field: new BooleanField({ label: game.i18n.localize("SENTIUS.FlagsInitiativeAdv") }),
        name: "flags.sentius.initiativeAdv",
        value: source.flags.sentius?.initiativeAdv
      }
    };

    return context;
  }
}
