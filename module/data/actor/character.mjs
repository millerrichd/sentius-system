import HitDice from "../../documents/actor/hit-dice.mjs";
import Proficiency from "../../documents/actor/proficiency.mjs";
import { defaultUnits, simplifyBonus } from "../../utils.mjs";
import FormulaField from "../fields/formula-field.mjs";
import LocalDocumentField from "../fields/local-document-field.mjs";
import CreatureTypeField from "../shared/creature-type-field.mjs";
import RollConfigField from "../shared/roll-config-field.mjs";
import AttributesFields from "./templates/attributes.mjs";
import CreatureTemplate from "./templates/creature.mjs";
import DetailsFields from "./templates/details.mjs";
import TraitsFields from "./templates/traits.mjs";

const {
  ArrayField, BooleanField, HTMLField, IntegerSortField, NumberField, SchemaField, SetField, StringField
} = foundry.data.fields;

/**
 * @typedef {object} ActorFavorites5e
 * @property {"activity"|"effect"|"item"|"skill"|"slots"|"tool"} type  The favorite type.
 * @property {string} id                                    The Document UUID, skill or tool identifier, or spell slot
 *                                                          level identifier.
 * @property {number} [sort]                                The sort value.
 */

/**
 * System data definition for Characters.
 *
 * @property {object} attributes
 * @property {object} attributes.ac
 * @property {number} attributes.ac.flat                  Flat value used for flat or natural armor calculation.
 * @property {string} attributes.ac.calc                  Name of one of the built-in formulas to use.
 * @property {string} attributes.ac.formula               Custom formula to use.
 * @property {object} attributes.hp
 * @property {number} attributes.hp.value                 Current hit points.
 * @property {number} attributes.hp.max                   Override for maximum HP.
 * @property {number} attributes.hp.temp                  Temporary HP applied on top of value.
 * @property {number} attributes.hp.tempmax               Temporary change to the maximum HP.
 * @property {object} attributes.hp.bonuses
 * @property {string} attributes.hp.bonuses.level         Bonus formula applied for each class level.
 * @property {string} attributes.hp.bonuses.overall       Bonus formula applied to total HP.
 * @property {object} attributes.death
 * @property {number} attributes.death.success            Number of successful death saves.
 * @property {number} attributes.death.failure            Number of failed death saves.
 * @property {number} attributes.exhaustion               Number of levels of exhaustion.
 * @property {number} attributes.inspiration              Does this character have inspiration?
 * @property {object} bastion
 * @property {string} bastion.name                        The name of the character's bastion.
 * @property {string} bastion.description                 Additional description and details for the character's
 *                                                        bastion.
 * @property {object} details
 * @property {Item5e|string} details.background           Character's background item or name.
 * @property {string} details.originalClass               ID of first class taken by character.
 * @property {object} details.xp                          Experience points gained.
 * @property {number} details.xp.value                    Total experience points earned.
 * @property {string} details.appearance                  Description of character's appearance.
 * @property {string} details.trait                       Character's personality traits.
 * @property {string} details.ideal                       Character's ideals.
 * @property {string} details.bond                        Character's bonds.
 * @property {string} details.flaw                        Character's flaws.
 * @property {object} traits
 * @property {SimpleTraitData} traits.weaponProf             Character's weapon proficiencies.
 * @property {object} traits.weaponProf.mastery
 * @property {Set<string>} traits.weaponProf.mastery.value   Weapon masteries.
 * @property {Set<string>} traits.weaponProf.mastery.bonus   Extra mastery properties that can be chosen when making an
 *                                                           attack with a weapon that has mastery.
 * @property {SimpleTraitData} traits.armorProf              Character's armor proficiencies.
 * @property {object} resources
 * @property {ResourceData} resources.primary             Resource number one.
 * @property {ResourceData} resources.secondary           Resource number two.
 * @property {ResourceData} resources.tertiary            Resource number three.
 * @property {ActorFavorites5e[]} favorites               The character's favorites.
 */
export default class CharacterData extends CreatureTemplate {

  /** @inheritDoc */
  static metadata = Object.freeze(foundry.utils.mergeObject(super.metadata, {
    supportsAdvancement: true
  }, {inplace: false}));

  /* -------------------------------------------- */

  /** @inheritDoc */
  static _systemType = "character";

  /* -------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema(super.defineSchema(), {
      attributes: new SchemaField({
        ...AttributesFields.common,
        ...AttributesFields.creature,
        ac: new SchemaField({
          flat: new NumberField({ integer: true, min: 0, label: "SENTIUS.ArmorClassFlat" }),
          calc: new StringField({ initial: "default", label: "SENTIUS.ArmorClassCalculation" }),
          formula: new FormulaField({ deterministic: true, label: "SENTIUS.ArmorClassFormula" })
        }, { label: "SENTIUS.ArmorClass" }),
        hp: new SchemaField({
          value: new NumberField({
            nullable: false, integer: true, min: 0, initial: 0, label: "SENTIUS.HitPointsCurrent"
          }),
          max: new NumberField({
            nullable: true, integer: true, min: 0, initial: null, label: "SENTIUS.HitPointsOverride",
            hint: "SENTIUS.HitPointsOverrideHint"
          }),
          temp: new NumberField({ integer: true, initial: 0, min: 0, label: "SENTIUS.HitPointsTemp" }),
          tempmax: new NumberField({
            integer: true, initial: 0, label: "SENTIUS.HitPointsTempMax", hint: "SENTIUS.HitPointsTempMaxHint"
          }),
          bonuses: new SchemaField({
            level: new FormulaField({ deterministic: true, label: "SENTIUS.HitPointsBonusLevel" }),
            overall: new FormulaField({ deterministic: true, label: "SENTIUS.HitPointsBonusOverall" })
          })
        }, { label: "SENTIUS.HitPoints" }),
        death: new RollConfigField({
          success: new NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 0, label: "SENTIUS.DeathSaveSuccesses"
          }),
          failure: new NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 0, label: "SENTIUS.DeathSaveFailures"
          })
        }, { label: "SENTIUS.DeathSave" }),
        inspiration: new BooleanField({ required: true, label: "SENTIUS.Inspiration" })
      }, { label: "SENTIUS.Attributes" }),
      bastion: new SchemaField({
        name: new StringField({ required: true }),
        description: new HTMLField()
      }),
      details: new SchemaField({
        ...DetailsFields.common,
        ...DetailsFields.creature,
        background: new LocalDocumentField(foundry.documents.BaseItem, {
          required: true, fallback: true, label: "SENTIUS.Background"
        }),
        originalClass: new StringField({ required: true, label: "SENTIUS.ClassOriginal" }),
        xp: new SchemaField({
          value: new NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 0, label: "SENTIUS.ExperiencePointsCurrent"
          })
        }, { label: "SENTIUS.ExperiencePoints" }),
        appearance: new StringField({ required: true, label: "SENTIUS.Appearance" }),
        trait: new StringField({ required: true, label: "SENTIUS.PersonalityTraits" }),
        gender: new StringField({ label: "SENTIUS.Gender" }),
        eyes: new StringField({ label: "SENTIUS.Eyes" }),
        height: new StringField({ label: "SENTIUS.Height" }),
        faith: new StringField({ label: "SENTIUS.Faith" }),
        hair: new StringField({ label: "SENTIUS.Hair" }),
        skin: new StringField({ label: "SENTIUS.Skin" }),
        age: new StringField({ label: "SENTIUS.Age" }),
        weight: new StringField({ label: "SENTIUS.Weight" })
      }, { label: "SENTIUS.Details" }),
      traits: new SchemaField({
        ...TraitsFields.common,
        ...TraitsFields.creature,
        weaponProf: TraitsFields.makeSimpleTrait({ label: "SENTIUS.TraitWeaponProf" }, {
          extraFields: {
            mastery: new SchemaField({
              value: new SetField(new StringField()),
              bonus: new SetField(new StringField())
            })
          }
        }),
        armorProf: TraitsFields.makeSimpleTrait({ label: "SENTIUS.TraitArmorProf" })
      }, { label: "SENTIUS.Traits" }),
      resources: new SchemaField({
        primary: makeResourceField({ label: "SENTIUS.ResourcePrimary" }),
        secondary: makeResourceField({ label: "SENTIUS.ResourceSecondary" }),
        tertiary: makeResourceField({ label: "SENTIUS.ResourceTertiary" })
      }, { label: "SENTIUS.Resources" }),
      favorites: new ArrayField(new SchemaField({
        type: new StringField({ required: true, blank: false }),
        id: new StringField({ required: true, blank: false }),
        sort: new IntegerSortField()
      }), { label: "SENTIUS.Favorites" })
    });
  }

  /* -------------------------------------------- */
  /*  Data Migration                              */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static _migrateData(source) {
    super._migrateData(source);
    AttributesFields._migrateInitiative(source.attributes);
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareBaseData() {
    this.attributes.hd = new HitDice(this.parent);
    this.details.level = 0;
    this.attributes.attunement.value = 0;

    for ( const item of this.parent.items ) {
      if ( item.system.attuned ) this.attributes.attunement.value += 1;
      if ( item.type === "class" ) this.details.level += item.system.levels;
    }

    // Character proficiency bonus
    this.attributes.prof = Proficiency.calculateMod(this.details.level);

    // Experience required for next level
    const { xp, level } = this.details;
    xp.max = level >= CONFIG.SENTIUS.maxLevel ? Infinity : this.parent.getLevelExp(level || 1);
    xp.min = level ? this.parent.getLevelExp(level - 1) : 0;
    if ( Number.isFinite(xp.max) ) {
      const required = xp.max - xp.min;
      const pct = Math.round((xp.value - xp.min) * 100 / required);
      xp.pct = Math.clamp(pct, 0, 100);
    } else if ( game.settings.get("sentius", "levelingMode") === "xpBoons" ) {
      const overflow = xp.value - this.parent.getLevelExp(CONFIG.SENTIUS.maxLevel);
      xp.boonsEarned = Math.max(0, Math.floor(overflow / CONFIG.SENTIUS.epicBoonInterval));
      const progress = overflow - (CONFIG.SENTIUS.epicBoonInterval * xp.boonsEarned);
      xp.pct = Math.clamp(Math.round((progress / CONFIG.SENTIUS.epicBoonInterval) * 100), 0, 100);
    } else {
      xp.pct = 100;
    }

    AttributesFields.prepareBaseArmorClass.call(this);
    AttributesFields.prepareBaseEncumbrance.call(this);
  }

  /* -------------------------------------------- */

  /**
   * Prepare movement & senses values derived from race item.
   */
  prepareEmbeddedData() {
    if ( this.details.race instanceof Item ) {
      AttributesFields.prepareRace.call(this, this.details.race);
      this.details.type = this.details.race.system.type;
    } else {
      this.details.type = new CreatureTypeField({ swarm: false }).initialize({ value: "humanoid" }, this);
    }
    for ( const key of Object.keys(CONFIG.SENTIUS.movementTypes) ) this.attributes.movement[key] ??= 0;
    for ( const key of Object.keys(CONFIG.SENTIUS.senses) ) this.attributes.senses[key] ??= 0;
    this.attributes.movement.units ??= defaultUnits("length");
    this.attributes.senses.units ??= defaultUnits("length");
  }

  /* -------------------------------------------- */

  /**
   * Prepare remaining character data.
   */
  prepareDerivedData() {
    const rollData = this.parent.getRollData({ deterministic: true });
    const { originalSaves } = this.parent.getOriginalStats();

    this.prepareAbilities({ rollData, originalSaves });
    AttributesFields.prepareEncumbrance.call(this, rollData);
    AttributesFields.prepareExhaustionLevel.call(this);
    AttributesFields.prepareMovement.call(this);
    AttributesFields.prepareConcentration.call(this, rollData);
    TraitsFields.prepareResistImmune.call(this);

    // Hit Points
    const hpOptions = {};
    if ( this.attributes.hp.max === null ) {
      hpOptions.advancement = Object.values(this.parent.classes)
        .map(c => c.advancement.byType.HitPoints?.[0]).filter(a => a);
      hpOptions.bonus = (simplifyBonus(this.attributes.hp.bonuses.level, rollData) * this.details.level)
        + simplifyBonus(this.attributes.hp.bonuses.overall, rollData);
      hpOptions.mod = this.abilities[CONFIG.SENTIUS.defaultAbilities.hitPoints ?? "con"]?.mod ?? 0;
    }
    AttributesFields.prepareHitPoints.call(this, this.attributes.hp, hpOptions);
  }

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /**
   * Level used to determine cantrip scaling.
   * @param {Item5e} spell  Spell for which to fetch the cantrip level.
   * @returns {number}
   */
  cantripLevel(spell) {
    return this.details.level;
  }

  /* -------------------------------------------- */

  /**
   * Checks whether the item with the given relative UUID has been favorited
   * @param {string} favoriteId  The relative UUID of the item to check.
   * @returns {boolean}
   */
  hasFavorite(favoriteId) {
    return !!this.favorites.find(f => f.id === favoriteId);
  }

  /* -------------------------------------------- */

  /**
   * Add a favorite item to this actor.
   * If the given item is already favorite, this method has no effect.
   * @param {ActorFavorites5e} favorite  The favorite to add.
   * @returns {Promise<Actor5e>}
   * @throws If the item intended to be favorited does not belong to this actor.
   */
  addFavorite(favorite) {
    if ( this.hasFavorite(favorite.id) ) return Promise.resolve(this.parent);

    if ( favorite.id.startsWith(".") && fromUuidSync(favorite.id, { relative: this.parent }) === null ) {
      // Assume that an ID starting with a "." is a relative ID.
      throw new Error(`The item with id ${favorite.id} is not owned by actor ${this.parent.id}`);
    }

    let maxSort = 0;
    const favorites = this.favorites.map(f => {
      if ( f.sort > maxSort ) maxSort = f.sort;
      return { ...f };
    });
    favorites.push({ ...favorite, sort: maxSort + CONST.SORT_INTEGER_DENSITY });
    return this.parent.update({ "system.favorites": favorites });
  }

  /* -------------------------------------------- */

  /**
   * Removes the favorite with the given relative UUID or resource ID
   * @param {string} favoriteId  The relative UUID or resource ID of the favorite to remove.
   * @returns {Promise<Actor5e>}
   */
  removeFavorite(favoriteId) {
    if ( favoriteId.startsWith("resources.") ) return this.parent.update({ [`system.${favoriteId}.max`]: 0 });
    const favorites = this.favorites.filter(f => f.id !== favoriteId);
    return this.parent.update({ "system.favorites": favorites });
  }
}

/* -------------------------------------------- */

/**
 * Data structure for character's resources.
 *
 * @typedef {object} ResourceData
 * @property {number} value  Available uses of this resource.
 * @property {number} max    Maximum allowed uses of this resource.
 * @property {boolean} sr    Does this resource recover on a short rest?
 * @property {boolean} lr    Does this resource recover on a long rest?
 * @property {string} label  Displayed name.
 */

/**
 * Produce the schema field for a simple trait.
 * @param {object} schemaOptions  Options passed to the outer schema.
 * @returns {ResourceData}
 */
function makeResourceField(schemaOptions={}) {
  return new SchemaField({
    value: new NumberField({required: true, integer: true, initial: 0, labels: "SENTIUS.ResourceValue"}),
    max: new NumberField({required: true, integer: true, initial: 0, labels: "SENTIUS.ResourceMax"}),
    sr: new BooleanField({required: true, labels: "SENTIUS.ShortRestRecovery"}),
    lr: new BooleanField({required: true, labels: "SENTIUS.LongRestRecovery"}),
    label: new StringField({required: true, labels: "SENTIUS.ResourceLabel"})
  }, schemaOptions);
}