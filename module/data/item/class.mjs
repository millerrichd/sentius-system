import TraitAdvancement from "../../documents/advancement/trait.mjs";
import { ItemDataModel } from "../abstract.mjs";
import AdvancementField from "../fields/advancement-field.mjs";
import FormulaField from "../fields/formula-field.mjs";
import SpellcastingField from "./fields/spellcasting-field.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import StartingEquipmentTemplate from "./templates/starting-equipment.mjs";

const { ArrayField, BooleanField, NumberField, SchemaField, SetField, StringField } = foundry.data.fields;

/**
 * Data definition for Class items.
 * @mixes ItemDescriptionTemplate
 * @mixes StartingEquipmentTemplate
 *
 * @property {number} levels                    Current number of levels in this class.
 * @property {object} primaryAbility
 * @property {Set<string>} primaryAbility.value List of primary abilities used by this class.
 * @property {boolean} primaryAbility.all       If multiple abilities are selected, does multiclassing require all of
 *                                              them to be 13 or just one.
 * @property {object} hd                        Object describing hit dice properties.
 * @property {string} hd.additional             Additional hit dice beyond the level of the class.
 * @property {string} hd.denomination           Denomination of hit dice available as defined in `SENTIUS.hitDieTypes`.
 * @property {number} hd.spent                  Number of hit dice consumed.
 * @property {object[]} advancement             Advancement objects for this class.
 * @property {SpellcastingField} spellcasting   Details on class's spellcasting ability.
 */
export default class ClassData extends ItemDataModel.mixin(ItemDescriptionTemplate, StartingEquipmentTemplate) {

  /* -------------------------------------------- */
  /*  Model Configuration                         */
  /* -------------------------------------------- */

  /** @override */
  static LOCALIZATION_PREFIXES = ["SENTIUS.CLASS", "SENTIUS.SOURCE"];

  /* -------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema(super.defineSchema(), {
      levels: new NumberField({ required: true, nullable: false, integer: true, min: 0, initial: 1 }),
      primaryAbility: new SchemaField({
        value: new SetField(new StringField()),
        all: new BooleanField({ initial: true })
      }),
      hd: new SchemaField({
        additional: new FormulaField({ deterministic: true, required: true }),
        denomination: new StringField({
          required: true, initial: "d6", blank: false,
          validate: v => /d\d+/.test(v), validationError: "must be a dice value in the format d#"
        }),
        spent: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 })
      }),
      advancement: new ArrayField(new AdvancementField(), { label: "SENTIUS.AdvancementTitle" }),
      spellcasting: new SpellcastingField()
    });
  }

  /* -------------------------------------------- */

  /** @override */
  static get compendiumBrowserFilters() {
    return new Map([
      ["hasSpellcasting", {
        label: "SENTIUS.CompendiumBrowser.Filters.HasSpellcasting",
        type: "boolean",
        createFilter: (filters, value, def) => {
          if ( value === 0 ) return;
          const filter = { k: "system.spellcasting.progression", v: "none" };
          if ( value === -1 ) filters.push(filter);
          else filters.push({ o: "NOT", v: filter });
        }
      }]
    ]);
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareBaseData() {
    this.spellcasting.preparation.value = 0;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.prepareDescriptionData();
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareFinalData() {
    this.isOriginalClass = this.parent.isOriginalClass;
    const rollData = this.parent.getRollData({ deterministic: true });
    SpellcastingField.prepareData.call(this, rollData);
    this.hd.additional = this.hd.additional ? Roll.create(this.hd.additional, rollData).evaluateSync().total : 0;
    this.hd.max = Math.max(this.levels + this.hd.additional, 0);
    this.hd.value = Math.max(this.hd.max - this.hd.spent, 0);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async getFavoriteData() {
    const context = await super.getFavoriteData();
    if ( this.parent.subclass ) context.subtitle = this.parent.subclass.name;
    context.value = this.levels;
    return context;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async getSheetData(context) {
    context.subtitles = [{ label: context.itemType }];
    context.singleDescription = true;
    context.parts = ["sentius.details-class", "sentius.details-spellcasting", "sentius.details-starting-equipment"];
    context.primaryAbilities = Object.entries(CONFIG.SENTIUS.abilities).map(([value, data]) => ({
      value, label: data.label, selected: this.primaryAbility.value.has(value)
    }));
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static _migrateData(source) {
    super._migrateData(source);
    ClassData.#migrateHitDice(source);
    ClassData.#migrateLevels(source);
    ClassData.#migrateSpellcastingData(source);
  }

  /* -------------------------------------------- */

  /**
   * Migrate the hit dice data.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static #migrateHitDice(source) {
    if ( foundry.utils.getType(source.hitDice) === "string" ) {
      source.hd ??= {};
      source.hd.denomination = source.hitDice;
      source.hd.spent = source.hitDiceUsed ?? 0;
    }
  }

  /* -------------------------------------------- */

  /**
   * Migrate the class levels.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static #migrateLevels(source) {
    if ( typeof source.levels !== "string" ) return;
    if ( source.levels === "" ) source.levels = 1;
    else if ( Number.isNumeric(source.levels) ) source.levels = Number(source.levels);
  }

  /* -------------------------------------------- */

  /**
   * Migrate the class's spellcasting string to object.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static #migrateSpellcastingData(source) {
    if ( source.spellcasting?.progression === "" ) source.spellcasting.progression = "none";
    if ( typeof source.spellcasting !== "string" ) return;
    source.spellcasting = {
      progression: source.spellcasting,
      ability: ""
    };
  }

  /* -------------------------------------------- */

  /**
   * Migrate the class's saves & skills into TraitAdvancements.
   * @param {object} source  The candidate source data from which the model will be constructed.
   * @protected
   */
  static _migrateTraitAdvancement(source) {
    const system = source.system;
    if ( !system?.advancement || system.advancement.find(a => a.type === "Trait") ) return;
    let needsMigration = false;

    if ( system.saves?.length ) {
      const savesData = {
        type: "Trait",
        level: 1,
        configuration: {
          grants: system.saves.map(t => `saves:${t}`)
        }
      };
      savesData.value = {
        chosen: savesData.configuration.grants
      };
      system.advancement.push(new TraitAdvancement(savesData).toObject());
      delete system.saves;
      needsMigration = true;
    }

    if ( system.skills?.choices?.length ) {
      const skillsData = {
        type: "Trait",
        level: 1,
        configuration: {
          choices: [{
            count: system.skills.number ?? 1,
            pool: system.skills.choices.map(t => `skills:${t}`)
          }]
        }
      };
      if ( system.skills.value?.length ) {
        skillsData.value = {
          chosen: system.skills.value.map(t => `skills:${t}`)
        };
      }
      system.advancement.push(new TraitAdvancement(skillsData).toObject());
      delete system.skills;
      needsMigration = true;
    }

    if ( needsMigration ) foundry.utils.setProperty(source, "flags.sentius.persistSourceMigration", true);
  }

  /* -------------------------------------------- */
  /*  Socket Event Handlers                       */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onCreate(data, options, userId) {
    await super._onCreate(data, options, userId);
    const actor = this.parent.actor;
    if ( !actor || (userId !== game.user.id) ) return;

    if ( actor.type === "character" ) {
      const pc = actor.items.get(actor.system.details.originalClass);
      if ( !pc ) await actor._assignPrimaryClass();
    }

    if ( !actor.system.attributes?.spellcasting && this.parent.spellcasting?.ability ) {
      await actor.update({ "system.attributes.spellcasting": this.parent.spellcasting.ability });
    }
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preUpdate(changed, options, user) {
    if ( (await super._preUpdate(changed, options, user)) === false ) return false;
    if ( !("levels" in (changed.system ?? {})) ) return;

    // Check to make sure the updated class level isn't below zero
    if ( changed.system.levels <= 0 ) {
      ui.notifications.warn("SENTIUS.MaxClassLevelMinimumWarn", { localize: true });
      changed.system.levels = 1;
    }

    // Check to make sure the updated class level doesn't exceed level cap
    if ( changed.system.levels > CONFIG.SENTIUS.maxLevel ) {
      ui.notifications.warn(game.i18n.format("SENTIUS.MaxClassLevelExceededWarn", { max: CONFIG.SENTIUS.maxLevel }));
      changed.system.levels = CONFIG.SENTIUS.maxLevel;
    }

    if ( this.parent.actor?.type !== "character" ) return;

    // Check to ensure the updated character doesn't exceed level cap
    const newCharacterLevel = this.parent.actor.system.details.level + (changed.system.levels - this.levels);
    if ( newCharacterLevel > CONFIG.SENTIUS.maxLevel ) {
      ui.notifications.warn(game.i18n.format("SENTIUS.MaxCharacterLevelExceededWarn", { max: CONFIG.SENTIUS.maxLevel }));
      changed.system.levels -= newCharacterLevel - CONFIG.SENTIUS.maxLevel;
    }
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
    if ( userId !== game.user.id ) return;
    if ( this.parent.id === this.parent.actor?.system.details?.originalClass ) {
      this.parent.actor._assignPrimaryClass();
    }
  }
}
