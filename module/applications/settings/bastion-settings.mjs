import BaseSettingsConfig from "./base-settings.mjs";

/**
 * An application for configuring bastion settings.
 */
export default class BastionSettingsConfig extends BaseSettingsConfig {
  /** @override */
  static DEFAULT_OPTIONS = {
    window: {
      title: "SENTIUS.Bastion.Configuration.Label"
    }
  };

  /** @override */
  static PARTS = {
    ...super.PARTS,
    config: {
      template: "systems/sentius/templates/settings/bastion-config.hbs"
    }
  };

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    context.fields = BastionSetting.schema.fields;
    context.source = game.settings.get("sentius", "bastionConfiguration");
    return context;
  }
}

/* -------------------------------------------- */

const { BooleanField, NumberField } = foundry.data.fields;

/**
 * A data model that represents the Bastion configuration options.
 */
export class BastionSetting extends foundry.abstract.DataModel {
  /** @override */
  static defineSchema() {
    return {
      button: new BooleanField({
        required: true, label: "SENTIUS.Bastion.Button.Label", hint: "SENTIUS.Bastion.Button.Hint"
      }),
      duration: new NumberField({
        required: true, positive: true, integer: true, initial: 7, label: "SENTIUS.Bastion.Duration.Label"
      }),
      enabled: new BooleanField({
        required: true, label: "SENTIUS.Bastion.Enabled.Label", hint: "SENTIUS.Bastion.Enabled.Hint"
      })
    };
  }
}
