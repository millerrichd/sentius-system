import ShortRestDialog from "../../applications/actor/short-rest.mjs";
import LongRestDialog from "../../applications/actor/long-rest.mjs";
import SkillToolRollConfigurationDialog from "../../applications/dice/skill-tool-configuration-dialog.mjs";
import PropertyAttribution from "../../applications/property-attribution.mjs";
import { _applyDeprecatedD20Configs, _createDeprecatedD20Config } from "../../dice/d20-roll.mjs";
import { createRollLabel } from "../../enrichers.mjs";
import { defaultUnits, replaceFormulaData, simplifyBonus, staticID } from "../../utils.mjs";
import ActiveEffect5e from "../active-effect.mjs";
import Item5e from "../item.mjs";
import SystemDocumentMixin from "../mixins/document.mjs";
import Proficiency from "./proficiency.mjs";
import SelectChoices from "./select-choices.mjs";
import * as Trait from "./trait.mjs";

/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
export default class Actor5e extends SystemDocumentMixin(Actor) {

  /**
   * The data source for Actor5e.classes allowing it to be lazily computed.
   * @type {Record<string, Item5e>}
   * @private
   */
  _classes;

  /**
   * Cached spellcasting classes.
   * @type {Record<string, Item5e>}
   * @private
   */
  _spellcastingClasses;

  /**
   * Mapping of item compendium source UUIDs to the items.
   * @type {Map<string, Item5e>}
   */
  sourcedItems = this.sourcedItems;

  /* -------------------------------------------- */

  /**
   * Types that can be selected within the compendium browser.
   * @param {object} [options={}]
   * @param {Set<string>} [options.chosen]  Types that have been selected.
   * @returns {SelectChoices}
   */
  static compendiumBrowserTypes({ chosen=new Set() }={}) {
    return new SelectChoices(Actor.TYPES.filter(t => t !== CONST.BASE_DOCUMENT_TYPE).reduce((obj, type) => {
      obj[type] = {
        label: CONFIG.Actor.typeLabels[type],
        chosen: chosen.has(type)
      };
      return obj;
    }, {}));
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * A mapping of classes belonging to this Actor.
   * @type {Record<string, Item5e>}
   */
  get classes() {
    if ( this._classes !== undefined ) return this._classes;
    if ( !["character", "npc"].includes(this.type) ) return this._classes = {};
    return this._classes = Object.fromEntries(this.itemTypes.class.map(cls => [cls.identifier, cls]));
  }

  /* -------------------------------------------- */

  /**
   * Calculate the bonus from any cover the actor is affected by.
   * @type {number}     The cover bonus to AC and dexterity saving throws.
   */
  get coverBonus() {
    const { coverHalf, coverThreeQuarters } = CONFIG.SENTIUS.statusEffects;
    if ( this.statuses.has("coverThreeQuarters") ) return coverThreeQuarters?.coverBonus;
    else if ( this.statuses.has("coverHalf") ) return coverHalf?.coverBonus;
    return 0;
  }

  /* -------------------------------------------- */

  /**
   * Get all classes which have spellcasting ability.
   * @type {Record<string, Item5e>}
   */
  get spellcastingClasses() {
    if ( this._spellcastingClasses !== undefined ) return this._spellcastingClasses;
    return this._spellcastingClasses = Object.entries(this.classes).reduce((obj, [identifier, cls]) => {
      if ( cls.spellcasting && (cls.spellcasting.progression !== "none") ) obj[identifier] = cls;
      return obj;
    }, {});
  }

  /* -------------------------------------------- */

  /**
   * Is this Actor currently polymorphed into some other creature?
   * @type {boolean}
   */
  get isPolymorphed() {
    return this.getFlag("sentius", "isPolymorphed") || false;
  }

  /* -------------------------------------------- */

  /**
   * The Actor's currently equipped armor, if any.
   * @type {Item5e|null}
   */
  get armor() {
    return this.system.attributes?.ac?.equippedArmor ?? null;
  }

  /* -------------------------------------------- */

  /**
   * The Actor's currently equipped shield, if any.
   * @type {Item5e|null}
   */
  get shield() {
    return this.system.attributes?.ac?.equippedShield ?? null;
  }

  /* -------------------------------------------- */

  /**
   * The items this actor is concentrating on, and the relevant effects.
   * @type {{items: Set<Item5e>, effects: Set<ActiveEffect5e>}}
   */
  get concentration() {
    const concentration = {
      items: new Set(),
      effects: new Set()
    };

    const limit = this.system.attributes?.concentration?.limit ?? 0;
    if ( !limit ) return concentration;

    for ( const effect of this.effects ) {
      if ( !effect.statuses.has(CONFIG.specialStatusEffects.CONCENTRATING) ) continue;
      const data = effect.getFlag("sentius", "item");
      concentration.effects.add(effect);
      if ( data ) {
        let item = this.items.get(data.id);
        if ( !item && (foundry.utils.getType(data.data) === "Object") ) {
          item = new Item.implementation(data.data, { keepId: true, parent: this });
        }
        if ( item ) concentration.items.add(item);
      }
    }
    return concentration;
  }

  /* -------------------------------------------- */

  /**
   * Creatures summoned by this actor.
   * @type {Actor5e[]}
   */
  get summonedCreatures() {
    return sentius.registry.summons.creatures(this);
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /** @inheritDoc */
  _initializeSource(source, options={}) {
    source = super._initializeSource(source, options);
    if ( !source._id || !options.pack || sentius.moduleArt.suppressArt ) return source;
    const uuid = `Compendium.${options.pack}.${source._id}`;
    const art = game.sentius.moduleArt.map.get(uuid);
    if ( art?.actor || art?.token ) {
      if ( art.actor ) source.img = art.actor;
      if ( typeof art.token === "string" ) source.prototypeToken.texture.src = art.token;
      else if ( art.token ) foundry.utils.mergeObject(source.prototypeToken, art.token);
      const biography = source.system.details?.biography;
      if ( art.credit && biography ) {
        if ( typeof biography.value !== "string" ) biography.value = "";
        biography.value += `<p>${art.credit}</p>`;
      }
    }
    return source;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareData() {
    if ( this.system.modelProvider !== sentius ) return super.prepareData();
    this._clearCachedValues();
    this._preparationWarnings = [];
    super.prepareData();
    this.items.forEach(item => item.prepareFinalAttributes());
    this._prepareSpellcasting();
  }

  /* --------------------------------------------- */

  /**
   * Clear cached class collections.
   * @internal
   */
  _clearCachedValues() {
    this._classes = undefined;
    this._spellcastingClasses = undefined;
  }

  /* --------------------------------------------- */

  /** @inheritDoc */
  prepareEmbeddedDocuments() {
    this.sourcedItems = new SourcedItemsMap();
    this._embeddedPreparation = true;
    super.prepareEmbeddedDocuments();
    delete this._embeddedPreparation;
  }

  /* --------------------------------------------- */

  /** @inheritDoc */
  applyActiveEffects() {
    this._prepareScaleValues();
    if ( this.system?.prepareEmbeddedData instanceof Function ) this.system.prepareEmbeddedData();
    // The Active Effects do not have access to their parent at preparation time, so we wait until this stage to
    // determine whether they are suppressed or not.
    for ( const effect of this.allApplicableEffects() ) {
      effect.determineSuppression();
    }
    return super.applyActiveEffects();
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  *allApplicableEffects() {
    for ( const effect of super.allApplicableEffects() ) {
      if ( effect.type === "enchantment" ) continue;
      if ( effect.parent?.getFlag("sentius", "riders.effect")?.includes(effect.id) ) continue;
      yield effect;
    }
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareDerivedData() {
    const origin = this.getFlag("sentius", "summon.origin");
    // TODO: Replace with parseUuid once V11 support is dropped
    if ( origin && this.token?.id ) sentius.registry.summons.track(origin.split(".Item.")[0], this.uuid);

    if ( (this.system.modelProvider !== sentius) || (this.type === "group") ) return;

    this.labels = {};

    // Retrieve data for polymorphed actors
    const { originalSkills } = this.getOriginalStats();

    // Prepare abilities, skills, & everything else
    const globalBonuses = this.system.bonuses?.abilities ?? {};
    const rollData = this.getRollData();
    const checkBonus = simplifyBonus(globalBonuses?.check, rollData);
    this._prepareSkills(rollData, globalBonuses, checkBonus, originalSkills);
    this._prepareTools(rollData, globalBonuses, checkBonus);
    this._prepareArmorClass();
    this._prepareInitiative(rollData, checkBonus);
    this._prepareSpellcastingAbility();

    // Apply condition immunities
    const conditionImmunities = this.system.traits?.ci?.value;
    if ( conditionImmunities ) {
      for ( const condition of conditionImmunities ) this.statuses.delete(condition);
    }
  }

  /* -------------------------------------------- */

  /**
   * Calculate the DC of a concentration save required for a given amount of damage.
   * @param {number} damage  Amount of damage taken.
   * @returns {number}       DC of the required concentration save.
   */
  getConcentrationDC(damage) {
    return Math.clamp(
      Math.floor(damage / 2), 10, game.settings.get("sentius", "rulesVersion") === "modern" ? 30 : Infinity
    );
  }

  /* -------------------------------------------- */

  /**
   * Return the amount of experience required to gain a certain character level.
   * @param {number} level  The desired level.
   * @returns {number}      The XP required.
   */
  getLevelExp(level) {
    const levels = CONFIG.SENTIUS.CHARACTER_EXP_LEVELS;
    return levels[Math.min(level, levels.length - 1)];
  }

  /* -------------------------------------------- */

  /**
   * Return the amount of experience granted by killing a creature of a certain CR.
   * @param {number|null} cr  The creature's challenge rating.
   * @returns {number|null}   The amount of experience granted per kill.
   */
  getCRExp(cr) {
    if ( cr === null ) return null;
    if ( cr < 1.0 ) return Math.max(200 * cr, 10);
    return CONFIG.SENTIUS.CR_EXP_LEVELS[cr] ?? Object.values(CONFIG.SENTIUS.CR_EXP_LEVELS).pop();
  }

  /* -------------------------------------------- */

  /**
   * @inheritdoc
   * @param {object} [options]
   * @param {boolean} [options.deterministic] Whether to force deterministic values for data properties that could be
   *                                          either a die term or a flat term.
   */
  getRollData({ deterministic=false }={}) {
    let data;
    if ( this.system.getRollData ) data = this.system.getRollData({ deterministic });
    else data = {...super.getRollData()};
    data.flags = {...this.flags};
    data.name = this.name;
    data.statuses = {};
    for ( const status of this.statuses ) {
      data.statuses[status] = status === "exhaustion" ? this.system.attributes?.exhaustion ?? 1 : 1;
    }
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Is this actor under the effect of this property from some status or due to its level of exhaustion?
   * @param {string} key      A key in `SENTIUS.conditionEffects`.
   * @returns {boolean}       Whether the actor is affected.
   */
  hasConditionEffect(key) {
    const props = CONFIG.SENTIUS.conditionEffects[key] ?? new Set();
    const level = this.system.attributes?.exhaustion ?? null;
    const imms = this.system.traits?.ci?.value ?? new Set();
    const applyExhaustion = (level !== null) && !imms.has("exhaustion")
      && (game.settings.get("sentius", "rulesVersion") === "legacy");
    const statuses = this.statuses;
    return props.some(k => {
      const l = Number(k.split("-").pop());
      return (statuses.has(k) && !imms.has(k)) || (applyExhaustion && Number.isInteger(l) && (level >= l));
    });
  }

  /* -------------------------------------------- */
  /*  Base Data Preparation Helpers               */
  /* -------------------------------------------- */

  /**
   * Derive any values that have been scaled by the Advancement system.
   * Mutates the value of the `system.scale` object.
   * @protected
   */
  _prepareScaleValues() {
    this.system.scale = this.items.reduce((scale, item) => {
      if ( CONFIG.SENTIUS.advancementTypes.ScaleValue.validItemTypes.has(item.type) ) {
        scale[item.identifier] = item.scaleValues;
      }
      return scale;
    }, {});
  }

  /* -------------------------------------------- */
  /*  Derived Data Preparation Helpers            */
  /* -------------------------------------------- */

  /**
   * Prepare skill checks. Mutates the values of system.skills.
   * @param {object} rollData         Data produced by `getRollData` to be applied to bonus formulas.
   * @param {object} globalBonuses     Global bonus data.
   * @param {number} globalCheckBonus  Global ability check bonus.
   * @param {object} originalSkills    A transformed actor's original actor's skills.
   * @protected
   */
  _prepareSkills(rollData, globalBonuses, globalCheckBonus, originalSkills) {
    if ( this.type === "vehicle" ) return;

    // Skill modifiers
    for ( const [id, skillData] of Object.entries(this.system.skills) ) {
      this._prepareSkill(id, { skillData, rollData, originalSkills, globalCheckBonus, globalBonuses });
    }
  }

  /* -------------------------------------------- */

  /**
   * Prepares data for a specific skill.
   * @param {string} skillId                     The id of the skill to prepare data for.
   * @param {object} [options]                   Additional options.
   * @param {SkillData} [options.skillData]      The base skill data for this skill.
   *                                             If undefined, `this.system.skill[skillId]` is used.
   * @param {object} [options.rollData]          RollData for this actor, used to evaluate dice terms in bonuses.
   *                                             If undefined, `this.getRollData()` is used.
   * @param {object} [options.originalSkills]    Original skills if actor is polymorphed.
   *                                             If undefined, the skills of the actor identified by
   *                                             `this.flags.sentius.originalActor` are used.
   * @param {object} [options.globalBonuses]     Global ability bonuses for this actor.
   *                                             If undefined, `this.system.bonuses.abilities` is used.
   * @param {number} [options.globalCheckBonus]  Global check bonus for this actor.
   *                                             If undefined, `globalBonuses.check` will be evaluated using `rollData`.
   * @param {number} [options.globalSkillBonus]  Global skill bonus for this actor.
   *                                             If undefined, `globalBonuses.skill` will be evaluated using `rollData`.
   * @param {string} [options.ability]           The ability to compute bonuses based on.
   *                                             If undefined, skillData.ability is used.
   * @returns {SkillData}
   * @internal
   */
  _prepareSkill(skillId, {
    skillData, rollData, originalSkills, globalBonuses,
    globalCheckBonus, globalSkillBonus, ability
  }={}) {
    const flags = this.flags.sentius ?? {};

    skillData ??= foundry.utils.deepClone(this.system.skills[skillId]);
    rollData ??= this.getRollData();
    originalSkills ??= flags.originalActor ? game.actors?.get(flags.originalActor)?.system?.skills : null;
    globalBonuses ??= this.system.bonuses?.abilities ?? {};
    globalCheckBonus ??= simplifyBonus(globalBonuses.check, rollData);
    globalSkillBonus ??= simplifyBonus(globalBonuses.skill, rollData);
    ability ??= skillData.ability;
    const abilityData = this.system.abilities[ability];
    skillData.ability = ability;
    const baseBonus = simplifyBonus(skillData.bonuses?.check, rollData);

    // Polymorph Skill Proficiencies
    if ( originalSkills ) {
      skillData.value = Math.max(skillData.value, originalSkills[skillId].value);
    }

    // Compute modifier
    const checkBonusAbl = simplifyBonus(abilityData?.bonuses?.check, rollData);
    skillData.effectValue = skillData.value;
    skillData.bonus = baseBonus + globalCheckBonus + checkBonusAbl + globalSkillBonus;
    skillData.mod = abilityData?.mod ?? 0;
    skillData.prof = this.system.calculateAbilityCheckProficiency(skillData.value, skillData.ability);
    skillData.value = skillData.proficient = skillData.prof.multiplier;
    skillData.total = skillData.mod + skillData.bonus;
    if ( Number.isNumeric(skillData.prof.term) ) skillData.total += skillData.prof.flat;

    // Compute passive bonus
    const passive = flags.observantFeat && CONFIG.SENTIUS.characterFlags.observantFeat.skills.includes(skillId) ? 5 : 0;
    const passiveBonus = simplifyBonus(skillData.bonuses?.passive, rollData);
    skillData.passive = 10 + skillData.mod + skillData.bonus + skillData.prof.flat + passive + passiveBonus;

    return skillData;
  }

  /* -------------------------------------------- */

  /**
   * Prepare tool checks. Mutates the values of system.tools.
   * @param {object} bonusData       Data produced by `getRollData` to be applied to bonus formulae.
   * @param {object} globalBonuses   Global bonus data.
   * @param {number} checkBonus      Global ability check bonus.
   * @protected
   */
  _prepareTools(bonusData, globalBonuses, checkBonus) {
    if ( this.type === "vehicle" ) return;
    for ( const tool of Object.values(this.system.tools) ) {
      const ability = this.system.abilities[tool.ability];
      const baseBonus = simplifyBonus(tool.bonuses.check, bonusData);
      const checkBonusAbl = simplifyBonus(ability?.bonuses?.check, bonusData);
      tool.effectValue = tool.value;
      tool.bonus = baseBonus + checkBonus + checkBonusAbl;
      tool.mod = ability?.mod ?? 0;
      tool.prof = this.system.calculateAbilityCheckProficiency(tool.value, tool.ability);
      tool.total = tool.mod + tool.bonus;
      if ( Number.isNumeric(tool.prof.term) ) tool.total += tool.prof.flat;
      tool.value = tool.prof.multiplier;
    }
  }

  /* -------------------------------------------- */

  /**
   * Prepare a character's AC value from their equipped armor and shield.
   * Mutates the value of the `system.attributes.ac` object.
   */
  _prepareArmorClass() {
    const ac = this.system.attributes.ac;

    // Apply automatic migrations for older data structures
    let cfg = CONFIG.SENTIUS.armorClasses[ac.calc];
    if ( !cfg ) {
      ac.calc = "flat";
      if ( Number.isNumeric(ac.value) ) ac.flat = Number(ac.value);
      cfg = CONFIG.SENTIUS.armorClasses.flat;
    }

    // Identify Equipped Items
    const armorTypes = new Set(Object.keys(CONFIG.SENTIUS.armorTypes));
    const {armors, shields} = this.itemTypes.equipment.reduce((obj, equip) => {
      if ( !equip.system.equipped || !armorTypes.has(equip.system.type.value) ) return obj;
      if ( equip.system.type.value === "shield" ) obj.shields.push(equip);
      else obj.armors.push(equip);
      return obj;
    }, {armors: [], shields: []});
    const rollData = this.getRollData({ deterministic: true });

    // Determine base AC
    switch ( ac.calc ) {

      // Flat AC (no additional bonuses)
      case "flat":
        ac.value = Number(ac.flat);
        return;

      // Natural AC (includes bonuses)
      case "natural":
        ac.base = Number(ac.flat);
        break;

      default:
        let formula = ac.calc === "custom" ? ac.formula : cfg.formula;
        if ( armors.length ) {
          if ( armors.length > 1 ) this._preparationWarnings.push({
            message: game.i18n.localize("SENTIUS.WarnMultipleArmor"), type: "warning"
          });
          const armorData = armors[0].system.armor;
          const isHeavy = armors[0].system.type.value === "heavy";
          ac.armor = armorData.value ?? ac.armor;
          ac.dex = isHeavy ? 0 : Math.min(armorData.dex ?? Infinity, this.system.abilities.dex?.mod ?? 0);
          ac.equippedArmor = armors[0];
        }
        else ac.dex = this.system.abilities.dex?.mod ?? 0;

        rollData.attributes.ac = ac;
        try {
          const replaced = replaceFormulaData(formula, rollData, {
            actor: this, missing: null, property: game.i18n.localize("SENTIUS.ArmorClass")
          });
          ac.base = replaced ? new Roll(replaced).evaluateSync().total : 0;
        } catch(err) {
          this._preparationWarnings.push({
            message: game.i18n.format("SENTIUS.WarnBadACFormula", { formula }), link: "armor", type: "error"
          });
          const replaced = Roll.replaceFormulaData(CONFIG.SENTIUS.armorClasses.default.formula, rollData);
          ac.base = new Roll(replaced).evaluateSync().total;
        }
        break;
    }

    // Equipped Shield
    if ( shields.length ) {
      if ( shields.length > 1 ) this._preparationWarnings.push({
        message: game.i18n.localize("SENTIUS.WarnMultipleShields"), type: "warning"
      });
      ac.shield = shields[0].system.armor.value ?? 0;
      ac.equippedShield = shields[0];
    }

    // Compute cover.
    ac.cover = Math.max(ac.cover, this.coverBonus);

    // Compute total AC and return
    ac.min = simplifyBonus(ac.min, rollData);
    ac.bonus = simplifyBonus(ac.bonus, rollData);
    ac.value = Math.max(ac.min, ac.base + ac.shield + ac.bonus + ac.cover);
  }

  /* -------------------------------------------- */

  /**
   * Prepare the initiative data for an actor.
   * Mutates the value of the system.attributes.init object.
   * @param {object} bonusData         Data produced by getRollData to be applied to bonus formulas
   * @param {number} globalCheckBonus  Global ability check bonus
   * @protected
   */
  _prepareInitiative(bonusData, globalCheckBonus=0) {
    const init = this.system.attributes.init ??= {};
    const flags = this.flags.sentius || {};

    // Compute initiative modifier
    const abilityId = init.ability || CONFIG.SENTIUS.defaultAbilities.initiative;
    const ability = this.system.abilities?.[abilityId] || {};
    init.mod = ability.mod ?? 0;

    // Initiative proficiency
    const isLegacy = game.settings.get("sentius", "rulesVersion") === "legacy";
    const prof = this.system.attributes.prof ?? 0;
    const joat = flags.jackOfAllTrades && isLegacy;
    const ra = this._isRemarkableAthlete(abilityId);
    const alert = flags.initiativeAlert && !isLegacy;
    init.prof = new Proficiency(prof, alert ? 1 : (joat || ra) ? 0.5 : 0, !ra);

    // Total initiative includes all numeric terms
    const initBonus = simplifyBonus(init.bonus, bonusData);
    const abilityBonus = simplifyBonus(ability.bonuses?.check, bonusData);
    init.total = init.mod + initBonus + abilityBonus + globalCheckBonus
      + (flags.initiativeAlert && isLegacy ? 5 : 0)
      + (Number.isNumeric(init.prof.term) ? init.prof.flat : 0);
    init.score = 10 + init.total;
  }

  /* -------------------------------------------- */
  /*  Spellcasting Preparation                    */
  /* -------------------------------------------- */

  /**
   * Prepare spellcasting DC & modifier.
   */
  _prepareSpellcastingAbility() {
    const spellcastingAbility = this.system.abilities[this.system.attributes.spellcasting];
    this.system.attributes.spelldc = spellcastingAbility ? spellcastingAbility.dc : 8 + this.system.attributes.prof;
    this.system.attributes.spellmod = spellcastingAbility ? spellcastingAbility.mod : 0;
  }

  /* -------------------------------------------- */

  /**
   * Prepare data related to the spell-casting capabilities of the Actor.
   * Mutates the value of the system.spells object. Must be called after final item preparation.
   * @protected
   */
  _prepareSpellcasting() {
    if ( !this.system.spells ) return;

    // Translate the list of classes into spellcasting progression
    const progression = { slot: 0, pact: 0 };
    const types = {};

    // Grab all classes with spellcasting
    const classes = this.itemTypes.class.filter(cls => {
      const type = cls.spellcasting.type;
      if ( !type ) return false;
      types[type] ??= 0;
      types[type] += 1;
      return true;
    });

    for ( const cls of classes ) this.constructor.computeClassProgression(
      progression, cls, { actor: this, count: types[cls.spellcasting.type] }
    );

    if ( this.type === "npc" ) {
      if ( progression.slot || progression.pact ) this.system.details.spellLevel = progression.slot || progression.pact;
      else progression.slot = this.system.details.spellLevel ?? 0;
    }

    for ( const type of Object.keys(CONFIG.SENTIUS.spellcastingTypes) ) {
      this.constructor.prepareSpellcastingSlots(this.system.spells, type, progression, { actor: this });
    }
  }

  /* -------------------------------------------- */

  /**
   * Contribute to the actor's spellcasting progression.
   * @param {object} progression                             Spellcasting progression data. *Will be mutated.*
   * @param {Item5e} cls                                     Class for whom this progression is being computed.
   * @param {object} [config={}]
   * @param {Actor5e|null} [config.actor]                    Actor for whom the data is being prepared.
   * @param {SpellcastingDescription} [config.spellcasting]  Spellcasting descriptive object.
   * @param {number} [config.count=1]                        Number of classes with this type of spellcasting.
   */
  static computeClassProgression(progression, cls, {actor, spellcasting, count=1}={}) {
    const type = cls.spellcasting.type;
    spellcasting = spellcasting ?? cls.spellcasting;

    /**
     * A hook event that fires while computing the spellcasting progression for each class on each actor.
     * The actual hook names include the spellcasting type (e.g. `sentius.computeLeveledProgression`).
     * @param {object} progression                    Spellcasting progression data. *Will be mutated.*
     * @param {Actor5e|null} [actor]                  Actor for whom the data is being prepared.
     * @param {Item5e} cls                            Class for whom this progression is being computed.
     * @param {SpellcastingDescription} spellcasting  Spellcasting descriptive object.
     * @param {number} count                          Number of classes with this type of spellcasting.
     * @returns {boolean}  Explicitly return false to prevent default progression from being calculated.
     * @function sentius.computeSpellcastingProgression
     * @memberof hookEvents
     */
    const allowed = Hooks.call(
      `sentius.compute${type.capitalize()}Progression`, progression, actor, cls, spellcasting, count
    );

    if ( allowed && (type === "pact") ) {
      this.computePactProgression(progression, actor, cls, spellcasting, count);
    } else if ( allowed && (type === "leveled") ) {
      this.computeLeveledProgression(progression, actor, cls, spellcasting, count);
    }
  }

  /* -------------------------------------------- */

  /**
   * Contribute to the actor's spellcasting progression for a class with leveled spellcasting.
   * @param {object} progression                    Spellcasting progression data. *Will be mutated.*
   * @param {Actor5e} actor                         Actor for whom the data is being prepared.
   * @param {Item5e} cls                            Class for whom this progression is being computed.
   * @param {SpellcastingDescription} spellcasting  Spellcasting descriptive object.
   * @param {number} count                          Number of classes with this type of spellcasting.
   */
  static computeLeveledProgression(progression, actor, cls, spellcasting, count) {
    const prog = CONFIG.SENTIUS.spellcastingTypes.leveled.progression[spellcasting.progression];
    if ( !prog ) return;
    const rounding = prog.roundUp ? Math.ceil : Math.floor;
    progression.slot += rounding(spellcasting.levels / prog.divisor ?? 1);
    // Single-classed, non-full progression rounds up, rather than down.
    if ( (count === 1) && (prog.divisor > 1) && progression.slot ) {
      progression.slot = Math.ceil(spellcasting.levels / prog.divisor);
    }
  }

  /* -------------------------------------------- */

  /**
   * Contribute to the actor's spellcasting progression for a class with pact spellcasting.
   * @param {object} progression                    Spellcasting progression data. *Will be mutated.*
   * @param {Actor5e} actor                         Actor for whom the data is being prepared.
   * @param {Item5e} cls                            Class for whom this progression is being computed.
   * @param {SpellcastingDescription} spellcasting  Spellcasting descriptive object.
   * @param {number} count                          Number of classes with this type of spellcasting.
   */
  static computePactProgression(progression, actor, cls, spellcasting, count) {
    progression.pact += spellcasting.levels;
  }

  /* -------------------------------------------- */

  /**
   * Prepare actor's spell slots using progression data.
   * @param {object} spells           The `data.spells` object within actor's data. *Will be mutated.*
   * @param {string} type             Type of spellcasting slots being prepared.
   * @param {object} progression      Spellcasting progression data.
   * @param {object} [config]
   * @param {Actor5e} [config.actor]  Actor for whom the data is being prepared.
   */
  static prepareSpellcastingSlots(spells, type, progression, {actor}={}) {
    /**
     * A hook event that fires to convert the provided spellcasting progression into spell slots.
     * The actual hook names include the spellcasting type (e.g. `sentius.prepareLeveledSlots`).
     * @param {object} spells        The `data.spells` object within actor's data. *Will be mutated.*
     * @param {Actor5e} actor        Actor for whom the data is being prepared.
     * @param {object} progression   Spellcasting progression data.
     * @returns {boolean}            Explicitly return false to prevent default preparation from being performed.
     * @function sentius.prepareSpellcastingSlots
     * @memberof hookEvents
     */
    const allowed = Hooks.call(`sentius.prepare${type.capitalize()}Slots`, spells, actor, progression);

    if ( allowed && (type === "pact") ) this.preparePactSlots(spells, actor, progression);
    else if ( allowed && (type === "leveled") ) this.prepareLeveledSlots(spells, actor, progression);
  }

  /* -------------------------------------------- */

  /**
   * Prepare leveled spell slots using progression data.
   * @param {object} spells        The `data.spells` object within actor's data. *Will be mutated.*
   * @param {Actor5e} actor        Actor for whom the data is being prepared.
   * @param {object} progression   Spellcasting progression data.
   */
  static prepareLeveledSlots(spells, actor, progression) {
    const levels = Math.clamp(progression.slot, 0, CONFIG.SENTIUS.maxLevel);
    const slots = CONFIG.SENTIUS.SPELL_SLOT_TABLE[Math.min(levels, CONFIG.SENTIUS.SPELL_SLOT_TABLE.length) - 1] ?? [];
    for ( const level of Array.fromRange(Object.keys(CONFIG.SENTIUS.spellLevels).length - 1, 1) ) {
      const slot = spells[`spell${level}`] ??= { value: 0 };
      slot.label = CONFIG.SENTIUS.spellLevels[level];
      slot.level = level;
      slot.max = Number.isNumeric(slot.override) ? Math.max(parseInt(slot.override), 0) : slots[level - 1] ?? 0;
      slot.type = "leveled";
    }
  }

  /* -------------------------------------------- */

  /**
   * Prepare non-leveled spell slots using progression data.
   * @param {object} spells        The `data.spells` object within actor's data. *Will be mutated.*
   * @param {Actor5e} actor        Actor for whom the data is being prepared.
   * @param {object} progression   Spellcasting progression data.
   * @param {string} key           The internal key for these spell slots on the actor.
   * @param {object} table         The table used for determining the progression of slots.
   */
  static prepareAltSlots(spells, actor, progression, key, table) {
    // Spell data:
    // - x.level: Slot level for casting
    // - x.max: Total number of slots
    // - x.value: Currently available slots
    // - x.override: Override number of available spell slots

    let keyLevel = Math.clamp(progression[key], 0, CONFIG.SENTIUS.maxLevel);
    spells[key] ??= {};
    spells[key].type = key;
    const override = Number.isNumeric(spells[key].override) ? parseInt(spells[key].override) : null;

    // Slot override
    if ( (keyLevel === 0) && (actor.type === "npc") && (override !== null) ) {
      keyLevel = actor.system.details.spellLevel;
    }

    const [, keyConfig] = Object.entries(table).reverse().find(([l]) => Number(l) <= keyLevel) ?? [];
    if ( keyConfig ) {
      spells[key].level = keyConfig.level;
      if ( override === null ) spells[key].max = keyConfig.slots;
      else spells[key].max = Math.max(override, 1);
      spells[key].value = Math.min(spells[key].value, spells[key].max);
    }

    else {
      spells[key].max = override || 0;
      spells[key].level = (spells[key].max > 0) ? 1 : 0;
    }
  }

  /* -------------------------------------------- */

  /**
   * Convenience method for preparing pact slots specifically.
   * @param {object} spells        The `data.spells` object within actor's data. *Will be mutated.*
   * @param {Actor5e} actor        Actor for whom the data is being prepared.
   * @param {object} progression   Spellcasting progression data.
   */
  static preparePactSlots(spells, actor, progression) {
    this.prepareAltSlots(spells, actor, progression, "pact", CONFIG.SENTIUS.pactCastingProgression);
    spells.pact.label = game.i18n.localize("SENTIUS.PactMagic");
  }

  /* -------------------------------------------- */
  /*  Event Handlers                              */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ( (await super._preCreate(data, options, user)) === false ) return false;

    const sourceId = this._stats?.compendiumSource;
    if ( sourceId?.startsWith("Compendium.") ) return;

    // Configure prototype token settings
    const prototypeToken = {};
    if ( "size" in (this.system.traits || {}) ) {
      const size = CONFIG.SENTIUS.actorSizes[this.system.traits.size || "med"].token ?? 1;
      if ( !foundry.utils.hasProperty(data, "prototypeToken.width") ) prototypeToken.width = size;
      if ( !foundry.utils.hasProperty(data, "prototypeToken.height") ) prototypeToken.height = size;
    }
    if ( this.type === "character" ) Object.assign(prototypeToken, {
      sight: { enabled: true }, actorLink: true, disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY
    });
    this.updateSource({ prototypeToken });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preUpdate(changed, options, user) {
    if ( (await super._preUpdate(changed, options, user)) === false ) return false;

    // Apply changes in Actor size to Token width/height
    if ( "size" in (this.system.traits || {}) ) {
      const newSize = foundry.utils.getProperty(changed, "system.traits.size");
      if ( newSize && (newSize !== this.system.traits?.size) ) {
        let size = CONFIG.SENTIUS.actorSizes[newSize].token ?? 1;
        if ( !foundry.utils.hasProperty(changed, "prototypeToken.width") ) {
          changed.prototypeToken ||= {};
          changed.prototypeToken.height = size;
          changed.prototypeToken.width = size;
        }
      }
    }

    // Reset death save counters and store hp
    if ( "hp" in (this.system.attributes || {}) ) {
      const isDead = this.system.attributes.hp.value <= 0;
      if ( isDead && (foundry.utils.getProperty(changed, "system.attributes.hp.value") > 0) ) {
        foundry.utils.setProperty(changed, "system.attributes.death.success", 0);
        foundry.utils.setProperty(changed, "system.attributes.death.failure", 0);
      }
      foundry.utils.setProperty(options, "sentius.hp", { ...this.system.attributes.hp });
    }

    // Record previous exhaustion level.
    if ( Number.isFinite(foundry.utils.getProperty(changed, "system.attributes.exhaustion")) ) {
      foundry.utils.setProperty(options, "sentius.originalExhaustion", this.system.attributes.exhaustion);
    }
  }

  /* -------------------------------------------- */

  /**
   * Assign a class item as the original class for the Actor based on which class has the most levels.
   * @returns {Promise<Actor5e>}  Instance of the updated actor.
   * @protected
   */
  _assignPrimaryClass() {
    const classes = this.itemTypes.class.sort((a, b) => b.system.levels - a.system.levels);
    const newPC = classes[0]?.id || "";
    return this.update({"system.details.originalClass": newPC});
  }

  /* -------------------------------------------- */
  /*  Gameplay Mechanics                          */
  /* -------------------------------------------- */

  /** @override */
  async modifyTokenAttribute(attribute, value, isDelta, isBar) {
    if ( attribute === "attributes.hp" ) {
      const hp = this.system.attributes.hp;
      const delta = isDelta ? (-1 * value) : (hp.value + hp.temp) - value;
      return this.applyDamage(delta);
    } else if ( attribute.startsWith(".") ) {
      const item = fromUuidSync(attribute, { relative: this });
      let newValue = item?.system.uses?.value ?? 0;
      if ( isDelta ) newValue += value;
      else newValue = value;
      return item?.update({ "system.uses.spent": item.system.uses.max - newValue });
    }
    return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
  }

  /* -------------------------------------------- */

  /**
   * Description of a source of damage.
   *
   * @typedef {object} DamageDescription
   * @property {number} value            Amount of damage.
   * @property {string} type             Type of damage.
   * @property {Set<string>} properties  Physical properties that affect damage application.
   * @property {object} [active]
   * @property {number} [active.multiplier]      Final calculated multiplier.
   * @property {boolean} [active.modifications]  Did modification affect this description?
   * @property {boolean} [active.resistance]     Did resistance affect this description?
   * @property {boolean} [active.vulnerability]  Did vulnerability affect this description?
   * @property {boolean} [active.immunity]       Did immunity affect this description?
   */

  /**
   * Options for damage application.
   *
   * @typedef {object} DamageApplicationOptions
   * @property {boolean|Set<string>} [downgrade]  Should this actor's resistances and immunities be downgraded by one
   *                                              step? A set of damage types to be downgraded or `true` to downgrade
   *                                              all damage types.
   * @property {number} [multiplier=1]         Amount by which to multiply all damage.
   * @property {object|boolean} [ignore]       Set to `true` to ignore all damage modifiers. If set to an object, then
   *                                           values can either be `true` to indicate that the all modifications of
   *                                           that type should be ignored, or a set of specific damage types for which
   *                                           it should be ignored.
   * @property {boolean|Set<string>} [ignore.immunity]       Should this actor's damage immunity be ignored?
   * @property {boolean|Set<string>} [ignore.resistance]     Should this actor's damage resistance be ignored?
   * @property {boolean|Set<string>} [ignore.vulnerability]  Should this actor's damage vulnerability be ignored?
   * @property {boolean|Set<string>} [ignore.modification]   Should this actor's damage modification be ignored?
   * @property {boolean} [invertHealing=true]  Automatically invert healing types to it heals, rather than damages.
   * @property {"damage"|"healing"} [only]     Apply only damage or healing parts. Untyped rolls will always be applied.
   */

  /**
   * Apply a certain amount of damage or healing to the health pool for Actor
   * @param {DamageDescription[]|number} damages     Damages to apply.
   * @param {DamageApplicationOptions} [options={}]  Damage application options.
   * @returns {Promise<Actor5e>}                     A Promise which resolves once the damage has been applied.
   */
  async applyDamage(damages, options={}) {
    const hp = this.system.attributes.hp;
    if ( !hp ) return this; // Group actors don't have HP at the moment

    if ( Number.isNumeric(damages) ) {
      damages = [{ value: damages }];
      options.ignore ??= true;
    }

    damages = this.calculateDamage(damages, options);
    if ( !damages ) return this;

    // Round damage towards zero
    let { amount, temp } = damages.reduce((acc, d) => {
      if ( d.type === "temphp" ) acc.temp += d.value;
      else acc.amount += d.value;
      return acc;
    }, { amount: 0, temp: 0 });
    amount = amount > 0 ? Math.floor(amount) : Math.ceil(amount);

    const deltaTemp = amount > 0 ? Math.min(hp.temp, amount) : 0;
    const deltaHP = Math.clamp(amount - deltaTemp, -hp.damage, hp.value);
    const updates = {
      "system.attributes.hp.temp": hp.temp - deltaTemp,
      "system.attributes.hp.value": hp.value - deltaHP
    };

    if ( temp > updates["system.attributes.hp.temp"] ) updates["system.attributes.hp.temp"] = temp;

    /**
     * A hook event that fires before damage is applied to an actor.
     * @param {Actor5e} actor                     Actor the damage will be applied to.
     * @param {number} amount                     Amount of damage that will be applied.
     * @param {object} updates                    Distinct updates to be performed on the actor.
     * @param {DamageApplicationOptions} options  Additional damage application options.
     * @returns {boolean}                         Explicitly return `false` to prevent damage application.
     * @function sentius.preApplyDamage
     * @memberof hookEvents
     */
    if ( Hooks.call("sentius.preApplyDamage", this, amount, updates, options) === false ) return this;

    // Delegate damage application to a hook
    // TODO: Replace this in the future with a better modifyTokenAttribute function in the core
    if ( Hooks.call("modifyTokenAttribute", {
      attribute: "attributes.hp",
      value: amount,
      isDelta: false,
      isBar: true
    }, updates) === false ) return this;

    await this.update(updates);

    /**
     * A hook event that fires after damage has been applied to an actor.
     * @param {Actor5e} actor                     Actor that has been damaged.
     * @param {number} amount                     Amount of damage that has been applied.
     * @param {DamageApplicationOptions} options  Additional damage application options.
     * @function sentius.applyDamage
     * @memberof hookEvents
     */
    Hooks.callAll("sentius.applyDamage", this, amount, options);

    return this;
  }

  /* -------------------------------------------- */

  /**
   * Calculate the damage that will be applied to this actor.
   * @param {DamageDescription[]} damages            Damages to calculate.
   * @param {DamageApplicationOptions} [options={}]  Damage calculation options.
   * @returns {DamageDescription[]|false}            New damage descriptions with changes applied, or `false` if the
   *                                                 calculation was canceled.
   */
  calculateDamage(damages, options={}) {
    damages = foundry.utils.deepClone(damages);

    /**
     * A hook event that fires before damage amount is calculated for an actor.
     * @param {Actor5e} actor                     The actor being damaged.
     * @param {DamageDescription[]} damages       Damage descriptions.
     * @param {DamageApplicationOptions} options  Additional damage application options.
     * @returns {boolean}                         Explicitly return `false` to prevent damage application.
     * @function sentius.preCalculateDamage
     * @memberof hookEvents
     */
    if ( Hooks.call("sentius.preCalculateDamage", this, damages, options) === false ) return false;

    const multiplier = options.multiplier ?? 1;

    const downgrade = type => options.downgrade === true || options.downgrade?.has?.(type);
    const ignore = (category, type, skipDowngrade) => {
      return options.ignore === true
        || options.ignore?.[category] === true
        || options.ignore?.[category]?.has?.(type)
        || ((category === "immunity") && downgrade(type) && !skipDowngrade)
        || ((category === "resistance") && downgrade(type) && !hasEffect("di", type));
    };

    const traits = this.system.traits ?? {};
    const hasEffect = (category, type, properties) => {
      if ( (category === "dr") && downgrade(type) && hasEffect("di", type, properties)
        && !ignore("immunity", type, true) ) return true;
      const config = traits[category];
      if ( !config?.value.has(type) ) return false;
      if ( !CONFIG.SENTIUS.damageTypes[type]?.isPhysical || !properties?.size ) return true;
      return !config.bypasses?.intersection(properties)?.size;
    };

    const skipped = type => {
      if ( options.only === "damage" ) return type in CONFIG.SENTIUS.healingTypes;
      if ( options.only === "healing" ) return type in CONFIG.SENTIUS.damageTypes;
      return false;
    };

    const rollData = this.getRollData({deterministic: true});

    damages.forEach(d => {
      d.active ??= {};

      // Skip damage types with immunity
      if ( skipped(d.type) || (!ignore("immunity", d.type) && hasEffect("di", d.type, d.properties)) ) {
        d.value = 0;
        d.active.multiplier = 0;
        d.active.immunity = true;
        return;
      }

      // Apply type-specific damage reduction
      if ( !ignore("modification", d.type) && traits.dm?.amount[d.type]
        && !traits.dm.bypasses.intersection(d.properties).size ) {
        const modification = simplifyBonus(traits.dm.amount[d.type], rollData);
        if ( Math.sign(d.value) !== Math.sign(d.value + modification) ) d.value = 0;
        else d.value += modification;
        d.active.modification = true;
      }

      let damageMultiplier = multiplier;

      // Apply type-specific damage resistance
      if ( !ignore("resistance", d.type) && hasEffect("dr", d.type, d.properties) ) {
        damageMultiplier /= 2;
        d.active.resistance = true;
      }

      // Apply type-specific damage vulnerability
      if ( !ignore("vulnerability", d.type) && hasEffect("dv", d.type, d.properties) ) {
        damageMultiplier *= 2;
        d.active.vulnerability = true;
      }

      // Negate healing types
      if ( (options.invertHealing !== false) && (d.type === "healing") ) damageMultiplier *= -1;

      d.value = d.value * damageMultiplier;
      d.active.multiplier = (d.active.multiplier ?? 1) * damageMultiplier;
    });

    /**
     * A hook event that fires after damage values are calculated for an actor.
     * @param {Actor5e} actor                     The actor being damaged.
     * @param {DamageDescription[]} damages       Damage descriptions.
     * @param {DamageApplicationOptions} options  Additional damage application options.
     * @returns {boolean}                         Explicitly return `false` to prevent damage application.
     * @function sentius.calculateDamage
     * @memberof hookEvents
     */
    if ( Hooks.call("sentius.calculateDamage", this, damages, options) === false ) return false;

    return damages;
  }

  /* -------------------------------------------- */

  /**
   * Apply a certain amount of temporary hit point, but only if it's more than the actor currently has.
   * @param {number} amount       An amount of temporary hit points to set
   * @returns {Promise<Actor5e>}  A Promise which resolves once the temp HP has been applied
   */
  async applyTempHP(amount=0) {
    amount = parseInt(amount);
    const hp = this.system.attributes.hp;

    // Update the actor if the new amount is greater than the current
    const tmp = parseInt(hp.temp) || 0;
    return amount > tmp ? this.update({"system.attributes.hp.temp": amount}) : this;
  }

  /* -------------------------------------------- */

  /**
   * Get a color used to represent the current hit points of an Actor.
   * @param {number} current        The current HP value
   * @param {number} max            The maximum HP value
   * @returns {Color}               The color used to represent the HP percentage
   */
  static getHPColor(current, max) {
    const pct = Math.clamp(current, 0, max) / max;
    return Color.fromRGB([(1-(pct/2)), pct, 0]);
  }

  /* -------------------------------------------- */

  /**
   * Initiate concentration on an item.
   * @param {Activity} activity                  The activity on which to being concentration.
   * @param {object} [effectData]                Effect data to merge into the created effect.
   * @returns {Promise<ActiveEffect5e|void>}     A promise that resolves to the created effect.
   */
  async beginConcentrating(activity, effectData={}) {
    if ( activity instanceof Item ) {
      foundry.utils.logCompatibilityWarning(
        "The `beginConcentrating` method on Actor5e now takes an Activity, rather than an Item.",
        { since: "SENTIUS", until: "SENTIUS"" }
      );
      activity = activity.system.activities?.contents[0];
      if ( !activity ) return;
    }

    effectData = ActiveEffect5e.createConcentrationEffectData(activity, effectData);

    /**
     * A hook that is called before a concentration effect is created.
     * @function sentius.preBeginConcentrating
     * @memberof hookEvents
     * @param {Actor5e} actor         The actor initiating concentration.
     * @param {Item5e} item           The item that will be concentrated on.
     * @param {object} effectData     Data used to create the ActiveEffect.
     * @param {Activity} activity     The activity that triggered the concentration.
     * @returns {boolean}             Explicitly return false to prevent the effect from being created.
     */
    if ( Hooks.call("sentius.preBeginConcentrating", this, activity.item, effectData, activity) === false ) return;

    const effect = await ActiveEffect5e.create(effectData, { parent: this });

    /**
     * A hook that is called after a concentration effect is created.
     * @function sentius.createConcentrating
     * @memberof hookEvents
     * @param {Actor5e} actor             The actor initiating concentration.
     * @param {Item5e} item               The item that is being concentrated on.
     * @param {ActiveEffect5e} effect     The created ActiveEffect instance.
     * @param {Activity} activity         The activity that triggered the concentration.
     */
    Hooks.callAll("sentius.beginConcentrating", this, activity.item, effect, activity);

    return effect;
  }

  /* -------------------------------------------- */

  /**
   * End concentration on an item.
   * @param {Item5e|ActiveEffect5e|string} [target]    An item or effect to end concentration on, or id of an effect.
   *                                                   If not provided, all maintained effects are removed.
   * @returns {Promise<ActiveEffect5e[]>}              A promise that resolves to the deleted effects.
   */
  async endConcentration(target) {
    let effect;
    const { effects } = this.concentration;

    if ( !target ) {
      return effects.reduce(async (acc, effect) => {
        acc = await acc;
        return acc.concat(await this.endConcentration(effect));
      }, []);
    }

    if ( foundry.utils.getType(target) === "string" ) effect = effects.find(e => e.id === target);
    else if ( target instanceof ActiveEffect5e ) effect = effects.has(target) ? target : null;
    else if ( target instanceof Item5e ) {
      effect = effects.find(e => {
        const data = e.getFlag("sentius", "item") ?? {};
        return (data.id === target._id) || (data.data?._id === target._id);
      });
    }
    if ( !effect ) return [];

    /**
     * A hook that is called before a concentration effect is deleted.
     * @function sentius.preEndConcentration
     * @memberof hookEvents
     * @param {Actor5e} actor             The actor ending concentration.
     * @param {ActiveEffect5e} effect     The ActiveEffect that will be deleted.
     * @returns {boolean}                 Explicitly return false to prevent the effect from being deleted.
     */
    if ( Hooks.call("sentius.preEndConcentration", this, effect) === false) return [];

    await effect.delete();

    /**
     * A hook that is called after a concentration effect is deleted.
     * @function sentius.endConcentration
     * @memberof hookEvents
     * @param {Actor5e} actor             The actor ending concentration.
     * @param {ActiveEffect5e} effect     The ActiveEffect that was deleted.
     */
    Hooks.callAll("sentius.endConcentration", this, effect);

    return [effect];
  }

  /* -------------------------------------------- */

  /**
   * Create a chat message for this actor with a prompt to challenge concentration.
   * @param {object} [options]
   * @param {number} [options.dc]         The target value of the saving throw.
   * @param {string} [options.ability]    An ability to use instead of the default.
   * @returns {Promise<ChatMessage5e>}    A promise that resolves to the created chat message.
   */
  async challengeConcentration({ dc=10, ability=null }={}) {
    const isConcentrating = this.concentration.effects.size > 0;
    if ( !isConcentrating ) return null;

    const dataset = {
      action: "concentration",
      dc: dc
    };
    if ( ability in CONFIG.SENTIUS.abilities ) dataset.ability = ability;

    const config = {
      type: "concentration",
      format: "short",
      icon: true
    };

    return ChatMessage.implementation.create({
      content: await renderTemplate("systems/sentius/templates/chat/request-card.hbs", {
        dataset: { ...dataset, type: "concentration", visbility: "all" },
        buttonLabel: createRollLabel({ ...dataset, ...config }),
        hiddenLabel: createRollLabel({ ...dataset, ...config, hideDC: true })
      }),
      whisper: game.users.filter(user => this.testUserPermission(user, "OWNER")),
      speaker: ChatMessage.implementation.getSpeaker({ actor: this })
    });
  }

  /* -------------------------------------------- */

  /**
   * Determine whether the provided ability is usable for remarkable athlete.
   * @param {string} ability  Ability type to check.
   * @returns {boolean}       Whether the actor has the remarkable athlete flag and the ability is physical.
   * @private
   */
  _isRemarkableAthlete(ability) {
    return (game.settings.get("sentius", "rulesVersion") === "legacy") && this.getFlag("sentius", "remarkableAthlete")
      && CONFIG.SENTIUS.characterFlags.remarkableAthlete.abilities.includes(ability);
  }

  /* -------------------------------------------- */
  /*  Rolling                                     */
  /* -------------------------------------------- */

  /**
   * Add the reduction to this roll from exhaustion if using the modern rules.
   * @param {string[]} parts  Roll parts.
   * @param {object} data     Roll data.
   */
  addRollExhaustion(parts, data) {
    if ( (game.settings.get("sentius", "rulesVersion") !== "modern") || !this.system.attributes?.exhaustion ) return;
    const amount = this.system.attributes.exhaustion * (CONFIG.SENTIUS.conditionTypes.exhaustion?.reduction?.rolls ?? 0);
    if ( amount ) {
      parts.push("@exhaustion");
      data.exhaustion = -amount;
    }
  }

  /* -------------------------------------------- */

  /**
   * Roll an ability check with a skill.
   * @param {Partial<SkillToolRollProcessConfiguration>} config  Configuration information for the roll.
   * @param {Partial<SkillToolRollDialogConfiguration>} dialog   Configuration for the roll dialog.
   * @param {Partial<BasicRollMessageConfiguration>} message     Configuration for the roll message.
   * @returns {Promise<D20Roll[]|null>}                          A Promise which resolves to the created Roll instance.
   */
  async rollSkill(config={}, dialog={}, message={}) {
    return this.#rollSkillTool("skill", config, dialog, message);
  }

  /* -------------------------------------------- */

  /**
   * Roll an ability check with a tool.
   * @param {Partial<SkillToolRollProcessConfiguration>} config  Configuration information for the roll.
   * @param {Partial<SkillToolRollDialogConfiguration>} dialog   Configuration for the roll dialog.
   * @param {Partial<BasicRollMessageConfiguration>} message     Configuration for the roll message.
   * @returns {Promise<D20Roll[]|null>}                          A Promise which resolves to the created Roll instance.
   */
  async rollToolCheck(config={}, dialog={}, message={}) {
    return this.#rollSkillTool("tool", config, dialog, message);
  }

  /* -------------------------------------------- */

  /**
   * @typedef {D20RollProcessConfiguration} SkillToolRollProcessConfiguration
   * @property {string} [ability]  The ability to be rolled with the skill.
   * @property {string} [bonus]    Additional bonus term added to the check.
   * @property {Item5e} [item]     Tool item used for rolling.
   * @property {string} [skill]    The skill to roll.
   * @property {string} [tool]     The tool to roll.
   */

  /**
   * @typedef {BasicRollDialogConfiguration} SkillToolRollDialogConfiguration
   * @property {SkillToolRollConfigurationDialogOptions} [options]  Configuration options.
   */

  /**
   * Shared rolling functionality between skill & tool checks.
   * @param {"skill"|"tool"} type                                Type of roll.
   * @param {Partial<SkillToolRollProcessConfiguration>} config  Configuration information for the roll.
   * @param {Partial<SkillToolRollDialogConfiguration>} dialog   Configuration for the roll dialog.
   * @param {Partial<BasicRollMessageConfiguration>} message     Configuration for the roll message.
   * @returns {Promise<D20Roll[]|null>}                          A Promise which resolves to the created Roll instance.
   */
  async #rollSkillTool(type, config={}, dialog={}, message={}) {
    let oldFormat = false;
    const name = type === "skill" ? "Skill" : "ToolCheck";

    // Handle deprecated calling pattern
    if ( foundry.utils.getType(config) !== "Object" ) {
      foundry.utils.logCompatibilityWarning(
        `The \`roll${name}\` method on Actor5e now takes roll, dialog, and message config objects as parameters.`,
        { since: "SENTIUS", until: "SENTIUS" }
      );
      oldFormat = true;
      const oldConfig = dialog;
      config = { [type]: config };
      if ( oldConfig.ability ) config.ability = oldConfig.ability;
      if ( oldConfig.bonus ) config.bonus = oldConfig.bonus;
      dialog = {};
      _applyDeprecatedD20Configs(config, dialog, message, oldConfig);
    }

    const skillConfig = CONFIG.SENTIUS.skills[config.skill];
    const toolConfig = CONFIG.SENTIUS.tools[config.tool];
    if ( ((type === "skill") && !skillConfig) || ((type === "tool") && !toolConfig) ) {
      return this.rollAbilityTest(config, dialog, message);
    }

    const relevant = type === "skill" ? this.system.skills?.[config.skill] : this.system.tools?.[config.tool];
    const buildConfig = this._buildSkillToolConfig.bind(this, type, config.rolls?.shift());

    const rollConfig = foundry.utils.mergeObject({
      ability: relevant?.ability ?? (type === "skill" ? skillConfig.ability : toolConfig.ability),
      advantage: relevant?.roll.mode === CONFIG.Dice.D20Roll.ADV_MODE.ADVANTAGE,
      disadvantage: relevant?.roll.mode === CONFIG.Dice.D20Roll.ADV_MODE.DISADVANTAGE,
      halflingLucky: this.getFlag("sentius", "halflingLucky"),
      reliableTalent: (relevant?.value >= 1) && this.getFlag("sentius", "reliableTalent")
    }, config);
    rollConfig.hookNames = [...(config.hookNames ?? []), type, "abilityCheck", "d20Test"];
    rollConfig.rolls = [{
      options: {
        maximum: relevant?.roll.max,
        minimum: relevant?.roll.min
      }
    }].concat(config.rolls ?? []);
    rollConfig.subject = this;
    rollConfig.rolls.forEach((r, index) => buildConfig(rollConfig, r, null, index));

    const dialogConfig = foundry.utils.mergeObject({
      applicationClass: SkillToolRollConfigurationDialog,
      options: {
        buildConfig,
        chooseAbility: true
      }
    }, dialog);

    const messageConfig = foundry.utils.mergeObject({
      create: true,
      data: {
        flags: {
          sentius: {
            messageType: "roll",
            roll: {
              [`${type}Id`]: config[type],
              type
            }
          }
        },
        flavor: type === "skill" ? game.i18n.format("SENTIUS.SkillPromptTitle", { skill: skillConfig.label })
          : game.i18n.format("SENTIUS.ToolPromptTitle", { tool: Trait.keyLabel(config.tool, { trait: "tool" }) ?? "" }),
        speaker: ChatMessage.getSpeaker({ actor: this })
      }
    }, message);

    if ( `sentius.preRoll${name}` in Hooks.events ) {
      foundry.utils.logCompatibilityWarning(
        `The \`sentius.preRoll${name}\` hook has been deprecated and replaced with \`sentius.preRoll${type.capitalize()}V2\`.`,
        { since: "SENTIUS", until: "SENTIUS" }
      );
      const oldConfig = _createDeprecatedD20Config(rollConfig, dialogConfig, messageConfig);
      if ( Hooks.call(`sentius.preRoll${name}`, this, oldConfig, config.skill) === false ) return null;
      _applyDeprecatedD20Configs(rollConfig, dialogConfig, messageConfig, oldConfig);
    }

    const rolls = await CONFIG.Dice.D20Roll.build(rollConfig, dialogConfig, messageConfig);
    if ( !rolls.length ) return null;

    /**
     * A hook event that fires after an skill or tool check has been rolled.
     * @function sentius.rollSkillV2
     * @function sentius.rollToolCheckV2
     * @memberof hookEvents
     * @param {D20Roll[]} rolls       The resulting rolls.
     * @param {object} data
     * @param {string} [data.skill]   ID of the skill that was rolled as defined in `CONFIG.SENTIUS.skills`.
     * @param {string} [data.tool]    ID of the tool that was rolled as defined in `CONFIG.SENTIUS.tools`.
     * @param {Actor5e} data.subject  Actor for which the roll has been performed.
     */
    Hooks.callAll(`sentius.roll${name}V2`, rolls, { [type]: config[type], subject: this });

    if ( `sentius.roll${name}` in Hooks.events ) {
      foundry.utils.logCompatibilityWarning(
        `The \`sentius.roll${name}\` hook has been deprecated and replaced with \`sentius.roll${type.capitalize()}V2\`.`,
        { since: "SENTIUS", until: "SENTIUS" }
      );
      Hooks.callAll(`sentius.roll${name}`, this, rolls[0], config.skill);
    }

    return oldFormat ? rolls[0] : rolls;
  }

  /* -------------------------------------------- */

  /**
   * Configure a roll config for each roll performed as part of the skill or tool check process. Will be called once
   * per roll in the process each time an option is changed in the roll configuration interface.
   * @param {"skill"|"tool"} type                          Type of roll.
   * @param {Partial<D20RollConfiguration>} [initialRoll]  Initial roll passed to the rolling method.
   * @param {D20RollProcessConfiguration} process          Configuration for the entire rolling process.
   * @param {D20RollConfiguration} config                  Configuration for a specific roll.
   * @param {FormDataExtended} [formData]                  Any data entered into the rolling prompt.
   * @param {number} index                                 Index of the roll within all rolls being prepared.
   */
  _buildSkillToolConfig(type, initialRoll, process, config, formData, index) {
    const relevant = type === "skill" ? this.system.skills?.[process.skill] : this.system.tools?.[process.tool];
    const rollData = this.getRollData();
    const abilityId = formData?.get("ability") ?? process.ability;
    const ability = this.system.abilities?.[abilityId];
    const prof = this.system.calculateAbilityCheckProficiency(relevant?.effectValue ?? 0, abilityId);

    let { parts, data } = CONFIG.Dice.BasicRoll.constructParts({
      mod: ability?.mod,
      prof: prof?.hasProficiency ? prof.term : null,
      [`${config[type]}Bonus`]: relevant?.bonuses?.check,
      extraBonus: process.bonus,
      [`${abilityId}CheckBonus`]: ability?.bonuses?.check,
      [`${type}Bonus`]: this.system.bonuses?.abilities?.[type],
      abilityCheckBonus: this.system.bonuses?.abilities?.check,
      situational: config.data?.situational
    }, { ...rollData });
    const options = config.options ?? {};

    if ( index === 0 ) {
      if ( initialRoll?.data ) data = { ...data, ...initialRoll.data };
      if ( initialRoll?.parts ) parts.unshift(...initialRoll.parts);
      if ( initialRoll?.options ) foundry.utils.mergeObject(options, initialRoll.options);
    }

    // Add exhaustion reduction
    this.addRollExhaustion(parts, data);

    config.parts = parts;
    config.data = data;
    config.data.abilityId = abilityId;
    config.options = options;
  }

  /* -------------------------------------------- */

  /**
   * Roll a generic ability test or saving throw.
   * Prompt the user for input on which variety of roll they want to do.
   * @param {Partial<AbilityRollProcessConfiguration>} config  Configuration information for the roll.
   * @param {Partial<BasicRollDialogConfiguration>} dialog     Configuration for the roll dialog.
   * @param {Partial<BasicRollMessageConfiguration>} message   Configuration for the roll message.
   */
  rollAbility(config={}, dialog={}, message={}) {
    let abilityId = config;
    if ( foundry.utils.getType(config) === "Object" ) abilityId = config.ability;
    else foundry.utils.logCompatibilityWarning(
      "The `rollAbility` method on Actor5e now takes roll, dialog, and message config objects as parameters.",
      { since: "SENTIUS", until: "SENTIUS" }
    );
    const label = CONFIG.SENTIUS.abilities[abilityId]?.label ?? "";
    new Dialog({
      title: `${game.i18n.format("SENTIUS.AbilityPromptTitle", { ability: label })}: ${this.name}`,
      content: `<p>${game.i18n.format("SENTIUS.AbilityPromptText", { ability: label })}</p>`,
      buttons: {
        test: {
          label: game.i18n.localize("SENTIUS.ActionAbil"),
          callback: () => this.rollAbilityCheck(config, dialog, message)
        },
        save: {
          label: game.i18n.localize("SENTIUS.ActionSave"),
          callback: () => this.rollSavingThrow(config, dialog, message)
        }
      }
    }).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Roll an Ability Check.
   * @param {Partial<AbilityRollProcessConfiguration>} config  Configuration information for the roll.
   * @param {Partial<BasicRollDialogConfiguration>} dialog     Configuration for the roll dialog.
   * @param {Partial<BasicRollMessageConfiguration>} message   Configuration for the roll message.
   * @returns {Promise<D20Roll[]|null>}                        A Promise which resolves to the created Roll instance.
   */
  async rollAbilityCheck(config={}, dialog={}, message={}) {
    return this.#rollD20Test("check", config, dialog, message);
  }

  /**
   * Roll an Ability Test.
   * @param {Partial<AbilityRollProcessConfiguration>} config  Configuration information for the roll.
   * @param {Partial<BasicRollDialogConfiguration>} dialog     Configuration for the roll dialog.
   * @param {Partial<BasicRollMessageConfiguration>} message   Configuration for the roll message.
   * @returns {Promise<D20Roll[]|null>}                        A Promise which resolves to the created Roll instance.
   */
  async rollAbilityTest(config={}, dialog={}, message={}) {
    foundry.utils.logCompatibilityWarning(
      "The `rollAbilityTest` method on Actor5e has been renamed `rollAbilityCheck`.",
      { since: "SENTIUS", until: "SENTIUS" }
    );
    return this.rollAbilityCheck(config, dialog, message);
  }

  /* -------------------------------------------- */

  /**
   * Roll a Saving Throw.
   * @param {Partial<AbilityRollProcessConfiguration>} config  Configuration information for the roll.
   * @param {Partial<BasicRollDialogConfiguration>} dialog     Configuration for the roll dialog.
   * @param {Partial<BasicRollMessageConfiguration>} message   Configuration for the roll message.
   * @returns {Promise<D20Roll[]|null>}                        A Promise which resolves to the created Roll instances.
   */
  async rollSavingThrow(config={}, dialog={}, message={}) {
    return this.#rollD20Test("save", config, dialog, message);
  }

  /**
   * Roll an Ability Saving Throw.
   * @param {Partial<AbilityRollProcessConfiguration>} config  Configuration information for the roll.
   * @param {Partial<BasicRollDialogConfiguration>} dialog     Configuration for the roll dialog.
   * @param {Partial<BasicRollMessageConfiguration>} message   Configuration for the roll message.
   * @returns {Promise<D20Roll[]|null>}                        A Promise which resolves to the created Roll instances.
   */
  async rollAbilitySave(config={}, dialog={}, message={}) {
    foundry.utils.logCompatibilityWarning(
      "The `rollAbilitySave` method on Actor5e has been renamed `rollSavingThrow`.",
      { since: "SENTIUS", until: "SENTIUS" }
    );
    return this.rollSavingThrow(config, dialog, message);
  }

  /* -------------------------------------------- */

  /**
   * @typedef {D20RollProcessConfiguration} AbilityRollProcessConfiguration
   * @property {string} [ability]  ID of the ability to roll as found in `CONFIG.SENTIUS.abilities`.
   */

  /**
   * Shared rolling functionality between ability checks & saving throws.
   * @param {"check"|"save"} type                     D20 test type.
   * @param {Partial<AbilityRollProcessConfiguration>} config  Configuration information for the roll.
   * @param {Partial<BasicRollDialogConfiguration>} dialog     Configuration for the roll dialog.
   * @param {Partial<BasicRollMessageConfiguration>} message   Configuration for the roll message.
   * @returns {Promise<D20Roll[]|null>}               A Promise which resolves to the created Roll instance.
   */
  async #rollD20Test(type, config={}, dialog={}, message={}) {
    let oldFormat = false;
    const name = type === "check" ? "AbilityCheck" : "SavingThrow";
    const oldName = type === "check" ? "AbilityTest" : "AbilitySave";

    // Handle deprecated calling pattern
    if ( config && (foundry.utils.getType(config) !== "Object") ) {
      foundry.utils.logCompatibilityWarning(
        `The \`roll${oldName}\` method on Actor5e now takes roll, dialog, and message config objects as parameters.`,
        { since: "SENTIUS", until: "SENTIUS" }
      );
      oldFormat = true;
      const oldConfig = dialog;
      config = { ability: config };
      dialog = {};
      _applyDeprecatedD20Configs(config, dialog, message, oldConfig);
    }

    const ability = this.system.abilities?.[config.ability];
    const abilityConfig = CONFIG.SENTIUS.abilities[config.ability];

    const rollData = this.getRollData();
    let { parts, data } = CONFIG.Dice.BasicRoll.constructParts({
      mod: ability?.mod,
      prof: ability?.[`${type}Prof`].hasProficiency ? ability[`${type}Prof`].term : null,
      [`${config.ability}${type.capitalize()}Bonus`]: ability?.bonuses[type],
      [`${type}Bonus`]: this.system.bonuses?.abilities?.[type],
      cover: (config.ability === "dex") && (type === "save") ? this.system.attributes?.ac?.cover : null
    }, rollData);
    const options = {};

    const initialRoll = config.rolls?.pop();
    if ( initialRoll?.data ) data = { ...data, ...initialRoll.data };
    if ( initialRoll?.parts ) parts.unshift(...initialRoll.parts);
    if ( initialRoll?.options ) foundry.utils.mergeObject(options, initialRoll.options);

    const rollConfig = foundry.utils.mergeObject({
      halflingLucky: this.getFlag("sentius", "halflingLucky")
    }, config);
    rollConfig.hookNames = [...(config.hookNames ?? []), name, "d20Test"];
    rollConfig.rolls = [{ parts, data, options }].concat(config.rolls ?? []);
    rollConfig.rolls.forEach(({ parts, data }) => this.addRollExhaustion(parts, data));
    rollConfig.subject = this;

    const dialogConfig = foundry.utils.deepClone(dialog);

    const messageConfig = foundry.utils.mergeObject({
      create: true,
      data: {
        flags: {
          sentius: {
            messageType: "roll",
            roll: {
              ability: config.ability,
              type: type === "check" ? "ability" : "save"
            }
          }
        },
        flavor: game.i18n.format(
          `SENTIUS.${type === "check" ? "Ability" : "Save"}PromptTitle`, { ability: abilityConfig?.label ?? "" }
        ),
        speaker: ChatMessage.getSpeaker({ actor: this })
      }
    }, message);

    if ( "sentius.preRollAbilityTest" in Hooks.events ) {
      foundry.utils.logCompatibilityWarning(
        `The \`sentius.preRoll${oldName}\` hook has been deprecated and replaced with \`sentius.preRoll${name}V2\`.`,
        { since: "SENTIUS", until: "SENTIUS" }
      );
      const oldConfig = _createDeprecatedD20Config(rollConfig, dialogConfig, messageConfig);
      if ( Hooks.call(`sentius.preRoll${oldName}`, this, oldConfig, config.ability) === false ) return null;
      _applyDeprecatedD20Configs(rollConfig, dialogConfig, messageConfig, oldConfig);
    }

    const rolls = await CONFIG.Dice.D20Roll.build(rollConfig, dialogConfig, messageConfig);
    if ( !rolls.length ) return null;

    /**
     * A hook event that fires after an ability check or save has been rolled.
     * @function sentius.rollAbilityCheck
     * @function sentius.rollSavingThrow
     * @memberof hookEvents
     * @param {D20Roll[]} rolls       The resulting rolls.
     * @param {object} data
     * @param {string} data.ability   ID of the ability that was rolled as defined in `CONFIG.SENTIUS.abilities`.
     * @param {Actor5e} data.subject  Actor for which the roll has been performed.
     */
    Hooks.callAll(`sentius.roll${name}`, rolls, { ability: config.ability, subject: this });

    if ( `sentius.roll${name}` in Hooks.events ) {
      foundry.utils.logCompatibilityWarning(
        `The \`sentius.roll${oldName}\` hook has been deprecated and replaced with \`sentius.roll${name}\`.`,
        { since: "SENTIUS", until: "SENTIUS" }
      );
      Hooks.callAll(`sentius.roll${oldName}`, this, rolls[0], config.ability);
    }

    return oldFormat ? rolls[0] : rolls;
  }

  /* -------------------------------------------- */

  /**
   * Perform a death saving throw, rolling a d20 plus any global save bonuses.
   * @param {Partial<D20RollProcessConfiguration>} config     Configuration information for the roll.
   * @param {Partial<BasicRollDialogConfiguration>} dialog    Configuration for the roll dialog.
   * @param {Partial<BasicRollMessageConfiguration>} message  Configuration for the roll message.
   * @returns {Promise<D20Roll[]|null>}                       A Promise which resolves to the Roll instance.
   */
  async rollDeathSave(config={}, dialog={}, message={}) {
    let oldFormat = false;
    const death = this.system.attributes.death;
    if ( !death ) throw new Error(`Actors of the type '${this.type}' don't support death saves.`);

    // Handle deprecated config object
    if ( config.legacy !== false ) {
      foundry.utils.logCompatibilityWarning(
        "The `rollDeathSave` method on Actor5e now takes roll, dialog, and message config objects as parameters. "
        + "Pass the `legacy: false` option to config object to suppress this warning once updates have been made.",
        { since: "SENTIUS", until: "SENTIUS" }
      );
      oldFormat = true;
      const oldConfig = config;
      config = {};
      _applyDeprecatedD20Configs(config, dialog, message, oldConfig);
    }

    // Display a warning if we are not at zero HP or if we already have reached 3
    if ( (this.system.attributes.hp.value > 0) || (death.failure >= 3) || (death.success >= 3) ) {
      ui.notifications.warn("SENTIUS.DeathSaveUnnecessary", { localize: true });
      return null;
    }

    const parts = [];
    let data = {};
    const options = {
      advantage: death.roll.mode === CONFIG.Dice.D20Roll.ADV_MODE.ADVANTAGE,
      disadvantage: death.roll.mode === CONFIG.Dice.D20Roll.ADV_MODE.DISADVANTAGE,
      maximum: death.roll.max,
      minimum: death.roll.min
    };

    // Diamond Soul adds proficiency
    if ( this.getFlag("sentius", "diamondSoul") ) {
      parts.push("@prof");
      data.prof = new Proficiency(this.system.attributes.prof, 1).term;
    }

    const initialRoll = config.rolls?.pop();
    if ( initialRoll?.data ) data = { ...data, ...initialRoll.data };
    if ( initialRoll?.parts ) parts.unshift(...initialRoll.parts);
    if ( initialRoll?.options ) foundry.utils.mergeObject(options, initialRoll.options);

    const rollConfig = foundry.utils.mergeObject({ target: 10 }, config);
    rollConfig.hookNames = [...(config.hookNames ?? []), "deathSave"];
    rollConfig.rolls = [{ parts, data, options }].concat(config.rolls ?? []);

    const dialogConfig = foundry.utils.deepClone(dialog);

    const messageConfig = foundry.utils.mergeObject({
      data: {
        flags: {
          sentius: {
            roll: {
              type: "death"
            }
          }
        },
        flavor: game.i18n.localize("SENTIUS.DeathSavingThrow")
      }
    }, message);

    if ( "sentius.preRollDeathSave" in Hooks.events ) {
      foundry.utils.logCompatibilityWarning(
        "The `sentius.preRollDeathSave` hook has been deprecated and replaced with `sentius.preRollDeathSaveV2`.",
        { since: "SENTIUS", until: "SENTIUS" }
      );
      const oldConfig = _createDeprecatedD20Config(rollConfig, dialogConfig, messageConfig);
      if ( Hooks.call("sentius.preRollDeathSave", this, oldConfig) === false ) return null;
      _applyDeprecatedD20Configs(rollConfig, dialogConfig, messageConfig, oldConfig);
    }

    const rolls = await this.rollSavingThrow(rollConfig, dialogConfig, messageConfig);
    if ( !rolls?.length ) return null;

    // Take action depending on the result
    const details = {};
    const roll = rolls[0];
    const returnValue = oldFormat ? roll : rolls;

    // Save success
    if ( roll.total >= (roll.options.target ?? 10) ) {
      let successes = (death.success || 0) + 1;

      // Critical Success = revive with 1hp
      if ( roll.isCritical ) {
        details.updates = {
          "system.attributes.death.success": 0,
          "system.attributes.death.failure": 0,
          "system.attributes.hp.value": 1
        };
        details.chatString = "SENTIUS.DeathSaveCriticalSuccess";
      }

      // 3 Successes = survive and reset checks
      else if ( successes === 3 ) {
        details.updates = {
          "system.attributes.death.success": 0,
          "system.attributes.death.failure": 0
        };
        details.chatString = "SENTIUS.DeathSaveSuccess";
      }

      // Increment successes
      else details.updates = {"system.attributes.death.success": Math.clamp(successes, 0, 3)};
    }

    // Save failure
    else {
      let failures = (death.failure || 0) + (roll.isFumble ? 2 : 1);
      details.updates = {"system.attributes.death.failure": Math.clamp(failures, 0, 3)};
      if ( failures >= 3 ) {  // 3 Failures = death
        details.chatString = "SENTIUS.DeathSaveFailure";
      }
    }

    /**
     * A hook event that fires after a death saving throw has been rolled for an Actor, but before
     * updates have been performed.
     * @function sentius.rollDeathSave
     * @memberof hookEvents
     * @param {D20Roll[]} rolls         The resulting rolls.
     * @param {object} data
     * @param {string} data.chatString  Localizable string displayed in the create chat message. If not set, then
     *                                  no chat message will be displayed.
     * @param {object} data.updates     Updates that will be applied to the actor as a result of this save.
     * @param {Actor5e} data.subject    Actor for which the death saving throw has been rolled.
     * @returns {boolean}               Explicitly return `false` to prevent updates from being performed.
     */
    if ( Hooks.call("sentius.rollDeathSaveV2", rolls, { ...details, subject: this }) === false ) return returnValue;

    if ( "sentius.rollDeathSave" in Hooks.events ) {
      foundry.utils.logCompatibilityWarning(
        "The `sentius.rollDeathSave` hook has been deprecated and replaced with `sentius.rollDeathSaveV2`.",
        { since: "SENTIUS", until: "SENTIUS" }
      );
      if ( Hooks.call("sentius.rollDeathSave", this, rolls[0], details) === false ) return returnValue;
    }

    if ( !foundry.utils.isEmpty(details.updates) ) await this.update(details.updates);

    // Display success/failure chat message
    let resultsMessage;
    if ( details.chatString ) {
      const chatData = {
        content: game.i18n.format(details.chatString, { name: this.name }),
        speaker: messageConfig.speaker ?? ChatMessage.getSpeaker({ actor: this })
      };
      ChatMessage.applyRollMode(chatData, roll.options.rollMode);
      resultsMessage = await ChatMessage.create(chatData);
    }

    /**
     * A hook event that fires after a death saving throw has been rolled and after changes have been applied.
     * @function sentius.postRollDeathSave
     * @memberof hookEvents
     * @param {D20Roll[]} rolls                  The resulting rolls.
     * @param {object} data
     * @param {ChatMessage5e|void} data.message  The created results chat message.
     * @param {Actor5e} data.subject             Actor for which the death saving throw has been rolled.
     */
    Hooks.callAll("sentius.postRollDeathSave", rolls, { message: resultsMessage, subject: this });

    return returnValue;
  }

  /* -------------------------------------------- */

  /**
   * Perform a saving throw to maintain concentration.
   * @param {Partial<AbilityRollProcessConfiguration>} config  Configuration information for the roll.
   * @param {Partial<BasicRollDialogConfiguration>} dialog     Configuration for the roll dialog.
   * @param {Partial<BasicRollMessageConfiguration>} message   Configuration for the roll message.
   * @returns {Promise<D20Roll[]|null>}                        A Promise which resolves to the created Roll instance.
   */
  async rollConcentration(config={}, dialog={}, message={}) {
    let oldFormat = false;
    if ( !this.isOwner ) return null;
    const conc = this.system.attributes?.concentration;
    if ( !conc ) throw new Error("You may not make a Concentration Saving Throw with this Actor.");

    // Handle deprecated config object
    if ( config.legacy !== false ) {
      foundry.utils.logCompatibilityWarning(
        "The `rollConcentration` method on Actor5e now takes roll, dialog, and message config objects as parameters."
        + "Pass the `legacy: false` option to config object to suppress this warning once updates have been made.",
        { since: "SENTIUS", until: "SENTIUS" }
      );
      oldFormat = true;
      const oldConfig = config;
      config = {};
      _applyDeprecatedD20Configs(config, dialog, message, oldConfig);
    }

    let data = {};
    const parts = [];
    const options = {
      advantage: conc.roll.mode === CONFIG.Dice.D20Roll.ADV_MODE.ADVANTAGE,
      disadvantage: conc.roll.mode === CONFIG.Dice.D20Roll.ADV_MODE.DISADVANTAGE,
      maximum: conc.roll.max,
      minimum: conc.roll.min
    };

    // Concentration bonus
    if ( conc.bonuses.save ) parts.push(conc.bonuses.save);

    const initialRoll = config.rolls?.pop();
    if ( initialRoll?.data ) data = { ...data, ...initialRoll.data };
    if ( initialRoll?.parts ) parts.unshift(...initialRoll.parts);
    if ( initialRoll?.options ) foundry.utils.mergeObject(options, initialRoll.options);

    const rollConfig = foundry.utils.mergeObject({
      ability: (conc.ability in CONFIG.SENTIUS.abilities) ? conc.ability : CONFIG.SENTIUS.defaultAbilities.concentration,
      isConcentration: true,
      target: 10
    }, config);
    rollConfig.hookNames = [...(config.hookNames ?? []), "concentration"];
    rollConfig.rolls = [{ parts, data, options }].concat(config.rolls ?? []);

    const dialogConfig = foundry.utils.deepClone(dialog);

    const messageConfig = foundry.utils.deepClone(message);

    /**
     * A hook event that fires before a saving throw to maintain concentration is rolled for an Actor.
     * @function sentius.preRollConcentration
     * @memberof hookEvents
     * @param {Actor5e} actor                   Actor for which the saving throw is being rolled.
     * @param {D20RollConfiguration} options    Configuration data for the pending roll.
     * @returns {boolean}                       Explicitly return `false` to prevent the save from being performed.
     */
    if ( "sentius.preRollConcentration" in Hooks.events ) {
      foundry.utils.logCompatibilityWarning(
        "The `sentius.preRollConcentration` hook has been deprecated and replaced with `sentius.preRollConcentrationV2`.",
        { since: "SENTIUS", until: "SENTIUS" }
      );
      const oldConfig = _createDeprecatedD20Config(rollConfig, dialogConfig, messageConfig);
      if ( Hooks.call("sentius.preRollConcentration", this, oldConfig) === false ) return null;
      _applyDeprecatedD20Configs(rollConfig, dialogConfig, messageConfig, oldConfig);
    }

    const rolls = await this.rollSavingThrow(rollConfig, dialogConfig, messageConfig);
    if ( !rolls?.length ) return null;

    /**
     * A hook event that fires after a saving throw to maintain concentration is rolled for an Actor.
     * @function sentius.rollConcentration
     * @memberof hookEvents
     * @param {D20Roll[]} rolls     The resulting rolls.
     * @param {object} data
     * @param {Actor5e} data.actor  Actor for which the saving throw has been rolled.
     */
    Hooks.callAll("sentius.rollConcentrationV2", rolls, { subject: this });

    if ( "sentius.rollConcentration" in Hooks.events ) {
      foundry.utils.logCompatibilityWarning(
        "The `sentius.rollConcentration` hook has been deprecated and replaced with `sentius.rollConcentrationV2`.",
        { since: "SENTIUS", until: "SENTIUS" }
      );
      Hooks.callAll("sentius.rollConcentration", this, rolls[0]);
    }

    return oldFormat ? rolls[0] : rolls;
  }

  /* -------------------------------------------- */

  /**
   * @typedef {D20RollOptions} InitiativeRollOptions
   * @property {D20Roll.ADV_MODE} [advantageMode]  A specific advantage mode to apply.
   * @property {number} [fixed]                    Fixed initiative value to use rather than rolling.
   * @property {string} [flavor]                   Special flavor text to apply to the created message.
   */

  /**
   * Get an un-evaluated D20Roll instance used to roll initiative for this Actor.
   * @param {Partial<InitiativeRollOptions>} options  Configuration information for the roll.
   * @returns {D20Roll|null}                          The constructed but unevaluated D20Roll.
   */
  getInitiativeRoll(options={}) {
    // Use a temporarily cached initiative roll
    if ( this._cachedInitiativeRoll ) return this._cachedInitiativeRoll.clone();
    const config = this.getInitiativeRollConfig(options);
    if ( !config ) return null;

    // Create a normal D20 roll
    if ( config.options?.fixed === undefined ) {
      const formula = ["1d20"].concat(config.parts).join(" + ");
      return new CONFIG.Dice.D20Roll(formula, config.data, config.options);
    }

    // Create a basic roll with the fixed score
    return new CONFIG.Dice.BasicRoll(String(config.options.fixed), config.data, config.options);
  }

  /* -------------------------------------------- */

  /**
   * Get an un-evaluated D20Roll instance used to roll initiative for this Actor.
   * @param {Partial<InitiativeRollOptions>} options  Configuration information for the roll.
   * @returns {D20RollConfiguration|null}             Roll configuration.
   */
  getInitiativeRollConfig(options={}) {
    const init = this.system.attributes?.init;
    const flags = this.flags.sentius ?? {};
    const abilityId = init?.ability || CONFIG.SENTIUS.defaultAbilities.initiative;
    const ability = this.system.abilities?.[abilityId];

    const rollData = this.getRollData();
    let { parts, data } = CONFIG.Dice.BasicRoll.constructParts({
      mod: init?.mod,
      prof: init.prof.hasProficiency ? init.prof.term : null,
      initiativeBonus: init.bonus,
      [`${abilityId}AbilityCheckBonus`]: ability?.bonuses?.check,
      abilityCheckBonus: this.system.bonuses?.abilities?.check,
      alert: flags.initiativeAlert && (game.settings.get("sentius", "rulesVersion") === "legacy") ? 5 : null
    }, rollData);

    const remarkableAthlete = flags.remarkableAthlete && (game.settings.get("sentius", "rulesVersion") === "modern");
    if ( flags.initiativeAdv || remarkableAthlete ) options.advantage ??= true;

    // Add exhaustion reduction
    this.addRollExhaustion(parts, data);

    // Ability score tiebreaker
    const tiebreaker = game.settings.get("sentius", "initiativeDexTiebreaker");
    if ( tiebreaker && Number.isNumeric(ability?.value) ) parts.push(String(ability.value / 100));

    // Fixed initiative score
    const scoreMode = game.settings.get("sentius", "initiativeScore");
    const useScore = (scoreMode === "all") || ((scoreMode === "npcs") && game.user.isGM && (this.type === "npc"));

    options = foundry.utils.mergeObject({
      fixed: useScore ? init.score : undefined,
      flavor: options.flavor ?? game.i18n.localize("SENTIUS.Initiative"),
      halflingLucky: flags.halflingLucky ?? false,
      maximum: init.roll.max,
      minimum: init.roll.min
    }, options);

    const rollConfig = { parts, data, options, subject: this };

    /**
     * A hook event that fires before initiative roll is prepared for an Actor.
     * @function sentius.preConfigureInitiative
     * @memberof hookEvents
     * @param {Actor5e} subject              The Actor that is rolling initiative.
     * @param {D20RollConfiguration} config  Configuration data for the pending roll.
     */
    Hooks.callAll("sentius.preConfigureInitiative", this, rollConfig);

    return rollConfig;
  }

  /* -------------------------------------------- */

  /**
   * Roll initiative for this Actor with a dialog that provides an opportunity to elect advantage or other bonuses.
   * @param {Partial<InitiativeRollOptions>} [rollOptions={}]  Options forwarded to the Actor#getInitiativeRoll method.
   * @returns {Promise<void>}           A promise which resolves once initiative has been rolled for the Actor.
   */
  async rollInitiativeDialog(rollOptions={}) {
    const config = {
      evaluate: false,
      event: rollOptions.event,
      hookNames: ["initiativeDialog", "abilityCheck", "d20Test"],
      rolls: [this.getInitiativeRollConfig(rollOptions)],
      subject: this
    };
    if ( !config.rolls[0] ) return;

    // Display the roll configuration dialog
    if ( config.rolls[0].options?.fixed === undefined ) {
      const dialog = { options: { title: game.i18n.localize("SENTIUS.InitiativeRoll") } };
      const message = { rollMode: game.settings.get("core", "rollMode") };
      const rolls = await CONFIG.Dice.D20Roll.build(config, dialog, message);
      if ( !rolls.length ) return;
      this._cachedInitiativeRoll = rolls[0];
    }

    // Just create a basic roll with the fixed score
    else {
      const { data, options } = config.rolls[0];
      this._cachedInitiativeRoll = new CONFIG.Dice.BasicRoll(String(options.fixed), data, options);
    }

    await this.rollInitiative({ createCombatants: true });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async rollInitiative(options={}, rollOptions={}) {
    this._cachedInitiativeRoll ??= this.getInitiativeRoll(rollOptions);

    /**
     * A hook event that fires before initiative is rolled for an Actor.
     * @function sentius.preRollInitiative
     * @memberof hookEvents
     * @param {Actor5e} actor  The Actor that is rolling initiative.
     * @param {D20Roll} roll   The initiative roll.
     */
    if ( Hooks.call("sentius.preRollInitiative", this, this._cachedInitiativeRoll) === false ) {
      delete this._cachedInitiativeRoll;
      return null;
    }

    const combat = await super.rollInitiative(options);
    const combatants = this.isToken ? this.getActiveTokens(false, true).reduce((arr, t) => {
      const combatant = game.combat.getCombatantByToken(t.id);
      if ( combatant ) arr.push(combatant);
      return arr;
    }, []) : [game.combat.getCombatantByActor(this.id)];

    /**
     * A hook event that fires after an Actor has rolled for initiative.
     * @function sentius.rollInitiative
     * @memberof hookEvents
     * @param {Actor5e} actor           The Actor that rolled initiative.
     * @param {Combatant[]} combatants  The associated Combatants in the Combat.
     */
    Hooks.callAll("sentius.rollInitiative", this, combatants);
    delete this._cachedInitiativeRoll;
    return combat;
  }

  /* -------------------------------------------- */

  /**
   * @typedef {BasicRollProcessConfiguration} HitDieRollProcessConfiguration
   * @property {string} [denomination]  The denomination of hit die to roll with the leading letter (e.g. `d8`).
   *                                    If no denomination is provided, the first available hit die will be used.
   * @property {boolean} [modifyHitDice=true]    Should the actor's spent hit dice count be updated?
   * @property {boolean} [modifyHitPoints=true]  Should the actor's hit points be updated after the roll?
   */

  /**
   * Roll a hit die of the appropriate type, gaining hit points equal to the die roll plus your CON modifier.
   * @param {HitDieRollProcessConfiguration} config  Configuration information for the roll.
   * @param {BasicRollDialogConfiguration} dialog    Configuration for the roll dialog.
   * @param {BasicRollMessageConfiguration} message  Configuration for the roll message.
   * @returns {Promise<BasicRoll[]|null>}            The created Roll instances, or `null` if no hit die was rolled.
   */
  async rollHitDie(config={}, dialog={}, message={}) {
    let formula;
    let oldFormat = false;

    // Handle deprecated calling pattern
    if ( config && (foundry.utils.getType(config) !== "Object") ) {
      foundry.utils.logCompatibilityWarning(
        "Actor5e.rollHitDie now takes roll, dialog, and message config objects as parameters.",
        { since: "SENTIUS", until: "SENTIUS"" }
      );
      oldFormat = true;
      formula = dialog.formula;
      config = { denomination: config, data: dialog.data };
      message = { create: dialog.chatMessage, data: dialog.messageData };
      dialog = {};
    }

    let cls = null;

    // NPCs only have one denomination
    if ( this.type === "npc" ) {
      config.denomination = `d${this.system.attributes.hd.denomination}`;

      // If no hit dice are available, display an error notification
      if ( !this.system.attributes.hd.value ) {
        ui.notifications.error(game.i18n.format("SENTIUS.HitDiceNPCWarn", {name: this.name}));
        return null;
      }
    }

    // Otherwise check classes
    else {
      // If no denomination was provided, choose the first available
      if ( !config.denomination ) {
        cls = this.system.attributes.hd.classes.find(c => c.system.hd.value);
        if ( !cls ) return null;
        config.denomination = cls.system.hd.denomination;
      }

      // Otherwise, locate a class (if any) which has an available hit die of the requested denomination
      else cls = this.system.attributes.hd.classes.find(i => {
        return (i.system.hd.denomination === config.denomination) && i.system.hd.value;
      });

      // If no class is available, display an error notification
      if ( !cls ) {
        ui.notifications.error(game.i18n.format("SENTIUS.HitDiceWarn", {name: this.name, formula: config.denomination}));
        return null;
      }
    }

    formula ??= `max(0, 1${config.denomination} + @abilities.con.mod)`;
    const rollConfig = foundry.utils.deepClone(config);
    rollConfig.hookNames = [...(config.hookNames ?? []), "hitDie"];
    rollConfig.rolls = [{ parts: [formula], data: this.getRollData() }].concat(config.rolls ?? []);
    rollConfig.subject = this;

    const dialogConfig = foundry.utils.mergeObject({
      configure: false
    }, dialog);

    const flavor = game.i18n.localize("SENTIUS.HitDiceRoll");
    const messageConfig = foundry.utils.mergeObject({
      rollMode: game.settings.get("core", "rollMode"),
      data: {
        speaker: ChatMessage.implementation.getSpeaker({actor: this}),
        flavor,
        title: `${flavor}: ${this.name}`,
        "flags.sentius.roll": {type: "hitDie"}
      }
    }, message);

    if ( "sentius.preRollHitDie" in Hooks.events ) {
      foundry.utils.logCompatibilityWarning(
        "The `sentius.preRollHitDie` hook has been deprecated and replaced with `sentius.preRollHitDieV2`.",
        { since: "SENTIUS", until: "SENTIUS"" }
      );
      const hookData = {
        formula: rollConfig.rolls[0].parts[0], data: rollConfig.rolls[0].data,
        chatMessage: messageConfig.create, messageData: messageConfig.data
      };
      if ( Hooks.call("sentius.preRollHitDie", this, hookData, rollConfig.denomination) === false ) return null;
      rollConfig.rolls[0].parts[0] = hookData.formula;
      rollConfig.rolls[0].data = hookData.data;
      messageConfig.create = hookData.chatMessage;
      messageConfig.data = hookData.messageData;
    }

    const rolls = await CONFIG.Dice.BasicRoll.build(rollConfig, dialogConfig, messageConfig);
    if ( !rolls.length ) return null;
    const returnValue = oldFormat && rolls?.length ? rolls[0] : rolls;

    const updates = { actor: {}, class: {} };
    if ( rollConfig.modifyHitDice !== false ) {
      if ( cls ) updates.class["system.hd.spent"] = cls.system.hd.spent + 1;
      else updates.actor["system.attributes.hd.spent"] = this.system.attributes.hd.spent + 1;
    }
    const hp = this.system.attributes.hp;
    if ( rollConfig.modifyHitPoints !== false ) {
      const dhp = Math.min(Math.max(0, hp.effectiveMax) - hp.value, rolls.reduce((t, r) => t + r.total, 0));
      updates.actor["system.attributes.hp.value"] = hp.value + dhp;
    }

    /**
     * A hook event that fires after a hit die has been rolled for an Actor, but before updates have been performed.
     * @function sentius.rollHitDieV2
     * @memberof hookEvents
     * @param {BasicRoll[]} rolls          The resulting rolls.
     * @param {object} data
     * @param {Actor5e} data.subject       Actor for which the hit die has been rolled.
     * @param {object} data.updates
     * @param {object} data.updates.actor  Updates that will be applied to the actor.
     * @param {object} data.updates.class  Updates that will be applied to the class.
     * @returns {boolean}                  Explicitly return `false` to prevent updates from being performed.
     */
    if ( Hooks.call("sentius.rollHitDieV2", rolls, { subject: this, updates }) === false ) return returnValue;

    if ( "sentius.rollHitDie" in Hooks.events ) {
      foundry.utils.logCompatibilityWarning(
        "The `sentius.rollHitDie` hook has been deprecated and replaced with `sentius.rollHitDieV2`.",
        { since: "SENTIUS", until: "SENTIUS"" }
      );
      if ( Hooks.call("sentius.rollHitDie", this, rolls[0], updates) === false ) return null;
    }

    // Perform updates
    if ( !foundry.utils.isEmpty(updates.actor) ) await this.update(updates.actor);
    if ( !foundry.utils.isEmpty(updates.class) ) await cls.update(updates.class);

    /**
     * A hook event that fires after a hit die has been rolled for an Actor and updates have been performed.
     * @function sentius.postRollHitDie
     * @memberof hookEvents
     * @param {BasicRoll[]} rolls     The resulting rolls.
     * @param {object} data
     * @param {Actor5e} data.subject  Actor for which the roll was performed.
     */
    Hooks.callAll("sentius.postRollHitDie", rolls, { subject: this });

    return returnValue;
  }

  /* -------------------------------------------- */

  /**
   * Roll hit points for a specific class as part of a level-up workflow.
   * @param {Item5e} item                         The class item whose hit dice to roll.
   * @param {object} options
   * @param {boolean} [options.chatMessage=true]  Display the chat message for this roll.
   * @returns {Promise<Roll>}                     The completed roll.
   * @see {@link sentius.preRollClassHitPoints}
   */
  async rollClassHitPoints(item, { chatMessage=true }={}) {
    if ( item.type !== "class" ) throw new Error("Hit points can only be rolled for a class item.");
    const rollData = {
      formula: `1${item.system.hd.denomination}`,
      data: item.getRollData(),
      chatMessage
    };
    const flavor = game.i18n.format("SENTIUS.AdvancementHitPointsRollMessage", { class: item.name });
    const messageData = {
      title: `${flavor}: ${this.name}`,
      flavor,
      speaker: ChatMessage.implementation.getSpeaker({ actor: this }),
      "flags.sentius.roll": { type: "hitPoints" }
    };

    /**
     * A hook event that fires before hit points are rolled for a character's class.
     * @function sentius.preRollClassHitPoints
     * @memberof hookEvents
     * @param {Actor5e} actor            Actor for which the hit points are being rolled.
     * @param {Item5e} item              The class item whose hit dice will be rolled.
     * @param {object} rollData
     * @param {string} rollData.formula  The string formula to parse.
     * @param {object} rollData.data     The data object against which to parse attributes within the formula.
     * @param {object} messageData       The data object to use when creating the message.
     */
    Hooks.callAll("sentius.preRollClassHitPoints", this, item, rollData, messageData);

    const roll = new Roll(rollData.formula, rollData.data);
    await roll.evaluate();

    /**
     * A hook event that fires after hit points haven been rolled for a character's class.
     * @function sentius.rollClassHitPoints
     * @memberof hookEvents
     * @param {Actor5e} actor  Actor for which the hit points have been rolled.
     * @param {Roll} roll      The resulting roll.
     */
    Hooks.callAll("sentius.rollClassHitPoints", this, roll);

    if ( rollData.chatMessage ) await roll.toMessage(messageData);
    return roll;
  }

  /* -------------------------------------------- */

  /**
   * Roll hit points for an NPC based on the HP formula.
   * @param {object} options
   * @param {boolean} [options.chatMessage=true]  Display the chat message for this roll.
   * @returns {Promise<Roll>}                     The completed roll.
   * @see {@link sentius.preRollNPCHitPoints}
   */
  async rollNPCHitPoints({ chatMessage=true }={}) {
    if ( this.type !== "npc" ) throw new Error("NPC hit points can only be rolled for NPCs");
    const rollData = {
      formula: this.system.attributes.hp.formula,
      data: this.getRollData(),
      chatMessage
    };
    const flavor = game.i18n.format("SENTIUS.HPFormulaRollMessage");
    const messageData = {
      title: `${flavor}: ${this.name}`,
      flavor,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      "flags.sentius.roll": { type: "hitPoints" }
    };

    /**
     * A hook event that fires before hit points are rolled for an NPC.
     * @function sentius.preRollNPCHitPoints
     * @memberof hookEvents
     * @param {Actor5e} actor            Actor for which the hit points are being rolled.
     * @param {object} rollData
     * @param {string} rollData.formula  The string formula to parse.
     * @param {object} rollData.data     The data object against which to parse attributes within the formula.
     * @param {object} messageData       The data object to use when creating the message.
     */
    Hooks.callAll("sentius.preRollNPCHitPoints", this, rollData, messageData);

    const roll = new Roll(rollData.formula, rollData.data);
    await roll.evaluate();

    /**
     * A hook event that fires after hit points are rolled for an NPC.
     * @function sentius.rollNPCHitPoints
     * @memberof hookEvents
     * @param {Actor5e} actor  Actor for which the hit points have been rolled.
     * @param {Roll} roll      The resulting roll.
     */
    Hooks.callAll("sentius.rollNPCHitPoints", this, roll);

    if ( rollData.chatMessage ) await roll.toMessage(messageData);
    return roll;
  }

  /* -------------------------------------------- */
  /*  Resting                                     */
  /* -------------------------------------------- */

  /**
   * Configuration options for a rest.
   *
   * @typedef {object} RestConfiguration
   * @property {string} type               Type of rest to perform.
   * @property {boolean} dialog            Present a dialog window which allows for rolling hit dice as part of the
   *                                       Short Rest and selecting whether a new day has occurred.
   * @property {boolean} chat              Should a chat message be created to summarize the results of the rest?
   * @property {number} duration           Amount of time passed during the rest in minutes.
   * @property {boolean} newDay            Does this rest carry over to a new day?
   * @property {boolean} [advanceTime]     Should the game clock be advanced by the rest duration?
   * @property {boolean} [autoHD]          Should hit dice be spent automatically during a short rest?
   * @property {number} [autoHDThreshold]  How many hit points should be missing before hit dice are
   *                                       automatically spent during a short rest.
   */

  /**
   * Results from a rest operation.
   *
   * @typedef {object} RestResult
   * @property {string} type              Type of rest performed.
   * @property {object} deltas
   * @property {number} deltas.hitPoints  Hit points recovered during the rest.
   * @property {number} deltas.hitDice    Hit dice recovered or spent during the rest.
   * @property {object} updateData        Updates applied to the actor.
   * @property {object[]} updateItems     Updates applied to actor's items.
   * @property {boolean} newDay           Whether a new day occurred during the rest.
   * @property {Roll[]} rolls             Any rolls that occurred during the rest process, not including hit dice.
   */

  /* -------------------------------------------- */

  /**
   * Take a short rest, possibly spending hit dice and recovering resources, item uses, and relevant spell slots.
   * @param {RestConfiguration} [config]  Configuration options for a short rest.
   * @returns {Promise<RestResult>}       A Promise which resolves once the short rest workflow has completed.
   */
  async shortRest(config={}) {
    if ( this.type === "vehicle" ) return;

    config = foundry.utils.mergeObject({
      type: "short", dialog: true, chat: true, newDay: false, advanceTime: false, autoHD: false, autoHDThreshold: 3,
      duration: CONFIG.SENTIUS.restTypes.short.duration[game.settings.get("sentius", "restVariant")]
    }, config);

    /**
     * A hook event that fires before a short rest is started.
     * @function sentius.preShortRest
     * @memberof hookEvents
     * @param {Actor5e} actor             The actor that is being rested.
     * @param {RestConfiguration} config  Configuration options for the rest.
     * @returns {boolean}                 Explicitly return `false` to prevent the rest from being started.
     */
    if ( Hooks.call("sentius.preShortRest", this, config) === false ) return;

    // Take note of the initial hit points and number of hit dice the Actor has
    const hd0 = foundry.utils.getProperty(this, "system.attributes.hd.value");
    const hp0 = foundry.utils.getProperty(this, "system.attributes.hp.value");

    // Display a Dialog for rolling hit dice
    if ( config.dialog ) {
      try {
        foundry.utils.mergeObject(config, await ShortRestDialog.shortRestDialog({actor: this, canRoll: hd0 > 0}));
      } catch(err) { return; }
    }

    /**
     * A hook event that fires after a short rest has started, after the configuration is complete.
     * @function sentius.shortRest
     * @memberof hookEvents
     * @param {Actor5e} actor             The actor that is being rested.
     * @param {RestConfiguration} config  Configuration options for the rest.
     * @returns {boolean}                 Explicitly return `false` to prevent the rest from being continued.
     */
    if ( Hooks.call("sentius.shortRest", this, config) === false ) return;

    // Automatically spend hit dice
    if ( !config.dialog && config.autoHD ) await this.autoSpendHitDice({ threshold: config.autoHDThreshold });

    // Return the rest result
    const dhd = foundry.utils.getProperty(this, "system.attributes.hd.value") - hd0;
    const dhp = foundry.utils.getProperty(this, "system.attributes.hp.value") - hp0;
    return this._rest(config, { dhd, dhp });
  }

  /* -------------------------------------------- */

  /**
   * Take a long rest, recovering hit points, hit dice, resources, item uses, and spell slots.
   * @param {RestConfiguration} [config]  Configuration options for a long rest.
   * @returns {Promise<RestResult>}       A Promise which resolves once the long rest workflow has completed.
   */
  async longRest(config={}) {
    if ( this.type === "vehicle" ) return;

    config = foundry.utils.mergeObject({
      type: "long", dialog: true, chat: true, newDay: true, advanceTime: false,
      duration: CONFIG.SENTIUS.restTypes.long.duration[game.settings.get("sentius", "restVariant")]
    }, config);

    /**
     * A hook event that fires before a long rest is started.
     * @function sentius.preLongRest
     * @memberof hookEvents
     * @param {Actor5e} actor             The actor that is being rested.
     * @param {RestConfiguration} config  Configuration options for the rest.
     * @returns {boolean}                 Explicitly return `false` to prevent the rest from being started.
     */
    if ( Hooks.call("sentius.preLongRest", this, config) === false ) return;

    if ( config.dialog ) {
      try {
        foundry.utils.mergeObject(config, await LongRestDialog.longRestDialog({actor: this}));
      } catch(err) { return; }
    }

    /**
     * A hook event that fires after a long rest has started, after the configuration is complete.
     * @function sentius.longRest
     * @memberof hookEvents
     * @param {Actor5e} actor             The actor that is being rested.
     * @param {RestConfiguration} config  Configuration options for the rest.
     * @returns {boolean}                 Explicitly return `false` to prevent the rest from being continued.
     */
    if ( Hooks.call("sentius.longRest", this, config) === false ) return;

    return this._rest(config);
  }

  /* -------------------------------------------- */

  /**
   * Perform all of the changes needed for a short or long rest.
   *
   * @param {RestConfiguration} config         Configuration data for the rest occurring.
   * @param {Partial<RestResult>} [result={}]  Results of the rest operation being built.
   * @returns {Promise<RestResult>}  Consolidated results of the rest workflow.
   * @private
   */
  async _rest(config, result={}) {
    if ( (foundry.utils.getType(this.system.rest) === "function")
      && (await this.system.rest(config, result) === false) ) return;

    result = foundry.utils.mergeObject({
      type: config.type,
      deltas: {
        hitPoints: 0,
        hitDice: 0
      },
      updateData: {},
      updateItems: [],
      newDay: config.newDay === true,
      rolls: []
    }, result);
    if ( "dhp" in result ) result.deltas.hitPoints = result.dhp;
    if ( "dhd" in result ) result.deltas.hitDice = result.dhd;

    this._getRestHitDiceRecovery(config, result);
    this._getRestHitPointRecovery(config, result);
    this._getRestResourceRecovery(config, result);
    this._getRestSpellRecovery(config, result);
    await this._getRestItemUsesRecovery(config, result);

    result.dhp = result.deltas.hitPoints;
    result.dhd = result.deltas.hitDice;
    result.longRest = result.type === "long";

    /**
     * A hook event that fires after rest result is calculated, but before any updates are performed.
     * @function sentius.preRestCompleted
     * @memberof hookEvents
     * @param {Actor5e} actor             The actor that is being rested.
     * @param {RestResult} result         Details on the rest to be completed.
     * @param {RestConfiguration} config  Configuration data for the rest occurring.
     * @returns {boolean}                 Explicitly return `false` to prevent the rest updates from being performed.
     */
    if ( Hooks.call("sentius.preRestCompleted", this, result, config) === false ) return result;

    // Perform updates
    await this.update(result.updateData, { isRest: true });
    await this.updateEmbeddedDocuments("Item", result.updateItems, { isRest: true });

    // Advance the game clock
    if ( config.advanceTime && (config.duration > 0) && game.user.isGM ) await game.time.advance(60 * config.duration);

    // Display a Chat Message summarizing the rest effects
    if ( config.chat ) await this._displayRestResultMessage(result, result.longRest);

    /**
     * A hook event that fires when the rest process is completed for an actor.
     * @function sentius.restCompleted
     * @memberof hookEvents
     * @param {Actor5e} actor             The actor that just completed resting.
     * @param {RestResult} result         Details on the rest completed.
     * @param {RestConfiguration} config  Configuration data for that occurred.
     */
    Hooks.callAll("sentius.restCompleted", this, result, config);

    // Return data summarizing the rest effects
    return result;
  }

  /* -------------------------------------------- */

  /**
   * Display a chat message with the result of a rest.
   *
   * @param {RestResult} result         Result of the rest operation.
   * @param {boolean} [longRest=false]  Is this a long rest?
   * @returns {Promise<ChatMessage>}    Chat message that was created.
   * @protected
   */
  async _displayRestResultMessage(result, longRest=false) {
    const { dhd, dhp, newDay } = result;
    const diceRestored = dhd !== 0;
    const healthRestored = dhp !== 0;
    const length = longRest ? "Long" : "Short";

    // Summarize the rest duration
    let restFlavor;
    switch (game.settings.get("sentius", "restVariant")) {
      case "normal":
        restFlavor = (longRest && newDay) ? "SENTIUS.LongRestOvernight" : `SENTIUS.${length}RestNormal`;
        break;
      case "gritty":
        restFlavor = (!longRest && newDay) ? "SENTIUS.ShortRestOvernight" : `SENTIUS.${length}RestGritty`;
        break;
      case "epic":
        restFlavor = `SENTIUS.${length}RestEpic`;
        break;
    }

    // Determine the chat message to display
    let message;
    if ( diceRestored && healthRestored ) message = `SENTIUS.${length}RestResult`;
    else if ( longRest && !diceRestored && healthRestored ) message = "SENTIUS.LongRestResultHitPoints";
    else if ( longRest && diceRestored && !healthRestored ) message = "SENTIUS.LongRestResultHitDice";
    else message = `SENTIUS.${length}RestResultShort`;

    // Create a chat message
    let chatData = {
      user: game.user.id,
      speaker: {actor: this, alias: this.name},
      flavor: game.i18n.localize(restFlavor),
      rolls: result.rolls,
      content: game.i18n.format(message, {
        name: this.name,
        dice: longRest ? dhd : -dhd,
        health: dhp
      }),
      "flags.sentius.rest": { type: longRest ? "long" : "short" }
    };
    ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode"));
    return ChatMessage.create(chatData);
  }

  /* -------------------------------------------- */

  /**
   * Automatically spend hit dice to recover hit points up to a certain threshold.
   * @param {object} [options]
   * @param {number} [options.threshold=3]  A number of missing hit points which would trigger an automatic HD roll.
   * @returns {Promise<number>}             Number of hit dice spent.
   */
  async autoSpendHitDice({ threshold=3 }={}) {
    const hp = this.system.attributes.hp;
    const max = Math.max(0, hp.effectiveMax);
    let diceRolled = 0;
    while ( (this.system.attributes.hp.value + threshold) <= max ) {
      const r = await this.rollHitDie();
      if ( r === null ) break;
      diceRolled += 1;
    }
    return diceRolled;
  }

  /* -------------------------------------------- */

  /**
   * Recovers class hit dice during a long rest.
   *
   * @param {RestConfiguration} [config]
   * @param {number} [config.maxHitDice]  Maximum number of hit dice to recover.
   * @param {number} [config.fraction]    Fraction of max hit dice to recover. Used for NPC recovery and for PCs if
   *                                      `maxHitDice` isn't specified.
   * @param {RestResult} [result={}]      Rest result being constructed.
   * @protected
   */
  _getRestHitDiceRecovery({ maxHitDice, fraction, ...config }={}, result={}) {
    const restConfig = CONFIG.SENTIUS.restTypes[config.type];
    if ( !this.system.attributes.hd || !restConfig?.recoverHitDice ) return;
    fraction ??= game.settings.get("sentius", "rulesVersion") === "modern" ? 1 : 0.5;

    // Handle simpler HD recovery for NPCs
    if ( this.type === "npc" ) {
      const hd = this.system.attributes.hd;
      const recovered = Math.min(
        Math.max(1, Math.floor(hd.max * fraction)), hd.spent, maxHitDice ?? Infinity
      );
      foundry.utils.mergeObject(result, {
        deltas: {
          hitDice: (result.deltas?.hitDice ?? 0) + recovered
        },
        updateData: {
          "system.attributes.hd.spent": hd.spent - recovered
        }
      });
      return;
    }

    this.system.attributes.hd.createHitDiceUpdates({ maxHitDice, fraction, ...config }, result);
  }

  /* -------------------------------------------- */

  /**
   * Recovers actor hit points and eliminates any temp HP.
   * @param {RestConfiguration} [config={}]
   * @param {boolean} [config.recoverTemp=true]     Reset temp HP to zero.
   * @param {boolean} [config.recoverTempMax=true]  Reset temp max HP to zero.
   * @param {RestResult} [result={}]                Rest result being constructed.
   * @protected
   */
  _getRestHitPointRecovery({ recoverTemp, recoverTempMax, ...config }={}, result={}) {
    const restConfig = CONFIG.SENTIUS.restTypes[config.type ?? "long"];
    const hp = this.system.attributes?.hp;
    if ( !hp || !restConfig.recoverHitPoints ) return;

    let max = hp.max;
    result.updateData ??= {};
    if ( recoverTempMax ) result.updateData["system.attributes.hp.tempmax"] = 0;
    else max = Math.max(0, hp.effectiveMax);
    result.updateData["system.attributes.hp.value"] = max;
    if ( recoverTemp ) result.updateData["system.attributes.hp.temp"] = 0;
    foundry.utils.setProperty(
      result, "deltas.hitPoints", (result.deltas?.hitPoints ?? 0) + Math.max(0, max - hp.value)
    );
  }

  /* -------------------------------------------- */

  /**
   * Recovers actor resources.
   * @param {object} [config={}]
   * @param {boolean} [config.recoverShortRestResources]  Recover resources that recharge on a short rest.
   * @param {boolean} [config.recoverLongRestResources]   Recover resources that recharge on a long rest.
   * @param {RestResult} [result={}]                      Rest result being constructed.
   * @protected
   */
  _getRestResourceRecovery({recoverShortRestResources, recoverLongRestResources, ...config}={}, result={}) {
    recoverShortRestResources ??= config.type === "short";
    recoverLongRestResources ??= config.type === "long";
    for ( let [k, r] of Object.entries(this.system.resources ?? {}) ) {
      if ( Number.isNumeric(r.max) && ((recoverShortRestResources && r.sr) || (recoverLongRestResources && r.lr)) ) {
        result.updateData[`system.resources.${k}.value`] = Number(r.max);
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Recovers expended spell slots.
   * @param {RestConfiguration} [config={}]
   * @param {boolean} [config.recoverShort]    Recover slots that return on short rests.
   * @param {boolean} [config.recoverLong]     Recover slots that return on long rests.
   * @param {RestResult} [result={}]           Rest result being constructed.
   * @protected
   */
  _getRestSpellRecovery({ recoverShort, recoverLong, ...config }={}, result={}) {
    const restConfig = CONFIG.SENTIUS.restTypes[config.type];
    if ( !this.system.spells ) return;

    let types = restConfig.recoverSpellSlotTypes;
    if ( !types ) {
      types = new Set();
      for ( const [key, { shortRest }] of Object.entries(CONFIG.SENTIUS.spellcastingTypes) ) {
        if ( recoverLong || (recoverShort && shortRest) ) types.add(key);
      }
    }
    for ( const [key, slot] of Object.entries(this.system.spells) ) {
      if ( !types.has(slot.type) ) continue;
      result.updateData[`system.spells.${key}.value`] = slot.max;
    }
  }

  /* -------------------------------------------- */

  /**
   * Recovers item uses during short or long rests.
   * @param {object} [config]
   * @param {boolean} [config.recoverShortRestUses=true]  Recover uses for items that recharge after a short rest.
   * @param {boolean} [config.recoverLongRestUses=true]   Recover uses for items that recharge after a long rest.
   * @param {boolean} [config.recoverDailyUses=true]      Recover uses for items that recharge on a new day.
   * @param {RestResult} [result={}]                      Rest result being constructed.
   * @protected
   */
  async _getRestItemUsesRecovery({
    recoverShortRestUses, recoverLongRestUses, recoverDailyUses, ...config
  }={}, result={}) {
    const restConfig = CONFIG.SENTIUS.restTypes[config.type];
    const recovery = Array.from(restConfig.recoverPeriods ?? []);
    if ( recoverShortRestUses ) recovery.unshift("sr");
    if ( recoverLongRestUses ) recovery.unshift("lr");
    if ( recoverDailyUses || config.newDay ) recovery.unshift("day", "dawn", "dusk");

    result.updateItems ??= [];
    result.rolls ??= [];
    for ( const item of this.items ) {
      if ( foundry.utils.getType(item.system.recoverUses) !== "function" ) continue;
      const rollData = item.getRollData();
      const { updates, rolls } = await item.system.recoverUses(recovery, rollData);
      if ( !foundry.utils.isEmpty(updates) ) {
        const updateTarget = result.updateItems.find(i => i._id === item.id);
        if ( updateTarget ) foundry.utils.mergeObject(updateTarget, updates);
        else result.updateItems.push({ _id: item.id, ...updates });
      }
      result.rolls.push(...rolls);
    }
  }

  /* -------------------------------------------- */
  /*  Property Attribution                        */
  /* -------------------------------------------- */

  /**
   * Format an HTML breakdown for a given property.
   * @param {string} attribution      The property.
   * @param {object} [options]
   * @param {string} [options.title]  A title for the breakdown.
   * @returns {Promise<string>}
   */
  async getAttributionData(attribution, { title }={}) {
    switch ( attribution ) {
      case "attributes.ac": return this._prepareArmorClassAttribution({ title });
      case "attributes.movement": return this._prepareMovementAttribution();
      default: return "";
    }
  }

  /* -------------------------------------------- */

  /**
   * Prepare a movement breakdown.
   * @returns {string}
   * @protected
   */
  _prepareMovementAttribution() {
    const { movement } = this.system.attributes;
    const units = movement.units || defaultUnits("length");
    return Object.entries(CONFIG.SENTIUS.movementTypes).reduce((html, [k, label]) => {
      const value = movement[k];
      if ( value || (k === "walk") ) html += `
        <div class="row">
          <i class="fas ${k}"></i>
          <span class="value">${value ?? 0} <span class="units">${units}</span></span>
          <span class="label">${label}</span>
        </div>
      `;
      return html;
    }, "");
  }

  /* -------------------------------------------- */

  /**
   * Prepare an AC breakdown.
   * @param {object} [options]
   * @param {string} [options.title]  A title for the breakdown.
   * @returns {Promise<string>}
   * @protected
   */
  async _prepareArmorClassAttribution({ title }={}) {
    const rollData = this.getRollData({ deterministic: true });
    const ac = rollData.attributes.ac;
    const cfg = CONFIG.SENTIUS.armorClasses[ac.calc];
    const attribution = [];

    if ( ac.calc === "flat" ) {
      attribution.push({
        label: game.i18n.localize("SENTIUS.ArmorClassFlat"),
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: ac.flat
      });
      return new PropertyAttribution(this, attribution, "attributes.ac", { title }).renderTooltip();
    }

    // Base AC Attribution
    switch ( ac.calc ) {

      // Natural armor
      case "natural":
        attribution.push({
          label: game.i18n.localize("SENTIUS.ArmorClassNatural"),
          mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
          value: ac.flat
        });
        break;

      default:
        const formula = ac.calc === "custom" ? ac.formula : cfg.formula;
        let base = ac.base;
        const dataRgx = new RegExp(/@([a-z.0-9_-]+)/gi);
        for ( const [match, term] of formula.matchAll(dataRgx) ) {
          const value = String(foundry.utils.getProperty(rollData, term));
          if ( (term === "attributes.ac.armor") || (value === "0") ) continue;
          if ( Number.isNumeric(value) ) base -= Number(value);
          attribution.push({
            label: match,
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value
          });
        }
        const armorInFormula = formula.includes("@attributes.ac.armor");
        let label = game.i18n.localize("SENTIUS.PropertyBase");
        if ( armorInFormula ) label = this.armor?.name ?? game.i18n.localize("SENTIUS.ArmorClassUnarmored");
        attribution.unshift({
          label,
          mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
          value: base
        });
        break;
    }

    // Shield
    if ( ac.shield !== 0 ) attribution.push({
      label: this.shield?.name ?? game.i18n.localize("SENTIUS.EquipmentShield"),
      mode: CONST.ACTIVE_EFFECT_MODES.ADD,
      value: ac.shield
    });

    // Bonus
    if ( ac.bonus !== 0 ) attribution.push(...this._prepareActiveEffectAttributions("system.attributes.ac.bonus"));

    // Cover
    if ( ac.cover !== 0 ) attribution.push({
      label: game.i18n.localize("SENTIUS.Cover"),
      mode: CONST.ACTIVE_EFFECT_MODES.ADD,
      value: ac.cover
    });

    if ( attribution.length ) {
      return new PropertyAttribution(this, attribution, "attributes.ac", { title }).renderTooltip();
    }

    return "";
  }

  /* -------------------------------------------- */

  /**
   * Break down all of the Active Effects affecting a given target property.
   * @param {string} target               The data property being targeted.
   * @returns {AttributionDescription[]}  Any active effects that modify that property.
   * @protected
   */
  _prepareActiveEffectAttributions(target) {
    const rollData = this.getRollData({ deterministic: true });
    const attributions = [];
    for ( const e of this.allApplicableEffects() ) {
      let source = e.sourceName;
      if ( !e.origin || (e.origin === this.uuid) ) source = e.name;
      if ( !source || e.disabled || e.isSuppressed ) continue;
      const value = e.changes.reduce((n, change) => {
        if ( change.key !== target ) return n;
        if ( change.mode !== CONST.ACTIVE_EFFECT_MODES.ADD ) return n;
        return n + simplifyBonus(change.value, rollData);
      }, 0);
      if ( value ) attributions.push({ value, label: source, document: e, mode: CONST.ACTIVE_EFFECT_MODES.ADD });
    }
    return attributions;
  }

  /* -------------------------------------------- */
  /*  Conversion & Transformation                 */
  /* -------------------------------------------- */

  /**
   * Fetch stats from the original actor for data preparation.
   * @returns {{ originalSaves: object|null, originalSkills: object|null }}
   */
  getOriginalStats() {
    // Retrieve data for polymorphed actors
    let originalSaves = null;
    let originalSkills = null;
    if ( this.isPolymorphed ) {
      const transformOptions = this.flags.sentius?.transformOptions;
      const original = game.actors?.get(this.flags.sentius?.originalActor);
      if ( original ) {
        if ( transformOptions.mergeSaves ) originalSaves = original.system.abilities;
        if ( transformOptions.mergeSkills ) originalSkills = original.system.skills;
      }
    }
    return { originalSaves, originalSkills };
  }

  /* -------------------------------------------- */

  /**
   * Options that determine what properties of the original actor are kept and which are replaced with
   * the target actor.
   *
   * @typedef {object} TransformationOptions
   * @property {boolean} [keepPhysical=false]       Keep physical abilities (str, dex, con)
   * @property {boolean} [keepMental=false]         Keep mental abilities (int, wis, cha)
   * @property {boolean} [keepSaves=false]          Keep saving throw proficiencies
   * @property {boolean} [keepSkills=false]         Keep skill proficiencies
   * @property {boolean} [mergeSaves=false]         Take the maximum of the save proficiencies
   * @property {boolean} [mergeSkills=false]        Take the maximum of the skill proficiencies
   * @property {boolean} [keepClass=false]          Keep proficiency bonus
   * @property {boolean} [keepFeats=false]          Keep features
   * @property {boolean} [keepSpells=false]         Keep spells and spellcasting ability
   * @property {boolean} [keepItems=false]          Keep items
   * @property {boolean} [keepBio=false]            Keep biography
   * @property {boolean} [keepVision=false]         Keep vision
   * @property {boolean} [keepSelf=false]           Keep self
   * @property {boolean} [keepAE=false]             Keep all effects
   * @property {boolean} [keepOriginAE=true]        Keep effects which originate on this actor
   * @property {boolean} [keepOtherOriginAE=true]   Keep effects which originate on another actor
   * @property {boolean} [keepSpellAE=true]         Keep effects which originate from actors spells
   * @property {boolean} [keepFeatAE=true]          Keep effects which originate from actors features
   * @property {boolean} [keepEquipmentAE=true]     Keep effects which originate on actors equipment
   * @property {boolean} [keepClassAE=true]         Keep effects which originate from actors class/subclass
   * @property {boolean} [keepBackgroundAE=true]    Keep effects which originate from actors background
   * @property {boolean} [keepHP=false]             Keep HP & HD
   * @property {boolean} [keepType=false]           Keep creature type
   * @property {boolean} [addTemp=false]            Add temporary hit points equal to the target's max HP
   * @property {boolean} [transformTokens=true]     Transform linked tokens too
   * @property {string} [preset]                    The transformation preset used (if any).
   */

  /**
   * Transform this Actor into another one.
   *
   * @param {Actor5e} target                           The target Actor.
   * @param {TransformationOptions} [options={}]       Options that determine how the transformation is performed.
   * @param {object} [sheetOptions]
   * @param {boolean} [sheetOptions.renderSheet=true]  Render the sheet of the transformed actor after the polymorph
   * @returns {Promise<Array<Token>>|null}             Updated token if the transformation was performed.
   */
  async transformInto(target, { keepPhysical=false, keepMental=false, keepSaves=false, keepSkills=false,
    mergeSaves=false, mergeSkills=false, keepClass=false, keepFeats=false, keepSpells=false, keepItems=false,
    keepBio=false, keepVision=false, keepSelf=false, keepAE=false, keepOriginAE=true, keepOtherOriginAE=true,
    keepSpellAE=true, keepEquipmentAE=true, keepFeatAE=true, keepClassAE=true, keepBackgroundAE=true,
    keepHP=false, keepType=false, addTemp=false, transformTokens=true, preset}={}, {renderSheet=true}={}) {

    // Ensure the player is allowed to polymorph
    const allowed = game.settings.get("sentius", "allowPolymorphing");
    if ( !allowed && !game.user.isGM ) {
      ui.notifications.warn("SENTIUS.PolymorphWarn", {localize: true});
      return null;
    }

    // Get the original Actor data and the new source data
    const o = this.toObject();
    o.flags.sentius = o.flags.sentius || {};
    o.flags.sentius.transformOptions = {mergeSkills, mergeSaves};
    const source = target.toObject();

    if ( keepSelf ) {
      o.img = source.img;
      o.name = `${o.name} (${game.i18n.localize("SENTIUS.PolymorphSelf")})`;
    }

    // Prepare new data to merge from the source
    const d = foundry.utils.mergeObject(foundry.utils.deepClone({
      type: o.type, // Remain the same actor type
      name: `${o.name} (${source.name})`, // Append the new shape to your old name
      system: source.system, // Get the systemdata model of your new form
      items: source.items, // Get the items of your new form
      effects: o.effects.concat(source.effects), // Combine active effects from both forms
      img: source.img, // New appearance
      ownership: o.ownership, // Use the original actor permissions
      folder: o.folder, // Be displayed in the same sidebar folder
      flags: o.flags, // Use the original actor flags
      prototypeToken: { name: `${o.name} (${source.name})`, texture: {}, sight: {}, detectionModes: [] } // Set a new empty token
    }), keepSelf ? o : {}); // Keeps most of original actor

    // Specifically delete some data attributes
    delete d.system.resources; // Don't change your resource pools
    delete d.system.currency; // Don't lose currency
    delete d.system.bonuses; // Don't lose global bonuses
    if ( keepSpells ) delete d.system.attributes.spellcasting; // Keep spellcasting ability if retaining spells.

    // Specific additional adjustments
    d.system.details.alignment = o.system.details.alignment; // Don't change alignment
    d.system.attributes.exhaustion = o.system.attributes.exhaustion; // Keep your prior exhaustion level
    d.system.attributes.inspiration = o.system.attributes.inspiration; // Keep inspiration
    d.system.spells = o.system.spells; // Keep spell slots
    d.system.attributes.ac.flat = target.system.attributes.ac.value; // Override AC

    // Token appearance updates
    for ( const k of ["width", "height", "alpha", "lockRotation"] ) {
      d.prototypeToken[k] = source.prototypeToken[k];
    }
    for ( const k of ["offsetX", "offsetY", "scaleX", "scaleY", "src", "tint"] ) {
      d.prototypeToken.texture[k] = source.prototypeToken.texture[k];
    }
    d.prototypeToken.ring = source.prototypeToken.ring;
    for ( const k of ["bar1", "bar2", "displayBars", "displayName", "disposition", "rotation", "elevation"] ) {
      d.prototypeToken[k] = o.prototypeToken[k];
    }

    if ( !keepSelf ) {
      const sightSource = keepVision ? o.prototypeToken : source.prototypeToken;
      for ( const k of ["range", "angle", "visionMode", "color", "attenuation", "brightness", "saturation", "contrast"] ) {
        d.prototypeToken.sight[k] = sightSource.sight[k];
      }
      d.prototypeToken.sight.enabled = o.prototypeToken.sight.enabled;
      d.prototypeToken.detectionModes = sightSource.detectionModes;

      // Transfer ability scores
      const abilities = d.system.abilities;
      for ( let k of Object.keys(abilities) ) {
        const oa = o.system.abilities[k];
        const prof = abilities[k].proficient;
        const type = CONFIG.SENTIUS.abilities[k]?.type;
        if ( keepPhysical && (type === "physical") ) abilities[k] = oa;
        else if ( keepMental && (type === "mental") ) abilities[k] = oa;

        // Set saving throw proficiencies.
        if ( keepSaves && oa ) abilities[k].proficient = oa.proficient;
        else if ( mergeSaves && oa ) abilities[k].proficient = Math.max(prof, oa.proficient);
        else abilities[k].proficient = source.system.abilities[k].proficient;
      }

      // Transfer skills
      if ( keepSkills ) d.system.skills = o.system.skills;
      else if ( mergeSkills ) {
        for ( let [k, s] of Object.entries(d.system.skills) ) {
          s.value = Math.max(s.value, o.system.skills[k]?.value ?? 0);
        }
      }

      // Keep specific items from the original data
      d.items = d.items.concat(o.items.filter(i => {
        if ( ["class", "subclass"].includes(i.type) ) return keepClass || keepHP;
        else if ( i.type === "feat" ) return keepFeats;
        else if ( i.type === "spell" ) return keepSpells;
        else if ( i.type === "race" ) return keepType;
        else return keepItems;
      }));

      // Transfer classes for NPCs
      if ( !keepClass && ("cr" in d.system.details) ) {
        if ( keepHP ) {
          let profOverride = d.effects.findSplice(e => e._id === staticID("sentiusTransformProf"));
          if ( !profOverride ) profOverride = new ActiveEffect.implementation({
            _id: staticID("sentiusTransformProf"),
            name: game.i18n.localize("SENTIUS.Proficiency"),
            img: "icons/skills/social/diplomacy-peace-alliance.webp",
            disabled: false
          }).toObject();
          profOverride.changes = [{
            key: "system.attributes.prof",
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value: target.system.attributes.prof
          }];
          d.effects.push(profOverride);
        } else {
          const cls = new sentius.dataModels.item.ClassData({ levels: d.system.details.cr });
          d.items.push({
            type: "class",
            name: game.i18n.localize("SENTIUS.PolymorphTmpClass"),
            system: cls.toObject()
          });
        }
      }

      // Keep biography
      if ( keepBio ) d.system.details.biography = o.system.details.biography;

      // Keep senses
      if ( keepVision ) d.system.traits.senses = o.system.traits.senses;

      // Keep creature type
      if ( keepType ) d.system.details.type = o.system.details.type;

      // Keep HP & HD
      if ( keepHP ) d.system.attributes.hp = { ...this.system.attributes.hp };

      // Add temporary hit points
      if ( addTemp ) d.system.attributes.hp.temp = target.system.attributes.hp.max;

      // Remove active effects
      const oEffects = foundry.utils.deepClone(d.effects);
      const originEffectIds = new Set(oEffects.filter(effect => {
        return !effect.origin || effect.origin === this.uuid;
      }).map(e => e._id));
      d.effects = d.effects.filter(e => {
        if ( keepAE ) return true;
        if ( keepHP && !keepClass && (e._id === staticID("sentiusTransformProf")) ) return true;
        const origin = e.origin?.startsWith("Actor") || e.origin?.startsWith("Item") ? fromUuidSync(e.origin) : {};
        const originIsSelf = origin?.parent?.uuid === this.uuid;
        const isOriginEffect = originEffectIds.has(e._id);
        if ( isOriginEffect ) return keepOriginAE;
        if ( !isOriginEffect && !originIsSelf ) return keepOtherOriginAE;
        if ( origin.type === "spell" ) return keepSpellAE;
        if ( origin.type === "feat" ) return keepFeatAE;
        if ( origin.type === "background" ) return keepBackgroundAE;
        if ( ["subclass", "class"].includes(origin.type) ) return keepClassAE;
        if ( ["equipment", "weapon", "tool", "loot", "container"].includes(origin.type) ) return keepEquipmentAE;
        return true;
      });
    }

    // Set a random image if source is configured that way
    if ( source.prototypeToken.randomImg ) {
      const images = await target.getTokenImages();
      d.prototypeToken.texture.src = images[Math.floor(Math.random() * images.length)];
    }

    // Set new data flags
    if ( !this.isPolymorphed || !d.flags.sentius.originalActor ) d.flags.sentius.originalActor = this.id;
    d.flags.sentius.isPolymorphed = true;

    // Gather previous actor data
    const previousActorIds = this.getFlag("sentius", "previousActorIds") || [];
    previousActorIds.push(this._id);
    foundry.utils.setProperty(d.flags, "sentius.previousActorIds", previousActorIds);

    // Update unlinked Tokens, and grab a copy of any actorData adjustments to re-apply
    if ( this.isToken ) {
      const tokenData = d.prototypeToken;
      delete d.prototypeToken;
      tokenData.delta = d;
      const previousActorData = this.token.delta.toObject();
      foundry.utils.setProperty(tokenData, "flags.sentius.previousActorData", previousActorData);
      await this.sheet?.close();
      const update = await this.token.update(tokenData);
      if ( renderSheet ) this.sheet?.render(true);
      return update;
    }

    // Close sheet for non-transformed Actor
    await this.sheet?.close();

    /**
     * A hook event that fires just before the actor is transformed.
     * @function sentius.transformActor
     * @memberof hookEvents
     * @param {Actor5e} actor                  The original actor before transformation.
     * @param {Actor5e} target                 The target actor into which to transform.
     * @param {object} data                    The data that will be used to create the new transformed actor.
     * @param {TransformationOptions} options  Options that determine how the transformation is performed.
     * @param {object} [options]
     */
    Hooks.callAll("sentius.transformActor", this, target, d, {
      keepPhysical, keepMental, keepSaves, keepSkills, mergeSaves, mergeSkills, keepClass, keepFeats, keepSpells,
      keepItems, keepBio, keepVision, keepSelf, keepAE, keepOriginAE, keepOtherOriginAE, keepSpellAE,
      keepEquipmentAE, keepFeatAE, keepClassAE, keepBackgroundAE, keepHP, keepType, addTemp, transformTokens, preset
    }, {renderSheet});

    // Create new Actor with transformed data
    const newActor = await this.constructor.create(d, {renderSheet});

    // Update placed Token instances
    if ( !transformTokens ) return;
    const tokens = this.getActiveTokens(true);
    const updates = tokens.map(t => {
      const newTokenData = foundry.utils.deepClone(d.prototypeToken);
      newTokenData._id = t.id;
      newTokenData.actorId = newActor.id;
      newTokenData.actorLink = true;

      const dOriginalActor = foundry.utils.getProperty(d, "flags.sentius.originalActor");
      foundry.utils.setProperty(newTokenData, "flags.sentius.originalActor", dOriginalActor);
      foundry.utils.setProperty(newTokenData, "flags.sentius.isPolymorphed", true);
      return newTokenData;
    });
    return canvas.scene?.updateEmbeddedDocuments("Token", updates);
  }

  /* -------------------------------------------- */

  /**
   * If this actor was transformed with transformTokens enabled, then its
   * active tokens need to be returned to their original state. If not, then
   * we can safely just delete this actor.
   * @param {object} [options]
   * @param {boolean} [options.renderSheet=true]  Render Sheet after revert the transformation.
   * @returns {Promise<Actor>|null}  Original actor if it was reverted.
   */
  async revertOriginalForm({renderSheet=true}={}) {
    if ( !this.isPolymorphed ) return;
    if ( !this.isOwner ) {
      ui.notifications.warn("SENTIUS.PolymorphRevertWarn", {localize: true});
      return null;
    }

    /**
     * A hook event that fires just before the actor is reverted to original form.
     * @function sentius.revertOriginalForm
     * @memberof hookEvents
     * @param {Actor} this                 The original actor before transformation.
     * @param {object} [options]
     */
    Hooks.callAll("sentius.revertOriginalForm", this, {renderSheet});
    const previousActorIds = this.getFlag("sentius", "previousActorIds") ?? [];
    const isOriginalActor = !previousActorIds.length;
    const isRendered = this.sheet.rendered;

    // Obtain a reference to the original actor
    const original = game.actors.get(this.getFlag("sentius", "originalActor"));

    // If we are reverting an unlinked token, grab the previous actorData, and create a new token
    if ( this.isToken ) {
      const baseActor = original ? original : game.actors.get(this.token.actorId);
      if ( !baseActor ) {
        ui.notifications.warn(game.i18n.format("SENTIUS.PolymorphRevertNoOriginalActorWarn", {
          reference: this.getFlag("sentius", "originalActor")
        }));
        return;
      }
      const prototypeTokenData = (await baseActor.getTokenDocument()).toObject();
      const actorData = this.token.getFlag("sentius", "previousActorData");
      const tokenUpdate = this.token.toObject();
      actorData._id = tokenUpdate.delta._id;
      tokenUpdate.delta = actorData;

      for ( const k of ["width", "height", "alpha", "lockRotation", "name"] ) {
        tokenUpdate[k] = prototypeTokenData[k];
      }
      for ( const k of ["offsetX", "offsetY", "scaleX", "scaleY", "src", "tint"] ) {
        tokenUpdate.texture[k] = prototypeTokenData.texture[k];
      }
      tokenUpdate.ring = prototypeTokenData.ring;
      tokenUpdate.sight = prototypeTokenData.sight;
      tokenUpdate.detectionModes = prototypeTokenData.detectionModes;

      await this.sheet.close();
      await canvas.scene?.deleteEmbeddedDocuments("Token", [this.token._id]);
      const token = await TokenDocument.implementation.create(tokenUpdate, {
        parent: canvas.scene, keepId: true, render: true
      });
      if ( isOriginalActor ) {
        await this.unsetFlag("sentius", "isPolymorphed");
        await this.unsetFlag("sentius", "previousActorIds");
        await this.token.unsetFlag("sentius", "previousActorData");
      }
      if ( isRendered && renderSheet ) token.actor?.sheet?.render(true);
      return token;
    }

    if ( !original ) {
      ui.notifications.warn(game.i18n.format("SENTIUS.PolymorphRevertNoOriginalActorWarn", {
        reference: this.getFlag("sentius", "originalActor")
      }));
      return;
    }

    // Get the Tokens which represent this actor
    if ( canvas.ready ) {
      const tokens = this.getActiveTokens(true);
      const tokenData = (await original.getTokenDocument()).toObject();
      const tokenUpdates = tokens.map(t => {
        const update = foundry.utils.deepClone(tokenData);
        update._id = t.id;
        delete update.x;
        delete update.y;
        return update;
      });
      await canvas.scene.updateEmbeddedDocuments("Token", tokenUpdates, { diff: false, recursive: false });
    }
    if ( isOriginalActor ) {
      await this.unsetFlag("sentius", "isPolymorphed");
      await this.unsetFlag("sentius", "previousActorIds");
    }

    // Delete the polymorphed version(s) of the actor, if possible
    if ( game.user.isGM ) {
      const idsToDelete = previousActorIds.filter(id =>
        id !== original.id // Is not original Actor Id
        && game.actors?.get(id) // Actor still exists
      ).concat([this.id]); // Add this id

      await Actor.implementation.deleteDocuments(idsToDelete);
    } else if ( isRendered ) {
      this.sheet?.close();
    }
    if ( isRendered && renderSheet ) original.sheet?.render(isRendered);
    return original;
  }

  /* -------------------------------------------- */

  /**
   * Add additional system-specific sidebar directory context menu options for Actor documents
   * @param {jQuery} html         The sidebar HTML
   * @param {Array} entryOptions  The default array of context menu options
   */
  static addDirectoryContextOptions(html, entryOptions) {
    entryOptions.push({
      name: "SENTIUS.PolymorphRestoreTransformation",
      icon: '<i class="fa-solid fa-backward"></i>',
      callback: li => {
        const actor = game.actors.get(li.data("documentId"));
        return actor.revertOriginalForm();
      },
      condition: li => {
        const allowed = game.settings.get("sentius", "allowPolymorphing");
        if ( !allowed && !game.user.isGM ) return false;
        const actor = game.actors.get(li.data("documentId"));
        return actor && actor.isPolymorphed;
      },
      group: "system"
    }, {
      name: "SENTIUS.Group.Primary.Set",
      icon: '<i class="fa-solid fa-star"></i>',
      callback: li => {
        game.settings.set("sentius", "primaryParty", { actor: game.actors.get(li[0].dataset.documentId) });
      },
      condition: li => {
        const actor = game.actors.get(li[0].dataset.documentId);
        const primary = game.settings.get("sentius", "primaryParty")?.actor;
        return game.user.isGM && (actor.type === "group")
          && (actor.system.type.value === "party") && (actor !== primary);
      },
      group: "system"
    }, {
      name: "SENTIUS.Group.Primary.Remove",
      icon: '<i class="fa-regular fa-star"></i>',
      callback: li => {
        game.settings.set("sentius", "primaryParty", { actor: null });
      },
      condition: li => {
        const actor = game.actors.get(li[0].dataset.documentId);
        const primary = game.settings.get("sentius", "primaryParty")?.actor;
        return game.user.isGM && (actor === primary);
      },
      group: "system"
    });
  }

  /* -------------------------------------------- */

  /**
   * Add class to actor entry representing the primary group.
   * @param {jQuery} jQuery
   */
  static onRenderActorDirectory(jQuery) {
    const primaryParty = game.settings.get("sentius", "primaryParty")?.actor;
    if ( primaryParty ) {
      const element = jQuery[0]?.querySelector(`[data-entry-id="${primaryParty.id}"]`);
      element?.classList.add("primary-party");
    }
  }

  /* -------------------------------------------- */

  /**
   * Format a type object into a string.
   * @param {object} typeData          The type data to convert to a string.
   * @returns {string}
   */
  static formatCreatureType(typeData) {
    if ( typeof typeData === "string" ) return typeData; // Backwards compatibility
    let localizedType;
    if ( typeData.value === "custom" ) {
      localizedType = typeData.custom;
    } else if ( typeData.value in CONFIG.SENTIUS.creatureTypes ) {
      const code = CONFIG.SENTIUS.creatureTypes[typeData.value];
      localizedType = game.i18n.localize(typeData.swarm ? code.plural : code.label);
    }
    let type = localizedType;
    if ( typeData.swarm ) {
      type = game.i18n.format("SENTIUS.CreatureSwarmPhrase", {
        size: game.i18n.localize(CONFIG.SENTIUS.actorSizes[typeData.swarm].label),
        type: localizedType
      });
    }
    if (typeData.subtype) type = `${type} (${typeData.subtype})`;
    return type;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onUpdate(data, options, userId) {
    super._onUpdate(data, options, userId);

    const isHpUpdate = !!data.system?.attributes?.hp;

    if ( userId === game.userId ) {
      if ( isHpUpdate ) await this.updateBloodied(options);
      await this.updateEncumbrance(options);
      this._onUpdateExhaustion(data, options);
    }

    const hp = options.sentius?.hp;
    if ( isHpUpdate && hp && !options.isRest && !options.isAdvancement ) {
      const curr = this.system.attributes.hp;
      const changes = {
        hp: curr.value - hp.value,
        temp: curr.temp - hp.temp
      };
      changes.total = changes.hp + changes.temp;

      if ( Number.isInteger(changes.total) && (changes.total !== 0) ) {
        this._displayTokenEffect(changes);
        if ( !game.settings.get("sentius", "disableConcentration") && (userId === game.userId) && (changes.total < 0)
          && (options.sentius?.concentrationCheck !== false) && (curr.value < curr.effectiveMax) ) {
          this.challengeConcentration({ dc: this.getConcentrationDC(-changes.total) });
        }

        /**
         * A hook event that fires when an actor is damaged or healed by any means. The actual name
         * of the hook will depend on the change in hit points.
         * @function sentius.damageActor
         * @memberof hookEvents
         * @param {Actor5e} actor                                       The actor that had their hit points reduced.
         * @param {{hp: number, temp: number, total: number}} changes   The changes to hit points.
         * @param {object} update                                       The original update delta.
         * @param {string} userId                                       Id of the user that performed the update.
         */
        Hooks.callAll(`sentius.${changes.total > 0 ? "heal" : "damage"}Actor`, this, changes, data, userId);
      }
    }
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _onDelete(options, userId) {
    super._onDelete(options, userId);

    const origin = this.getFlag("sentius", "summon.origin");
    // TODO: Replace with parseUuid once V11 support is dropped
    if ( origin ) sentius.registry.summons.untrack(origin.split(".Item.")[0], this.uuid);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onCreateDescendantDocuments(parent, collection, documents, data, options, userId) {
    if ( (userId === game.userId) && (collection === "items") ) await this.updateEncumbrance(options);
    super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onUpdateDescendantDocuments(parent, collection, documents, changes, options, userId) {
    if ( (userId === game.userId) && (collection === "items") ) await this.updateEncumbrance(options);
    super._onUpdateDescendantDocuments(parent, collection, documents, changes, options, userId);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId) {
    if ( (userId === game.userId) ) {
      if ( collection === "items" ) await this.updateEncumbrance(options);
      await this._clearFavorites(documents);
    }
    super._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);
  }

  /* -------------------------------------------- */

  /**
   * Flash ring & display changes to health as scrolling combat text.
   * @param {object} changes          Object of changes to hit points.
   * @param {number} changes.hp       Changes to `hp.value`.
   * @param {number} changes.temp     The change to `hp.temp`.
   * @param {number} changes.total    The total change to hit points.
   * @protected
   */
  _displayTokenEffect(changes) {
    let key;
    let value;
    if ( changes.hp < 0 ) {
      key = "damage";
      value = changes.total;
    } else if ( changes.hp > 0 ) {
      key = "healing";
      value = changes.total;
    } else if ( changes.temp ) {
      key = "temp";
      value = changes.temp;
    }
    if ( !key || !value ) return;

    const tokens = this.isToken ? [this.token] : this.getActiveTokens(true, true);
    if ( !tokens.length ) return;

    const pct = Math.clamp(Math.abs(value) / this.system.attributes.hp.max, 0, 1);
    const fill = CONFIG.SENTIUS.tokenHPColors[key];

    for ( const token of tokens ) {
      if ( !token.object?.visible || token.isSecret ) continue;
      if ( token.hasDynamicRing ) token.flashRing(key);
      const t = token.object;
      canvas.interface.createScrollingText(t.center, value.signedString(), {
        anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
        // Adapt the font size relative to the Actor's HP total to emphasize more significant blows
        fontSize: 16 + (32 * pct), // Range between [16, 48]
        fill: fill,
        stroke: 0x000000,
        strokeThickness: 4,
        jitter: 0.25
      });
    }
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async toggleStatusEffect(statusId, options) {
    const created = await super.toggleStatusEffect(statusId, options);
    const status = CONFIG.statusEffects.find(e => e.id === statusId);
    if ( !(created instanceof ActiveEffect) || !status.exclusiveGroup ) return created;

    const others = CONFIG.statusEffects
      .filter(e => (e.id !== statusId) && (e.exclusiveGroup === status.exclusiveGroup) && this.effects.has(e._id));
    if ( others.length ) await this.deleteEmbeddedDocuments("ActiveEffect", others.map(e => e._id));

    return created;
  }

  /* -------------------------------------------- */

  /**
   * TODO: Perform this as part of Actor._preUpdateOperation instead when it becomes available in v12.
   * Handle syncing the Actor's exhaustion level with the ActiveEffect.
   * @param {object} data                          The Actor's update delta.
   * @param {DocumentModificationContext} options  Additional options supplied with the update.
   * @returns {Promise<ActiveEffect|void>}
   * @protected
   */
  async _onUpdateExhaustion(data, options) {
    const level = foundry.utils.getProperty(data, "system.attributes.exhaustion");
    if ( !Number.isFinite(level) ) return;
    let effect = this.effects.get(ActiveEffect5e.ID.EXHAUSTION);
    if ( level < 1 ) return effect?.delete();
    else if ( effect ) {
      const originalExhaustion = foundry.utils.getProperty(options, "sentius.originalExhaustion");
      return effect.update({ "flags.sentius.exhaustionLevel": level }, { sentius: { originalExhaustion } });
    } else {
      effect = await ActiveEffect.implementation.fromStatusEffect("exhaustion", { parent: this });
      effect.updateSource({ "flags.sentius.exhaustionLevel": level });
      return ActiveEffect.implementation.create(effect, { parent: this, keepId: true });
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle applying/removing the bloodied status.
   * @param {DocumentModificationContext} options  Additional options supplied with the update.
   * @returns {Promise<ActiveEffect>|void}
   */
  updateBloodied(options) {
    const hp = this.system.attributes?.hp;
    if ( !hp?.effectiveMax || (game.settings.get("sentius", "bloodied") === "none") ) return;

    const effect = this.effects.get(ActiveEffect5e.ID.BLOODIED);
    if ( hp.value > hp.effectiveMax * CONFIG.SENTIUS.bloodied.threshold ) return effect?.delete();
    if ( effect ) return;

    return ActiveEffect.implementation.create({
      _id: ActiveEffect5e.ID.BLOODIED,
      name: game.i18n.localize(CONFIG.SENTIUS.bloodied.name),
      img: CONFIG.SENTIUS.bloodied.icon,
      statuses: ["bloodied"]
    }, { parent: this, keepId: true });
  }

  /* -------------------------------------------- */

  /**
   * Handle applying/removing encumbrance statuses.
   * @param {DocumentModificationContext} options  Additional options supplied with the update.
   * @returns {Promise<ActiveEffect>|void}
   */
  updateEncumbrance(options) {
    const encumbrance = this.system.attributes?.encumbrance;
    if ( !encumbrance || (game.settings.get("sentius", "encumbrance") === "none") ) return;
    const statuses = [];
    const variant = game.settings.get("sentius", "encumbrance") === "variant";
    if ( encumbrance.value > encumbrance.thresholds.maximum ) statuses.push("exceedingCarryingCapacity");
    if ( (encumbrance.value > encumbrance.thresholds.heavilyEncumbered) && variant ) statuses.push("heavilyEncumbered");
    if ( (encumbrance.value > encumbrance.thresholds.encumbered) && variant ) statuses.push("encumbered");

    const effect = this.effects.get(ActiveEffect5e.ID.ENCUMBERED);
    if ( !statuses.length ) return effect?.delete();

    const effectData = { ...CONFIG.SENTIUS.encumbrance.effects[statuses[0]], statuses };
    if ( effect ) {
      const originalEncumbrance = effect.statuses.first();
      return effect.update(effectData, { sentius: { originalEncumbrance } });
    }

    return ActiveEffect.implementation.create(
      { _id: ActiveEffect5e.ID.ENCUMBERED, ...effectData },
      { parent: this, keepId: true }
    );
  }

  /* -------------------------------------------- */

  /**
   * Handle clearing favorited entries that were deleted.
   * @param {Document[]} documents  The deleted Documents.
   * @returns {Promise<Actor5e>|void}
   * @protected
   */
  _clearFavorites(documents) {
    if ( !("favorites" in this.system) ) return;
    const ids = new Set(documents.map(d => d.getRelativeUUID(this)));
    const favorites = this.system.favorites.filter(f => !ids.has(f.id));
    return this.update({ "system.favorites": favorites });
  }
}

/* -------------------------------------------- */

/**
 * @extends {Map<string, Set<Item5e>>}
 */
class SourcedItemsMap extends Map {
  /** @inheritDoc */
  get(key, { legacy=true }={}) {
    if ( legacy ) {
      foundry.utils.logCompatibilityWarning(
        "The `sourcedItems` data on actor has changed from storing individual items to storing Sets of items. Pass `legacy: false` to retrieve the new Set data.",
        { since: "SENTIUS", until: "SENTIUS", once: true }
      );
      return super.get(key)?.first();
    }
    return super.get(key);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  set(key, value) {
    if ( !this.has(key) ) super.set(key, new Set());
    this.get(key, { legacy: false }).add(value);
    return this;
  }
}