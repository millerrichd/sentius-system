import SystemDataModel from "../../abstract.mjs";
import IdentifierField from "../../fields/identifier-field.mjs";
import SourceField from "../../shared/source-field.mjs";

const { SchemaField, HTMLField } = foundry.data.fields;

/**
 * Data model template with item description & source.
 *
 * @property {object} description               Various item descriptions.
 * @property {string} description.value         Full item description.
 * @property {string} description.chat          Description displayed in chat card.
 * @property {string} identifier                Identifier slug for this item.
 * @property {SourceData} source                Adventure or sourcebook where this item originated.
 * @mixin
 */
export default class ItemDescriptionTemplate extends SystemDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return {
      description: new SchemaField({
        value: new HTMLField({required: true, nullable: true, label: "SENTIUS.Description"}),
        chat: new HTMLField({required: true, nullable: true, label: "SENTIUS.DescriptionChat"})
      }),
      identifier: new IdentifierField({ required: true, label: "SENTIUS.Identifier" }),
      source: new SourceField()
    };
  }

  /* -------------------------------------------- */
  /*  Data Migrations                             */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static _migrateData(source) {
    super._migrateData(source);
    ItemDescriptionTemplate.#migrateSource(source);
  }

  /* -------------------------------------------- */

  /**
   * Convert source string into custom object.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static #migrateSource(source) {
    if ( ("source" in source) && (foundry.utils.getType(source.source) !== "Object") ) {
      source.source = { custom: source.source };
    }
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /**
   * Prepare the source label.
   */
  prepareDescriptionData() {
    const uuid = this.parent.flags.sentius?.sourceId ?? this.parent._stats?.compendiumSource ?? this.parent.uuid;
    SourceField.prepareData.call(this.source, uuid);
  }

  /* -------------------------------------------- */
  /*  Getters                                     */
  /* -------------------------------------------- */

  /**
   * What properties can be used for this item?
   * @returns {Set<string>}
   */
  get validProperties() {
    return new Set(CONFIG.SENTIUS.validProperties[this.parent.type] ?? []);
  }

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /**
   * Create the properties filter configuration for a type.
   * @param {string} type  Item type.
   * @returns {CompendiumBrowserFilterDefinitionEntry}
   */
  static compendiumBrowserPropertiesFilter(type) {
    return {
      label: "SENTIUS.Properties",
      type: "set",
      config: {
        choices: Object.entries(CONFIG.SENTIUS.itemProperties).reduce((obj, [k, v]) => {
          if ( CONFIG.SENTIUS.validProperties[type]?.has(k) ) obj[k] = v;
          return obj;
        }, {}),
        keyPath: "system.properties",
        multiple: true
      }
    };
  }
}
