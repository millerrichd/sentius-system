const { SetField, StringField } = foundry.data.fields;

/**
 * Configuration data for the size advancement type.
 */
export class SizeConfigurationData extends foundry.abstract.DataModel {
  /** @inheritDoc */
  static defineSchema() {
    return {
      sizes: new SetField(new StringField(), { required: false, initial: ["med"], label: "SENTIUS.Size" })
    };
  }

  /* -------------------------------------------- */

  get hint() {
    foundry.utils.logCompatibilityWarning(
      "Advancement hints are now part of the base data model.",
      { since: "SENTIUS", until: "SENTIUS" }
    );
    return this.parent.hint ?? "";
  }
}

/**
 * Value data for the size advancement type.
 */
export class SizeValueData extends foundry.abstract.DataModel {
  /** @inheritDoc */
  static defineSchema() {
    return {
      size: new StringField({ required: false, label: "SENTIUS.Size" })
    };
  }
}
