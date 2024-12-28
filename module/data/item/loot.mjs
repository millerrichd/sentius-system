import { ItemDataModel } from "../abstract.mjs";
import IdentifiableTemplate from "./templates/identifiable.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import ItemTypeTemplate from "./templates/item-type.mjs";
import PhysicalItemTemplate from "./templates/physical-item.mjs";
import ItemTypeField from "./fields/item-type-field.mjs";

const { SetField, StringField } = foundry.data.fields;

/**
 * Data definition for Loot items.
 * @mixes ItemDescriptionTemplate
 * @mixes ItemTypeTemplate
 * @mixes IdentifiableTemplate
 * @mixes PhysicalItemTemplate
 */
export default class LootData extends ItemDataModel.mixin(
  ItemDescriptionTemplate, IdentifiableTemplate, ItemTypeTemplate, PhysicalItemTemplate
) {

  /* -------------------------------------------- */
  /*  Model Configuration                         */
  /* -------------------------------------------- */

  /** @override */
  static LOCALIZATION_PREFIXES = ["SENTIUS.SOURCE"];

  /* -------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema(super.defineSchema(), {
      properties: new SetField(new StringField(), { label: "SENTIUS.ItemLootProperties" }),
      type: new ItemTypeField({ baseItem: false }, { label: "SENTIUS.ItemLootType" })
    });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  static metadata = Object.freeze(foundry.utils.mergeObject(super.metadata, {
    enchantable: true,
    inventoryItem: true,
    inventoryOrder: 600
  }, {inplace: false}));

  /* -------------------------------------------- */

  /** @override */
  static get compendiumBrowserFilters() {
    return new Map([
      ["type", {
        label: "SENTIUS.ItemLootType",
        type: "set",
        config: {
          choices: CONFIG.SENTIUS.lootTypes,
          keyPath: "system.type.value"
        }
      }],
      ...this.compendiumBrowserPhysicalItemFilters,
      ["properties", this.compendiumBrowserPropertiesFilter("loot")]
    ]);
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.prepareDescriptionData();
    this.prepareIdentifiable();
    this.preparePhysicalData();
    this.type.label = CONFIG.SENTIUS.lootTypes[this.type.value]?.label ?? game.i18n.localize(CONFIG.Item.typeLabels.loot);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async getSheetData(context) {
    context.subtitles = [
      { label: this.type.label },
      ...this.physicalItemSheetFields
    ];
    context.parts = ["sentius.details-loot"];
  }

  /* -------------------------------------------- */
  /*  Getters                                     */
  /* -------------------------------------------- */

  /**
   * Properties displayed in chat.
   * @type {string[]}
   */
  get chatProperties() {
    return [
      this.type.label,
      this.weight ? `${this.weight.value} ${game.i18n.localize("SENTIUS.AbbreviationLbs")}` : null,
      this.priceLabel
    ];
  }

  /* -------------------------------------------- */

  /** @override */
  static get itemCategories() {
    return CONFIG.SENTIUS.lootTypes;
  }

  /* -------------------------------------------- */
  /*  Socket Event Handlers                       */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preUpdate(changed, options, user) {
    if ( (await super._preUpdate(changed, options, user)) === false ) return false;
    await this.preUpdateIdentifiable(changed, options, user);
  }
}