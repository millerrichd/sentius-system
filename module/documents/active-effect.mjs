import FormulaField from "../data/fields/formula-field.mjs";
import MappingField from "../data/fields/mapping-field.mjs";
import { staticID } from "../utils.mjs";

const { ObjectField, SchemaField, SetField, StringField } = foundry.data.fields;

/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 */
export default class ActiveEffect5e extends ActiveEffect {
  /**
   * Static ActiveEffect ID for various conditions.
   * @type {Record<string, string>}
   */
  static ID = {
    BLOODIED: staticID("sentiusbloodied"),
    ENCUMBERED: staticID("sentiusencumbered"),
    EXHAUSTION: staticID("sentiusexhaustion")
  };

  /* -------------------------------------------- */

  /**
   * Additional key paths to properties added during base data preparation that should be treated as formula fields.
   * @type {Set<string>}
   */
  static FORMULA_FIELDS = new Set([
    "system.attributes.ac.bonus",
    "system.attributes.ac.min",
    "system.attributes.encumbrance.bonuses.encumbered",
    "system.attributes.encumbrance.bonuses.heavilyEncumbered",
    "system.attributes.encumbrance.bonuses.maximum",
    "system.attributes.encumbrance.bonuses.overall",
    "system.attributes.encumbrance.multipliers.encumbered",
    "system.attributes.encumbrance.multipliers.heavilyEncumbered",
    "system.attributes.encumbrance.multipliers.maximum",
    "system.attributes.encumbrance.multipliers.overall"
  ]);

  /* -------------------------------------------- */

  /**
   * Is this effect an enchantment on an item that accepts enchantment?
   * @type {boolean}
   */
  get isAppliedEnchantment() {
    return (this.type === "enchantment") && !!this.origin && (this.origin !== this.parent.uuid);
  }

  /* -------------------------------------------- */

  /**
   * Should this status effect be hidden from the current user?
   * @type {boolean}
   */
  get isConcealed() {
    if ( this.target?.testUserPermission(game.user, "OBSERVER") ) return false;

    // Hide bloodied status effect from players unless the token is friendly
    if ( (this.id === this.constructor.ID.BLOODIED) && (game.settings.get("sentius", "bloodied") === "player") ) {
      return this.target?.token?.disposition !== foundry.CONST.TOKEN_DISPOSITIONS.FRIENDLY;
    }

    return false;
  }

  /* -------------------------------------------- */

  /**
   * Is this active effect currently suppressed?
   * @type {boolean}
   */
  isSuppressed = false;

  /* -------------------------------------------- */

  /** @inheritDoc */
  get isTemporary() {
    return super.isTemporary && !this.isConcealed;
  }

  /* -------------------------------------------- */

  /**
   * Retrieve the source Actor or Item, or null if it could not be determined.
   * @returns {Promise<Actor5e|Item5e|null>}
   */
  async getSource() {
    if ( (this.target instanceof sentius.documents.Actor5e) && (this.parent instanceof sentius.documents.Item5e) ) {
      return this.parent;
    }
    return fromUuid(this.origin);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  static async _fromStatusEffect(statusId, { reference, ...effectData }, options) {
    if ( !("description" in effectData) && reference ) effectData.description = `@Embed[${reference} inline]`;
    return super._fromStatusEffect?.(statusId, effectData, options) ?? new this(effectData, options);
  }

  /* -------------------------------------------- */
  /*  Data Migration                              */
  /* -------------------------------------------- */

  /** @inheritDoc */
  _initializeSource(data, options={}) {
    if ( data.flags?.sentius?.type === "enchantment" ) {
      data.type = "enchantment";
      delete data.flags.sentius.type;
    }

    return super._initializeSource(data, options);
  }

  /* -------------------------------------------- */
  /*  Effect Application                          */
  /* -------------------------------------------- */

  /** @inheritDoc */
  apply(doc, change) {
    // Ensure changes targeting flags use the proper types
    if ( change.key.startsWith("flags.sentius.") ) change = this._prepareFlagChange(doc, change);

    // Properly handle formulas that don't exist as part of the data model
    if ( ActiveEffect5e.FORMULA_FIELDS.has(change.key) ) {
      const field = new FormulaField({ deterministic: true });
      return { [change.key]: this.constructor.applyField(doc, change, field) };
    }

    // Handle activity-targeted changes
    if ( (change.key.startsWith("activities[") || change.key.startsWith("system.activities."))
      && (doc instanceof Item) ) return this.applyActivity(doc, change);

    return super.apply(doc, change);
  }

  /* -------------------------------------------- */

  /**
   * Apply a change to activities on this item.
   * @param {Item5e} item              The Item to whom this change should be applied.
   * @param {EffectChangeData} change  The change data being applied.
   * @returns {Record<string, *>}      An object of property paths and their updated values.
   */
  applyActivity(item, change) {
    const changes = {};
    const apply = (activity, key) => {
      const c = this.apply(activity, { ...change, key });
      Object.entries(c).forEach(([k, v]) => changes[`system.activities.${activity.id}.${k}`] = v);
    };
    if ( change.key.startsWith("system.activities.") ) {
      const [, , id, ...keyPath] = change.key.split(".");
      const activity = item.system.activities?.get(id);
      if ( activity ) apply(activity, keyPath.join("."));
    } else {
      const { type, key } = change.key.match(/activities\[(?<type>[^\]]+)]\.(?<key>.+)/)?.groups ?? {};
      item.system.activities?.getByType(type)?.forEach(activity => apply(activity, key));
    }
    return changes;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  static applyField(model, change, field) {
    field ??= model.schema.getField(change.key);
    change = foundry.utils.deepClone(change);
    const current = foundry.utils.getProperty(model, change.key);
    const modes = CONST.ACTIVE_EFFECT_MODES;

    // Replace value when using string interpolation syntax
    if ( (field instanceof StringField) && (change.mode === modes.OVERRIDE) && change.value.includes("{}") ) {
      change.value = change.value.replace("{}", current ?? "");
    }

    // If current value is `null`, UPGRADE & DOWNGRADE should always just set the value
    if ( (current === null) && [modes.UPGRADE, modes.DOWNGRADE].includes(change.mode) ) change.mode = modes.OVERRIDE;

    // Handle removing entries from sets
    if ( (field instanceof SetField) && (change.mode === modes.ADD) && (foundry.utils.getType(current) === "Set") ) {
      for ( const value of field._castChangeDelta(change.value) ) {
        const neg = value.replace(/^\s*-\s*/, "");
        if ( neg !== value ) current.delete(neg);
        else current.add(value);
      }
      return current;
    }

    // If attempting to apply active effect to empty MappingField entry, create it
    if ( (current === undefined) && change.key.startsWith("system.") ) {
      let keyPath = change.key;
      let mappingField = field;
      while ( !(mappingField instanceof MappingField) && mappingField ) {
        if ( mappingField.name ) keyPath = keyPath.substring(0, keyPath.length - mappingField.name.length - 1);
        mappingField = mappingField.parent;
      }
      if ( mappingField && (foundry.utils.getProperty(model, keyPath) === undefined) ) {
        const created = mappingField.model.initialize(mappingField.model.getInitialValue(), mappingField);
        foundry.utils.setProperty(model, keyPath, created);
      }
    }

    // Parse any JSON provided when targeting an object
    if ( (field instanceof ObjectField) || (field instanceof SchemaField) ) {
      change = { ...change, value: this.prototype._parseOrString(change.value) };
    }

    return super.applyField(model, change, field);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _applyAdd(actor, change, current, delta, changes) {
    if ( current instanceof Set ) {
      const handle = v => {
        const neg = v.replace(/^\s*-\s*/, "");
        if ( neg !== v ) current.delete(neg);
        else current.add(v);
      };
      if ( Array.isArray(delta) ) delta.forEach(item => handle(item));
      else handle(delta);
      return;
    }
    super._applyAdd(actor, change, current, delta, changes);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _applyLegacy(actor, change, changes) {
    if ( this.system._applyLegacy?.(actor, change, changes) === false ) return;
    super._applyLegacy(actor, change, changes);
  }

  /* --------------------------------------------- */

  /** @inheritDoc */
  _applyUpgrade(actor, change, current, delta, changes) {
    if ( current === null ) return this._applyOverride(actor, change, current, delta, changes);
    return super._applyUpgrade(actor, change, current, delta, changes);
  }

  /* --------------------------------------------- */

  /**
   * Transform the data type of the change to match the type expected for flags.
   * @param {Actor5e} actor            The Actor to whom this effect should be applied.
   * @param {EffectChangeData} change  The change being applied.
   * @returns {EffectChangeData}       The change with altered types if necessary.
   */
  _prepareFlagChange(actor, change) {
    const { key, value } = change;
    const data = CONFIG.SENTIUS.characterFlags[key.replace("flags.sentius.", "")];
    if ( !data ) return change;

    // Set flag to initial value if it isn't present
    const current = foundry.utils.getProperty(actor, key) ?? null;
    if ( current === null ) {
      let initialValue = null;
      if ( data.placeholder ) initialValue = data.placeholder;
      else if ( data.type === Boolean ) initialValue = false;
      else if ( data.type === Number ) initialValue = 0;
      foundry.utils.setProperty(actor, key, initialValue);
    }

    // Coerce change data into the correct type
    if ( data.type === Boolean ) {
      if ( value === "false" ) change.value = false;
      else change.value = Boolean(value);
    }
    return change;
  }

  /* --------------------------------------------- */

  /**
   * Determine whether this Active Effect is suppressed or not.
   */
  determineSuppression() {
    this.isSuppressed = false;
    if ( this.type === "enchantment" ) return;
    if ( this.parent instanceof sentius.documents.Item5e ) this.isSuppressed = this.parent.areEffectsSuppressed;
  }

  /* -------------------------------------------- */
  /*  Lifecycle                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if ( this.id === this.constructor.ID.EXHAUSTION ) this._prepareExhaustionLevel();
    if ( this.isAppliedEnchantment ) sentius.registry.enchantments.track(this.origin, this.uuid);
  }

  /* -------------------------------------------- */

  /**
   * Modify the ActiveEffect's attributes based on the exhaustion level.
   * @protected
   */
  _prepareExhaustionLevel() {
    const config = CONFIG.SENTIUS.conditionTypes.exhaustion;
    let level = this.getFlag("sentius", "exhaustionLevel");
    if ( !Number.isFinite(level) ) level = 1;
    this.img = this.constructor._getExhaustionImage(level);
    this.name = `${game.i18n.localize("SENTIUS.Exhaustion")} ${level}`;
    if ( level >= config.levels ) {
      this.statuses.add("dead");
      CONFIG.SENTIUS.statusEffects.dead.statuses?.forEach(s => this.statuses.add(s));
    }
  }

  /* -------------------------------------------- */

  /**
   * Prepare effect favorite data.
   * @returns {Promise<FavoriteData5e>}
   */
  async getFavoriteData() {
    return {
      img: this.img,
      title: this.name,
      subtitle: this.duration.remaining ? this.duration.label : "",
      toggle: !this.disabled,
      suppressed: this.isSuppressed
    };
  }

  /* -------------------------------------------- */

  /**
   * Create conditions that are applied separately from an effect.
   * @returns {Promise<ActiveEffect5e[]|void>}      Created rider effects.
   */
  async createRiderConditions() {
    const riders = new Set(this.statuses.reduce((acc, status) => {
      const r = CONFIG.statusEffects.find(e => e.id === status)?.riders ?? [];
      return acc.concat(r);
    }, []));
    if ( !riders.size ) return;

    const createRider = async id => {
      const existing = this.parent.effects.get(staticID(`sentius${id}`));
      if ( existing ) return;
      const effect = await ActiveEffect.implementation.fromStatusEffect(id);
      return ActiveEffect.implementation.create(effect, { parent: this.parent, keepId: true });
    };

    return Promise.all(Array.from(riders).map(createRider));
  }

  /* -------------------------------------------- */

  /**
   * Create additional activities, effects, and items that are applied separately from an enchantment.
   * @param {object} options  Options passed to the effect creation.
   */
  async createRiderEnchantments(options={}) {
    let item;
    let profile;
    const { chatMessageOrigin } = options;
    const { enchantmentProfile, activityId } = options.sentius ?? {};

    if ( chatMessageOrigin ) {
      const message = game.messages.get(options?.chatMessageOrigin);
      item = message?.getAssociatedItem();
      const activity = message?.getAssociatedActivity();
      profile = activity?.effects.find(e => e._id === message?.getFlag("sentius", "use.enchantmentProfile"));
    } else if ( enchantmentProfile && activityId ) {
      let activity;
      const origin = await fromUuid(this.origin);
      if ( origin instanceof sentius.documents.activity.EnchantActivity ) {
        activity = origin;
        item = activity.item;
      } else if ( origin instanceof Item ) {
        item = origin;
        activity = item.system.activities?.get(activityId);
      }
      profile = activity?.effects.find(e => e._id === enchantmentProfile);
    }

    if ( !profile || !item ) return;

    // Create Activities
    const riderActivities = {};
    let riderEffects = [];
    for ( const id of profile.riders.activity ) {
      const activityData = item.system.activities.get(id)?.toObject();
      if ( !activityData ) continue;
      activityData._id = foundry.utils.randomID();
      riderActivities[activityData._id] = activityData;
    }
    let createdActivities = [];
    if ( !foundry.utils.isEmpty(riderActivities) ) {
      await this.parent.update({ "system.activities": riderActivities });
      createdActivities = Object.keys(riderActivities).map(id => this.parent.system.activities?.get(id));
      createdActivities.forEach(a => a.effects?.forEach(e => {
        if ( !this.parent.effects.has(e._id) ) riderEffects.push(item.effects.get(e._id)?.toObject());
      }));
    }

    // Create Effects
    riderEffects.push(...profile.riders.effect.map(id => {
      const effectData = item.effects.get(id)?.toObject();
      if ( effectData ) {
        delete effectData._id;
        delete effectData.flags?.sentius?.rider;
        effectData.origin = this.origin;
      }
      return effectData;
    }));
    riderEffects = riderEffects.filter(_ => _);
    const createdEffects = await this.parent.createEmbeddedDocuments("ActiveEffect", riderEffects, { keepId: true });

    // Create Items
    let createdItems = [];
    if ( this.parent.isEmbedded ) {
      const riderItems = await Promise.all(profile.riders.item.map(async uuid => {
        const itemData = (await fromUuid(uuid))?.toObject();
        if ( itemData ) {
          delete itemData._id;
          foundry.utils.setProperty(itemData, "flags.sentius.enchantment", { origin: this.uuid });
        }
        return itemData;
      }));
      createdItems = await this.parent.actor.createEmbeddedDocuments("Item", riderItems.filter(i => i));
    }

    if ( createdActivities.length || createdEffects.length || createdItems.length ) {
      this.addDependent(...createdActivities, ...createdEffects, ...createdItems);
    }
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  toDragData() {
    const data = super.toDragData();
    const activity = this.parent?.system.activities?.getByType("enchant").find(a => {
      return a.effects.some(e => e._id === this.id);
    });
    if ( activity ) data.activityId = activity.id;
    return data;
  }

  /* -------------------------------------------- */
  /*  Socket Event Handlers                       */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ( await super._preCreate(data, options, user) === false ) return false;
    if ( options.keepOrigin === false ) this.updateSource({ origin: this.parent.uuid });

    // Enchantments cannot be added directly to actors
    if ( (this.type === "enchantment") && (this.parent instanceof Actor) ) {
      ui.notifications.error("SENTIUS.ENCHANTMENT.Warning.NotOnActor", { localize: true });
      return false;
    }

    if ( this.isAppliedEnchantment ) {
      const origin = await fromUuid(this.origin);
      const errors = origin?.canEnchant?.(this.parent);
      if ( errors?.length ) {
        errors.forEach(err => console.error(err));
        return false;
      }
      this.updateSource({ disabled: false });
    }
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if ( userId === game.userId ) {
      if ( this.active && (this.parent instanceof Actor) ) await this.createRiderConditions();
      if ( this.isAppliedEnchantment ) await this.createRiderEnchantments(options);
    }
    if ( options.chatMessageOrigin ) {
      document.body.querySelectorAll(`[data-message-id="${options.chatMessageOrigin}"] enchantment-application`)
        .forEach(element => element.buildItemList());
    }
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _onUpdate(data, options, userId) {
    super._onUpdate(data, options, userId);
    const originalLevel = foundry.utils.getProperty(options, "sentius.originalExhaustion");
    const newLevel = foundry.utils.getProperty(data, "flags.sentius.exhaustionLevel");
    const originalEncumbrance = foundry.utils.getProperty(options, "sentius.originalEncumbrance");
    const newEncumbrance = data.statuses?.[0];
    const name = this.name;

    // Display proper scrolling status effects for exhaustion
    if ( (this.id === this.constructor.ID.EXHAUSTION) && Number.isFinite(newLevel) && Number.isFinite(originalLevel) ) {
      if ( newLevel === originalLevel ) return;
      // Temporarily set the name for the benefit of _displayScrollingTextStatus. We should improve this method to
      // accept a name parameter instead.
      if ( newLevel < originalLevel ) this.name = `Exhaustion ${originalLevel}`;
      this._displayScrollingStatus(newLevel > originalLevel);
      this.name = name;
    }

    // Display proper scrolling status effects for encumbrance
    else if ( (this.id === this.constructor.ID.ENCUMBERED) && originalEncumbrance && newEncumbrance ) {
      if ( newEncumbrance === originalEncumbrance ) return;
      const increase = !originalEncumbrance || ((originalEncumbrance === "encumbered") && newEncumbrance)
        || (newEncumbrance === "exceedingCarryingCapacity");
      if ( !increase ) this.name = CONFIG.SENTIUS.encumbrance.effects[originalEncumbrance].name;
      this._displayScrollingStatus(increase);
      this.name = name;
    }
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preDelete(options, user) {
    const dependents = this.getDependents();
    if ( dependents.length && !game.users.activeGM ) {
      ui.notifications.warn("SENTIUS.ConcentrationBreakWarning", { localize: true });
      return false;
    }
    return super._preDelete(options, user);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
    if ( game.user === game.users.activeGM ) this.getDependents().forEach(e => e.delete());
    if ( this.isAppliedEnchantment ) sentius.registry.enchantments.untrack(this.origin, this.uuid);
    document.body.querySelectorAll(`enchantment-application:has([data-enchantment-uuid="${this.uuid}"]`)
      .forEach(element => element.buildItemList());
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _displayScrollingStatus(enabled) {
    if ( this.isConcealed ) return;
    super._displayScrollingStatus(enabled);
  }

  /* -------------------------------------------- */
  /*  Exhaustion and Concentration Handling       */
  /* -------------------------------------------- */

  /**
   * Create effect data for concentration on an actor.
   * @param {Activity} activity  The Activity on which to begin concentrating.
   * @param {object} [data]      Additional data provided for the effect instance.
   * @returns {object}           Created data for the ActiveEffect.
   */
  static createConcentrationEffectData(activity, data={}) {
    if ( activity instanceof Item ) {
      foundry.utils.logCompatibilityWarning(
        "The `createConcentrationEffectData` method on ActiveEffect5e now takes an Activity, rather than an Item.",
        { since: "SENTIUS", until: "SENTIUS"" }
      );
      activity = activity.system.activities?.contents[0];
    }

    const item = activity?.item;
    if ( !item?.isEmbedded || !activity.duration.concentration ) {
      throw new Error("You may not begin concentrating on this item!");
    }

    const statusEffect = CONFIG.statusEffects.find(e => e.id === CONFIG.specialStatusEffects.CONCENTRATING);
    const effectData = foundry.utils.mergeObject({
      ...statusEffect,
      name: `${game.i18n.localize("EFFECT.SENTIUS.StatusConcentrating")}: ${item.name}`,
      description: `<p>${game.i18n.format("SENTIUS.ConcentratingOn", {
        name: item.name,
        type: game.i18n.localize(`TYPES.Item.${item.type}`)
      })}</p><hr><p>@Embed[${item.uuid} inline]</p>`,
      duration: activity.duration.getEffectData(),
      "flags.sentius": {
        activity: {
          type: activity.type, id: activity.id, uuid: activity.uuid
        },
        item: {
          type: item.type, id: item.id, uuid: item.uuid,
          data: !item.actor.items.has(item.id) ? item.toObject() : undefined
        }
      },
      origin: item.uuid,
      statuses: [statusEffect.id].concat(statusEffect.statuses ?? [])
    }, data, {inplace: false});
    delete effectData.id;
    if ( item.type === "spell" ) effectData["flags.sentius.spellLevel"] = item.system.level;

    return effectData;
  }

  /* -------------------------------------------- */

  /**
   * Register listeners for custom handling in the TokenHUD.
   */
  static registerHUDListeners() {
    Hooks.on("renderTokenHUD", this.onTokenHUDRender);
    document.addEventListener("click", this.onClickTokenHUD.bind(this), { capture: true });
    document.addEventListener("contextmenu", this.onClickTokenHUD.bind(this), { capture: true });
  }

  /* -------------------------------------------- */

  /**
   * Adjust exhaustion icon display to match current level.
   * @param {Application} app  The TokenHUD application.
   * @param {jQuery} html      The TokenHUD HTML.
   */
  static onTokenHUDRender(app, html) {
    const actor = app.object.actor;
    const level = foundry.utils.getProperty(actor, "system.attributes.exhaustion");
    if ( Number.isFinite(level) && (level > 0) ) {
      const img = ActiveEffect5e._getExhaustionImage(level);
      html.find('[data-status-id="exhaustion"]').css({
        objectPosition: "-100px",
        background: `url('${img}') no-repeat center / contain`
      });
    }
  }

  /* -------------------------------------------- */

  /**
   * Get the image used to represent exhaustion at this level.
   * @param {number} level
   * @returns {string}
   */
  static _getExhaustionImage(level) {
    const split = CONFIG.SENTIUS.conditionTypes.exhaustion.icon.split(".");
    const ext = split.pop();
    const path = split.join(".");
    return `${path}-${level}.${ext}`;
  }

  /* -------------------------------------------- */

  /**
   * Map the duration of an item to an active effect duration.
   * @param {Item5e} item           An item with a duration.
   * @returns {EffectDurationData}  The active effect duration.
   */
  static getEffectDurationFromItem(item) {
    foundry.utils.logCompatibilityWarning(
      "The `getEffectDurationFromItem` method on ActiveEffect5e has been deprecated and replaced with `getEffectData` within Item or Activity duration.",
      { since: "SENTIUS", until: "SENTIUS"" }
    );
    return item.system.duration?.getEffectData?.() ?? {};
  }

  /* -------------------------------------------- */

  /**
   * Implement custom behavior for select conditions on the token HUD.
   * @param {PointerEvent} event        The triggering event.
   */
  static onClickTokenHUD(event) {
    const { target } = event;
    if ( !target.classList?.contains("effect-control") ) return;

    const actor = canvas.hud.token.object?.actor;
    if ( !actor ) return;

    const id = target.dataset?.statusId;
    if ( id === "exhaustion" ) ActiveEffect5e._manageExhaustion(event, actor);
    else if ( id === "concentrating" ) ActiveEffect5e._manageConcentration(event, actor);
  }

  /* -------------------------------------------- */

  /**
   * Manage custom exhaustion cycling when interacting with the token HUD.
   * @param {PointerEvent} event        The triggering event.
   * @param {Actor5e} actor             The actor belonging to the token.
   */
  static _manageExhaustion(event, actor) {
    let level = foundry.utils.getProperty(actor, "system.attributes.exhaustion");
    if ( !Number.isFinite(level) ) return;
    event.preventDefault();
    event.stopPropagation();
    if ( event.button === 0 ) level++;
    else level--;
    const max = CONFIG.SENTIUS.conditionTypes.exhaustion.levels;
    actor.update({ "system.attributes.exhaustion": Math.clamp(level, 0, max) });
  }

  /* -------------------------------------------- */

  /**
   * Manage custom concentration handling when interacting with the token HUD.
   * @param {PointerEvent} event        The triggering event.
   * @param {Actor5e} actor             The actor belonging to the token.
   */
  static _manageConcentration(event, actor) {
    const { effects } = actor.concentration;
    if ( effects.size < 1 ) return;
    event.preventDefault();
    event.stopPropagation();
    if ( effects.size === 1 ) {
      actor.endConcentration(effects.first());
      return;
    }
    const choices = effects.reduce((acc, effect) => {
      const data = effect.getFlag("sentius", "item.data");
      acc[effect.id] = data?.name ?? actor.items.get(data)?.name ?? game.i18n.localize("SENTIUS.ConcentratingItemless");
      return acc;
    }, {});
    const options = HandlebarsHelpers.selectOptions(choices, { hash: { sort: true } });
    const content = `
    <form class="sentius">
      <p>${game.i18n.localize("SENTIUS.ConcentratingEndChoice")}</p>
      <div class="form-group">
        <label>${game.i18n.localize("SENTIUS.SOURCE.FIELDS.source.label")}</label>
        <div class="form-fields">
          <select name="source">${options}</select>
        </div>
      </div>
    </form>`;
    Dialog.prompt({
      content: content,
      callback: ([html]) => {
        const source = new FormDataExtended(html.querySelector("FORM")).object.source;
        if ( source ) actor.endConcentration(source);
      },
      rejectClose: false,
      title: game.i18n.localize("SENTIUS.Concentration"),
      label: game.i18n.localize("SENTIUS.Confirm")
    });
  }

  /* -------------------------------------------- */

  /**
   * Record another effect as a dependent of this one.
   * @param {...ActiveEffect5e} dependent  One or more dependent effects.
   * @returns {Promise<ActiveEffect5e>}
   */
  addDependent(...dependent) {
    const dependents = this.getFlag("sentius", "dependents") ?? [];
    dependents.push(...dependent.map(d => ({ uuid: d.uuid })));
    return this.setFlag("sentius", "dependents", dependents);
  }

  /* -------------------------------------------- */

  /**
   * Retrieve a list of dependent effects.
   * @returns {Array<ActiveEffect5e|Item5e>}
   */
  getDependents() {
    return (this.getFlag("sentius", "dependents") || []).reduce((arr, { uuid }) => {
      const effect = fromUuidSync(uuid);
      if ( effect ) arr.push(effect);
      return arr;
    }, []);
  }

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /**
   * Helper method to add choices that have been overridden by an active effect. Used to determine what fields might
   * need to be disabled because they are overridden by an active effect in a way not easily determined by looking at
   * the `Document#overrides` data structure.
   * @param {Actor5e|Item5e} doc  Document from which to determine the overrides.
   * @param {string} prefix       The initial form prefix under which the choices are grouped.
   * @param {string} path         Path in document data.
   * @param {string[]} overrides  The list of fields that are currently modified by Active Effects. *Will be mutated.*
   */
  static addOverriddenChoices(doc, prefix, path, overrides) {
    const source = new Set(foundry.utils.getProperty(doc._source, path) ?? []);
    const current = foundry.utils.getProperty(doc, path) ?? new Set();
    const delta = current.symmetricDifference(source);
    for ( const choice of delta ) overrides.push(`${prefix}.${choice}`);
  }

  /* -------------------------------------------- */

  /**
   * Render a rich tooltip for this effect.
   * @param {EnrichmentOptions} [enrichmentOptions={}]  Options for text enrichment.
   * @returns {Promise<{content: string, classes: string[]}>}
   */
  async richTooltip(enrichmentOptions={}) {
    const properties = [];
    if ( this.isSuppressed ) properties.push("SENTIUS.EffectType.Unavailable");
    else if ( this.disabled ) properties.push("SENTIUS.EffectType.Inactive");
    else if ( this.isTemporary ) properties.push("SENTIUS.EffectType.Temporary");
    else properties.push("SENTIUS.EffectType.Passive");
    if ( this.type === "enchantment" ) properties.push("SENTIUS.ENCHANTMENT.Label");

    return {
      content: await renderTemplate(
        "systems/sentius/templates/effects/parts/effect-tooltip.hbs", {
          effect: this,
          description: await TextEditor.enrichHTML(this.description ?? "", { relativeTo: this, ...enrichmentOptions }),
          durationParts: this.duration.remaining ? this.duration.label.split(", ") : [],
          properties: properties.map(p => game.i18n.localize(p))
        }
      ),
      classes: ["sentius2", "sentius-tooltip", "effect-tooltip"]
    };
  }

  /* -------------------------------------------- */

  /** @override */
  async deleteDialog(dialogOptions={}, operation={}) {
    const type = game.i18n.localize(this.constructor.metadata.label);
    return foundry.applications.api.DialogV2.confirm(foundry.utils.mergeObject({
      window: { title: `${game.i18n.format("DOCUMENT.Delete", { type })}: ${this.name}` },
      position: { width: 400 },
      content: `
        <p>
            <strong>${game.i18n.localize("AreYouSure")}</strong> ${game.i18n.format("SIDEBAR.DeleteWarning", { type })}
        </p>
      `,
      yes: { callback: () => this.delete(operation) }
    }, dialogOptions));
  }
}