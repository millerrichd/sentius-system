import { filteredKeys } from "../../utils.mjs";
import { ItemDataModel } from "../abstract.mjs";
import ActivationField from "../shared/activation-field.mjs";
import DurationField from "../shared/duration-field.mjs";
import RangeField from "../shared/range-field.mjs";
import TargetField from "../shared/target-field.mjs";
import ActivitiesTemplate from "./templates/activities.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";

const { BooleanField, NumberField, SchemaField, SetField, StringField } = foundry.data.fields;

/**
 * Data definition for Spell items.
 * @mixes ActivitiesTemplate
 * @mixes ItemDescriptionTemplate
 *
 * @property {string} ability                    Override of default spellcasting ability.
 * @property {ActivationData} activation         Casting time & conditions.
 * @property {DurationData} duration             Duration of the spell effect.
 * @property {number} level                      Base level of the spell.
 * @property {object} materials                  Details on material components required for this spell.
 * @property {string} materials.value            Description of the material components required for casting.
 * @property {boolean} materials.consumed        Are these material components consumed during casting?
 * @property {number} materials.cost             GP cost for the required components.
 * @property {number} materials.supply           Quantity of this component available.
 * @property {object} preparation                Details on how this spell is prepared.
 * @property {string} preparation.mode           Spell preparation mode as defined in `SENTIUS.spellPreparationModes`.
 * @property {boolean} preparation.prepared      Is the spell currently prepared?
 * @property {Set<string>} properties            General components and tags for this spell.
 * @property {RangeData} range                   Range of the spell
 * @property {string} school                     Magical school to which this spell belongs.
 * @property {string} sourceClass                Associated spellcasting class when this spell is on an actor.
 * @property {TargetData} target                 Information on area and individual targets.
 */
export default class SpellData extends ItemDataModel.mixin(ActivitiesTemplate, ItemDescriptionTemplate) {

  /* -------------------------------------------- */
  /*  Model Configuration                         */
  /* -------------------------------------------- */

  /** @override */
  static LOCALIZATION_PREFIXES = [
    "SENTIUS.ACTIVATION", "SENTIUS.DURATION", "SENTIUS.RANGE", "SENTIUS.SOURCE", "SENTIUS.TARGET"
  ];

  /* -------------------------------------------- */

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema(super.defineSchema(), {
      ability: new StringField({ label: "SENTIUS.SpellAbility" }),
      activation: new ActivationField(),
      duration: new DurationField(),
      level: new NumberField({ required: true, integer: true, initial: 1, min: 0, label: "SENTIUS.SpellLevel" }),
      materials: new SchemaField({
        value: new StringField({ required: true, label: "SENTIUS.SpellMaterialsDescription" }),
        consumed: new BooleanField({ required: true, label: "SENTIUS.SpellMaterialsConsumed" }),
        cost: new NumberField({ required: true, initial: 0, min: 0, label: "SENTIUS.SpellMaterialsCost" }),
        supply: new NumberField({ required: true, initial: 0, min: 0, label: "SENTIUS.SpellMaterialsSupply" })
      }, { label: "SENTIUS.SpellMaterials" }),
      preparation: new SchemaField({
        mode: new StringField({ required: true, initial: "prepared", label: "SENTIUS.SpellPreparation.Mode" }),
        prepared: new BooleanField({ required: true, label: "SENTIUS.SpellPrepared" })
      }, { label: "SENTIUS.SpellPreparation.Label" }),
      properties: new SetField(new StringField(), { label: "SENTIUS.SpellComponents" }),
      range: new RangeField(),
      school: new StringField({ required: true, label: "SENTIUS.SpellSchool" }),
      sourceClass: new StringField({ label: "SENTIUS.SpellSourceClass" }),
      target: new TargetField()
    });
  }

  /* -------------------------------------------- */

  /** @override */
  static get compendiumBrowserFilters() {
    return new Map([
      ["level", {
        label: "SENTIUS.Level",
        type: "range",
        config: {
          keyPath: "system.level",
          min: 0,
          max: Object.keys(CONFIG.SENTIUS.spellLevels).length - 1
        }
      }],
      ["school", {
        label: "SENTIUS.School",
        type: "set",
        config: {
          choices: CONFIG.SENTIUS.spellSchools,
          keyPath: "system.school"
        }
      }],
      ["spelllist", {
        label: "TYPES.JournalEntryPage.spells",
        type: "set",
        createFilter: (filters, value, def) => {
          let include = new Set();
          let exclude = new Set();
          for ( const [type, identifiers] of Object.entries(value ?? {}) ) {
            for ( const [identifier, v] of Object.entries(identifiers) ) {
              const list = sentius.registry.spellLists.forType(type, identifier);
              if ( !list || (v === 0) ) continue;
              if ( v === 1 ) include = include.union(list.uuids);
              else if ( v === -1 ) exclude = exclude.union(list.uuids);
            }
          }
          if ( include.size ) filters.push({ k: "uuid", o: "in", v: include });
          if ( exclude.size ) filters.push({ o: "NOT", v: { k: "uuid", o: "in", v: exclude } });
        },
        config: {
          choices: sentius.registry.spellLists.options.reduce((obj, entry) => {
            obj[`${entry.type}.${entry.value}`] = entry.label;
            return obj;
          }, {})
        }
      }],
      ["properties", this.compendiumBrowserPropertiesFilter("spell")]
    ]);
  }

  /* -------------------------------------------- */
  /*  Data Migrations                             */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static _migrateData(source) {
    super._migrateData(source);
    ActivitiesTemplate.migrateActivities(source);
    SpellData.#migrateActivation(source);
    SpellData.#migrateTarget(source);
  }

  /* -------------------------------------------- */

  /**
   * Migrate the component object to be 'properties' instead.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static _migrateComponentData(source) {
    const components = filteredKeys(source.system?.components ?? {});
    if ( components.length ) {
      foundry.utils.setProperty(source, "flags.sentius.migratedProperties", components);
    }
  }

  /* -------------------------------------------- */

  /**
   * Migrate activation data.
   * Added in SENTIUS.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static #migrateActivation(source) {
    if ( source.activation?.cost ) source.activation.value = source.activation.cost;
  }

  /* -------------------------------------------- */

  /**
   * Migrate target data.
   * Added in SENTIUS.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static #migrateTarget(source) {
    if ( !("target" in source) ) return;
    source.target.affects ??= {};
    source.target.template ??= {};

    if ( "units" in source.target ) source.target.template.units = source.target.units;
    if ( "width" in source.target ) source.target.template.width = source.target.width;

    const type = source.target.type ?? source.target.template.type ?? source.target.affects.type;
    if ( type in CONFIG.SENTIUS.areaTargetTypes ) {
      if ( "type" in source.target ) source.target.template.type = type;
      if ( "value" in source.target ) source.target.template.size = source.target.value;
    } else if ( type in CONFIG.SENTIUS.individualTargetTypes ) {
      if ( "type" in source.target ) source.target.affects.type = type;
      if ( "value" in source.target ) source.target.affects.count = source.target.value;
    }
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareDerivedData() {
    ActivitiesTemplate._applyActivityShims.call(this);
    this._applySpellShims();
    super.prepareDerivedData();
    this.prepareDescriptionData();

    this.preparation.mode ||= "prepared";
    this.properties.add("mgc");
    this.duration.concentration = this.properties.has("concentration");

    const labels = this.parent.labels ??= {};
    labels.level = CONFIG.SENTIUS.spellLevels[this.level];
    labels.school = CONFIG.SENTIUS.spellSchools[this.school]?.label;
    if ( this.properties.has("material") ) labels.materials = this.materials.value;

    labels.components = this.properties.reduce((obj, c) => {
      const config = this.validProperties.has(c) ? CONFIG.SENTIUS.itemProperties[c] : null;
      if ( !config ) return obj;
      const { abbreviation: abbr, label, icon } = config;
      obj.all.push({ abbr, icon, tag: config.isTag });
      if ( config.isTag ) obj.tags.push(label);
      else obj.vsm.push(abbr);
      return obj;
    }, { all: [], vsm: [], tags: [] });
    labels.components.vsm = game.i18n.getListFormatter({ style: "narrow" }).format(labels.components.vsm);

    const uuid = this.parent._stats.compendiumSource ?? this.parent.uuid;
    Object.defineProperty(labels, "classes", {
      get() {
        return game.i18n.getListFormatter({ style: "narrow" }).format(
          Array.from(sentius.registry.spellLists.forSpell(uuid))
            .filter(list => list.metadata.type === "class")
            .map(list => list.name)
            .sort((lhs, rhs) => lhs.localeCompare(rhs, game.i18n.lang))
        );
      },
      configurable: true
    });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareFinalData() {
    const rollData = this.parent.getRollData({ deterministic: true });
    const labels = this.parent.labels ??= {};
    this.prepareFinalActivityData(rollData);
    ActivationField.prepareData.call(this, rollData, labels);
    DurationField.prepareData.call(this, rollData, labels);
    RangeField.prepareData.call(this, rollData, labels);
    TargetField.prepareData.call(this, rollData, labels);

    // Count preparations.
    const { mode, prepared } = this.preparation;
    const config = CONFIG.SENTIUS.spellPreparationModes[mode];
    const isPrepared = config?.prepares && (mode !== "always") && (this.level > 0) && prepared;
    if ( this.parent.isOwned && this.sourceClass && isPrepared ) {
      const sourceClass = this.parent.actor.spellcastingClasses[this.sourceClass];
      const sourceSubclass = sourceClass?.subclass;
      if ( sourceClass ) sourceClass.system.spellcasting.preparation.value++;
      if ( sourceSubclass ) sourceSubclass.system.spellcasting.preparation.value++;
    }
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async getCardData(enrichmentOptions={}) {
    const context = await super.getCardData(enrichmentOptions);
    context.isSpell = true;
    context.subtitle = [this.parent.labels.level, CONFIG.SENTIUS.spellSchools[this.school]?.label].filterJoin(" &bull; ");
    const { activation, components, duration, range, target } = this.parent.labels;
    context.properties = [components?.vsm, activation, duration, range, target].filter(_ => _);
    if ( !this.properties.has("material") ) delete context.materials;
    return context;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async getFavoriteData() {
    return foundry.utils.mergeObject(await super.getFavoriteData(), {
      subtitle: [this.parent.labels.components.vsm, this.parent.labels.activation],
      modifier: this.parent.labels.modifier,
      range: this.range,
      save: this.activities.getByType("save")[0]?.save
    });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async getSheetData(context) {
    if ( this.parent.actor ) {
      const ability = CONFIG.SENTIUS.abilities[
        this.parent.actor.spellcastingClasses[this.sourceClass]?.spellcasting.ability
          ?? this.parent.actor.system.attributes?.spellcasting
      ]?.label?.toLowerCase();
      if ( ability ) context.defaultAbility = game.i18n.format("SENTIUS.DefaultSpecific", { default: ability });
      else context.defaultAbility = game.i18n.localize("SENTIUS.Default");
    }
    context.subtitles = [
      { label: context.labels.level },
      { label: context.labels.school },
      { label: context.itemStatus },
      { label: context.labels.classes, classes: "full-width" }
    ];
    context.properties.active = this.parent.labels?.components?.tags;
    context.parts = ["sentius.details-spell", "sentius.field-uses"];
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * Attack classification of this spell.
   * @type {"spell"}
   */
  get attackClassification() {
    return "spell";
  }

  /* -------------------------------------------- */

  /** @override */
  get availableAbilities() {
    if ( this.ability ) return new Set([this.ability]);
    const spellcasting = this.parent?.actor?.spellcastingClasses[this.sourceClass]?.spellcasting.ability
      ?? this.parent?.actor?.system.attributes?.spellcasting;
    return new Set(spellcasting ? [spellcasting] : []);
  }

  /* -------------------------------------------- */

  /**
   * Properties displayed in chat.
   * @type {string[]}
   */
  get chatProperties() {
    return [
      this.parent.labels.level,
      this.parent.labels.components.vsm + (this.parent.labels.materials ? ` (${this.parent.labels.materials})` : ""),
      ...this.parent.labels.components.tags
    ];
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  get _typeAbilityMod() {
    return this.availableAbilities.first() ?? "int";
  }

  /* -------------------------------------------- */

  /** @override */
  get criticalThreshold() {
    return this.parent?.actor?.flags.sentius?.spellCriticalThreshold ?? Infinity;
  }

  /* -------------------------------------------- */

  /**
   * Retrieve a linked activity that granted this spell using the stored `cachedFor` value.
   * @returns {Activity|null}
   */
  get linkedActivity() {
    const relative = this.parent.actor;
    if ( !relative ) return null;
    return fromUuidSync(this.parent.getFlag("sentius", "cachedFor"), { relative, strict: false }) ?? null;
  }

  /* -------------------------------------------- */

  /**
   * The proficiency multiplier for this item.
   * @returns {number}
   */
  get proficiencyMultiplier() {
    return 1;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  get scalingIncrease() {
    if ( this.level !== 0 ) return null;
    return Math.floor(((this.parent.actor?.system.cantripLevel?.(this.parent) ?? 0) + 1) / 6);
  }

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /** @inheritDoc */
  getRollData(...options) {
    const data = super.getRollData(...options);
    data.item.level = data.item.level + (this.parent.getFlag("sentius", "scaling") ?? 0);
    return data;
  }

  /* -------------------------------------------- */
  /*  Socket Event Handlers                       */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ( (await super._preCreate(data, options, user)) === false ) return false;
    if ( !this.parent.isEmbedded ) return;

    // Set as prepared for NPCs, and not prepared for PCs
    if ( ["character", "npc"].includes(this.parent.actor.type)
      && !foundry.utils.hasProperty(data, "system.preparation.prepared") ) {
      this.updateSource({ "preparation.prepared": this.parent.actor.type === "npc" });
    }

    if ( ["atwill", "innate"].includes(this.preparation.mode) || this.sourceClass ) return;
    const classes = new Set(Object.keys(this.parent.actor.spellcastingClasses));
    if ( !classes.size ) return;

    // Set the source class, and ensure the preparation mode matches if adding a prepared spell to an alt class
    const setClass = cls => {
      const update = { sourceClass: cls };
      const type = this.parent.actor.classes[cls].spellcasting.type;
      if ( (type !== "leveled") && (this.preparation.mode === "prepared") && (this.level > 0)
        && (type in CONFIG.SENTIUS.spellPreparationModes) ) update["preparation.mode"] = type;
      this.updateSource(update);
    };

    // If preparation mode matches an alt spellcasting type and matching class exists, set as that class
    if ( this.preparation.mode in CONFIG.SENTIUS.spellcastingTypes ) {
      const altClasses = classes.filter(i => this.parent.actor.classes[i].spellcasting.type === this.preparation.mode);
      if ( altClasses.size === 1 ) setClass(altClasses.first());
      return;
    }

    // If only a single spellcasting class is present, use that
    if ( classes.size === 1 ) {
      setClass(classes.first());
      return;
    }

    // Create intersection of spellcasting classes and classes that offer the spell
    const spellClasses = new Set(
      sentius.registry.spellLists.forSpell(this.parent._stats.compendiumSource).map(l => l.metadata.identifier)
    );
    const intersection = classes.intersection(spellClasses);
    if ( intersection.size === 1 ) setClass(intersection.first());
  }

  /* -------------------------------------------- */
  /*  Shims                                       */
  /* -------------------------------------------- */

  /**
   * Add additional data shims for spells.
   */
  _applySpellShims() {
    Object.defineProperty(this.activation, "cost", {
      get() {
        foundry.utils.logCompatibilityWarning(
          "The `activation.cost` property on `SpellData` has been renamed `activation.value`.",
          { since: "SENTIUS", until: "SENTIUS"", once: true }
        );
        return this.value;
      },
      configurable: true,
      enumerable: false
    });
    Object.defineProperty(this, "scaling", {
      get() {
        foundry.utils.logCompatibilityWarning(
          "The `scaling` property on `SpellData` has been deprecated and is now handled by individual damage parts.",
          { since: "SENTIUS", until: "SENTIUS"", once: true }
        );
        return { mode: "none", formula: null };
      },
      configurable: true,
      enumerable: false
    });
    Object.defineProperty(this.target, "value", {
      get() {
        foundry.utils.logCompatibilityWarning(
          "The `target.value` property on `SpellData` has been split into `target.template.size` and `target.affects.count`.",
          { since: "SENTIUS", until: "SENTIUS"", once: true }
        );
        return this.template.size || this.affects.count;
      },
      configurable: true,
      enumerable: false
    });
    Object.defineProperty(this.target, "width", {
      get() {
        foundry.utils.logCompatibilityWarning(
          "The `target.width` property on `SpellData` has been moved to `target.template.width`.",
          { since: "SENTIUS", until: "SENTIUS"", once: true }
        );
        return this.template.width;
      },
      configurable: true,
      enumerable: false
    });
    Object.defineProperty(this.target, "units", {
      get() {
        foundry.utils.logCompatibilityWarning(
          "The `target.units` property on `SpellData` has been moved to `target.template.units`.",
          { since: "SENTIUS", until: "SENTIUS"", once: true }
        );
        return this.template.units;
      },
      configurable: true,
      enumerable: false
    });
    Object.defineProperty(this.target, "type", {
      get() {
        foundry.utils.logCompatibilityWarning(
          "The `target.type` property on `SpellData` has been split into `target.template.type` and `target.affects.type`.",
          { since: "SENTIUS", until: "SENTIUS"", once: true }
        );
        return this.template.type || this.affects.type;
      },
      configurable: true,
      enumerable: false
    });
    const firstActivity = this.activities.contents[0] ?? {};
    Object.defineProperty(this.target, "prompt", {
      get() {
        foundry.utils.logCompatibilityWarning(
          "The `target.prompt` property on `SpellData` has moved into its activity.",
          { since: "SENTIUS", until: "SENTIUS"", once: true }
        );
        return firstActivity.target?.prompt;
      },
      configurable: true,
      enumerable: false
    });
  }
}
