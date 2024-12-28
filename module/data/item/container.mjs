import { ItemDataModel } from "../abstract.mjs";
import EquippableItemTemplate from "./templates/equippable-item.mjs";
import IdentifiableTemplate from "./templates/identifiable.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import PhysicalItemTemplate from "./templates/physical-item.mjs";
import CurrencyTemplate from "../shared/currency.mjs";

const { NumberField, SchemaField, SetField, StringField } = foundry.data.fields;

/**
 * Data definition for Container items.
 * @mixes ItemDescriptionTemplate
 * @mixes IdentifiableTemplate
 * @mixes PhysicalItemTemplate
 * @mixes EquippableItemTemplate
 * @mixes CurrencyTemplate
 *
 * @property {Set<string>} properties       Container properties.
 * @property {object} capacity              Information on container's carrying capacity.
 * @property {string} capacity.type         Method for tracking max capacity as defined in `SENTIUS.itemCapacityTypes`.
 * @property {number} capacity.value        Total amount of the type this container can carry.
 */
export default class ContainerData extends ItemDataModel.mixin(
  ItemDescriptionTemplate, IdentifiableTemplate, PhysicalItemTemplate, EquippableItemTemplate, CurrencyTemplate
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
      quantity: new NumberField({ min: 1, max: 1 }),
      properties: new SetField(new StringField(), { label: "SENTIUS.ItemContainerProperties" }),
      capacity: new SchemaField({
        type: new StringField({
          required: true, initial: "weight", blank: false, label: "SENTIUS.ItemContainerCapacityType"
        }),
        value: new NumberField({ required: true, min: 0, label: "SENTIUS.ItemContainerCapacityMax" })
      }, { label: "SENTIUS.ItemContainerCapacity" })
    });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  static metadata = Object.freeze(foundry.utils.mergeObject(super.metadata, {
    enchantable: true,
    inventoryItem: true,
    inventoryOrder: 500
  }, {inplace: false}));

  /* -------------------------------------------- */

  /** @override */
  static get compendiumBrowserFilters() {
    return new Map([
      ["attunement", this.compendiumBrowserAttunementFilter],
      ...this.compendiumBrowserPhysicalItemFilters,
      ["properties", this.compendiumBrowserPropertiesFilter("container")]
    ]);
  }

  /* -------------------------------------------- */
  /*  Data Migrations                             */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static _migrateData(source) {
    super._migrateData(source);
    ContainerData.#migrateQuantity(source);
  }

  /* -------------------------------------------- */

  /**
   * Migrate the weightless property into `properties`.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static _migrateWeightlessData(source) {
    if ( foundry.utils.getProperty(source, "system.capacity.weightless") === true ) {
      foundry.utils.setProperty(source, "flags.sentius.migratedProperties", ["weightlessContents"]);
    }
  }

  /* -------------------------------------------- */

  /**
   * Force quantity to always be 1.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static #migrateQuantity(source) {
    source.quantity = 1;
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
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareFinalData() {
    this.prepareFinalEquippableData();
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async getFavoriteData() {
    const data = super.getFavoriteData();
    const capacity = await this.computeCapacity();
    if ( Number.isFinite(capacity.max) ) return foundry.utils.mergeObject(await data, { uses: capacity });
    return await data;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async getSheetData(context) {
    context.subtitles = [
      { label: context.itemType },
      ...this.physicalItemSheetFields
    ];
    context.parts = ["sentius.details-container"];
  }

  /* -------------------------------------------- */
  /*  Getters                                     */
  /* -------------------------------------------- */

  /**
   * Get all of the items contained in this container. A promise if item is within a compendium.
   * @type {Collection<Item5e>|Promise<Collection<Item5e>>}
   */
  get contents() {
    if ( !this.parent ) return new foundry.utils.Collection();

    // If in a compendium, fetch using getDocuments and return a promise
    if ( this.parent.pack && !this.parent.isEmbedded ) {
      const pack = game.packs.get(this.parent.pack);
      return pack.getDocuments({system: { container: this.parent.id }}).then(d =>
        new foundry.utils.Collection(d.map(d => [d.id, d]))
      );
    }

    // Otherwise use local document collection
    return (this.parent.isEmbedded ? this.parent.actor.items : game.items).reduce((collection, item) => {
      if ( item.system.container === this.parent.id ) collection.set(item.id, item);
      return collection;
    }, new foundry.utils.Collection());
  }

  /* -------------------------------------------- */

  /**
   * Get all of the items in this container and any sub-containers. A promise if item is within a compendium.
   * @type {Collection<Item5e>|Promise<Collection<Item5e>>}
   */
  get allContainedItems() {
    if ( !this.parent ) return new foundry.utils.Collection();
    if ( this.parent.pack ) return this.#allContainedItems();

    return this.contents.reduce((collection, item) => {
      collection.set(item.id, item);
      if ( item.type === "container" ) item.system.allContainedItems.forEach(i => collection.set(i.id, i));
      return collection;
    }, new foundry.utils.Collection());
  }

  /**
   * Asynchronous helper method for fetching all contained items from a compendium.
   * @returns {Promise<Collection<Item5e>>}
   * @private
   */
  async #allContainedItems() {
    return (await this.contents).reduce(async (promise, item) => {
      const collection = await promise;
      collection.set(item.id, item);
      if ( item.type === "container" ) (await item.system.allContainedItems).forEach(i => collection.set(i.id, i));
      return collection;
    }, new foundry.utils.Collection());
  }

  /* -------------------------------------------- */

  /**
   * Fetch a specific contained item.
   * @param {string} id                 ID of the item to fetch.
   * @returns {Item5e|Promise<Item5e>}  Item if found.
   */
  getContainedItem(id) {
    if ( this.parent?.isEmbedded ) return this.parent.actor.items.get(id);
    if ( this.parent?.pack ) return game.packs.get(this.parent.pack)?.getDocument(id);
    return game.items.get(id);
  }

  /* -------------------------------------------- */

  /**
   * Number of items contained in this container including items in sub-containers. Result is a promise if item
   * is within a compendium.
   * @type {number|Promise<number>}
   */
  get contentsCount() {
    const reducer = (count, item) => count + item.system.quantity;
    const items = this.allContainedItems;
    if ( items instanceof Promise ) return items.then(items => items.reduce(reducer, 0));
    return items.reduce(reducer, 0);
  }

  /* -------------------------------------------- */

  /**
   * Weight of the items in this container. Result is a promise if item is within a compendium.
   * @type {number|Promise<number>}
   */
  get contentsWeight() {
    if ( this.parent?.pack && !this.parent?.isEmbedded ) return this.#contentsWeight();
    return this.contents.reduce((weight, item) =>
      weight + item.system.totalWeightIn(this.weight.units), this.currencyWeight
    );
  }

  /**
   * Asynchronous helper method for calculating the weight of items in a compendium.
   * @returns {Promise<number>}
   */
  async #contentsWeight() {
    const contents = await this.contents;
    return contents.reduce(async (weight, item) =>
      await weight + await item.system.totalWeightIn(this.weight.units), this.currencyWeight
    );
  }

  /* -------------------------------------------- */

  /**
   * The weight of this container with all of its contents. Result is a promise if item is within a compendium.
   * @type {number|Promise<number>}
   */
  get totalWeight() {
    if ( this.properties.has("weightlessContents") ) return this.weight.value;
    const containedWeight = this.contentsWeight;
    if ( containedWeight instanceof Promise ) return containedWeight.then(c => this.weight.value + c);
    return this.weight.value + containedWeight;
  }

  /* -------------------------------------------- */

  /**
   * @typedef {object} Item5eCapacityDescriptor
   * @property {number} value  The current total weight or number of items in the container.
   * @property {number} max    The maximum total weight or number of items in the container.
   * @property {number} pct    The percentage of total capacity.
   * @property {string} units  The units label.
   */

  /**
   * Compute capacity information for this container.
   * @returns {Promise<Item5eCapacityDescriptor>}
   */
  async computeCapacity() {
    const { value, type } = this.capacity;
    const context = { max: value ?? Infinity };
    if ( type === "weight" ) {
      context.value = await this.contentsWeight;
      context.units = game.i18n.localize("SENTIUS.AbbreviationLbs");
    } else {
      context.value = await this.contentsCount;
      context.units = game.i18n.localize("SENTIUS.ItemContainerCapacityItems");
    }
    context.value = context.value.toNearest(0.1);
    context.pct = Math.clamp(context.max ? (context.value / context.max) * 100 : 0, 0, 100);
    return context;
  }

  /* -------------------------------------------- */
  /*  Socket Event Handlers                       */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preUpdate(changed, options, user) {
    if ( (await super._preUpdate(changed, options, user)) === false ) return false;
    await this.preUpdateIdentifiable(changed, options, user);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onUpdate(changed, options, userId) {
    // Keep contents folder synchronized with container
    if ( (game.user.id === userId) && foundry.utils.hasProperty(changed, "folder") ) {
      const contents = await this.contents;
      await Item.updateDocuments(contents.map(c => ({ _id: c.id, folder: changed.folder })), {
        parent: this.parent.parent, pack: this.parent.pack, ...options, render: false
      });
    }

    super._onUpdate(changed, options, userId);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onDelete(options, userId) {
    super._onDelete(options, userId);
    if ( (userId !== game.user.id) || !options.deleteContents ) return;

    // Delete a container's contents when it is deleted
    const contents = await this.allContainedItems;
    if ( contents?.size ) await Item.deleteDocuments(Array.from(contents.map(i => i.id)), {
      pack: this.parent.pack,
      parent: this.parent.parent
    });
  }
}
