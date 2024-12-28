import CharacterData from "../../data/actor/character.mjs";
import * as Trait from "../../documents/actor/trait.mjs";
import { formatNumber } from "../../utils.mjs";
import CompendiumBrowser from "../compendium-browser.mjs";
import ContextMenu5e from "../context-menu.mjs";
import SheetConfig5e from "../sheet-config.mjs";
import ActorSheet5eCharacter from "./character-sheet.mjs";
import ActorSheetV2Mixin from "./sheet-v2-mixin.mjs";

/**
 * An Actor sheet for player character type actors.
 * @mixes ActorSheetV2
 */
export default class ActorSheet5eCharacter2 extends ActorSheetV2Mixin(ActorSheet5eCharacter) {
  /** @inheritDoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sentius2", "sheet", "actor", "character", "vertical-tabs"],
      tabs: [{ navSelector: ".tabs", contentSelector: ".tab-body", initial: "details" }],
      dragDrop: [
        { dragSelector: ".item-list .item > .item-row", dropSelector: null },
        { dragSelector: ".item-list .item .activity-row", dropSelector: null },
        { dragSelector: ".containers .container", dropSelector: null },
        { dragSelector: ".favorites :is([data-item-id], [data-effect-id])", dropSelector: null },
        { dragSelector: ":is(.race, .background)[data-item-id]", dropSelector: null },
        { dragSelector: ".classes .gold-icon[data-item-id]", dropSelector: null },
        { dragSelector: "[data-key] .skill-name, [data-key] .tool-name", dropSelector: null },
        { dragSelector: ".spells-list .spell-header, .slots[data-favorite-id]", dropSelector: null },
        { dragSelector: ".effects-list [data-effect-id]", dropSelector: null }
      ],
      scrollY: [".main-content"],
      width: 800,
      height: 1000,
      resizable: true
    });
  }

  /**
   * Proficiency class names.
   * @enum {string}
   */
  static PROFICIENCY_CLASSES = {
    0: "none",
    0.5: "half",
    1: "full",
    2: "double"
  };

  /** @override */
  static TABS = [
    { tab: "details", label: "SENTIUS.Details", icon: "fas fa-cog" },
    { tab: "inventory", label: "SENTIUS.Inventory", svg: "backpack" },
    { tab: "features", label: "SENTIUS.Features", icon: "fas fa-list" },
    { tab: "spells", label: "TYPES.Item.spellPl", icon: "fas fa-book" },
    { tab: "effects", label: "SENTIUS.Effects", icon: "fas fa-bolt" },
    { tab: "biography", label: "SENTIUS.Biography", icon: "fas fa-feather" },
    { tab: "bastion", label: "SENTIUS.Bastion.Label", icon: "fas fa-chess-rook" }
  ];

  /**
   * Whether the user has manually opened the death save tray.
   * @type {boolean}
   * @protected
   */
  _deathTrayOpen = false;

  /* -------------------------------------------- */

  /** @override */
  get template() {
    if ( !game.user.isGM && this.actor.limited ) return "systems/sentius/templates/actors/limited-sheet-2.hbs";
    return "systems/sentius/templates/actors/character-sheet-2.hbs";
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _render(force=false, options={}) {
    await super._render(force, options);
    if ( !this.rendered ) return;
    const context = options.renderContext ?? options.action;
    const data = options.renderData ?? options.data;
    const isUpdate = (context === "update") || (context === "updateActor");
    const hp = foundry.utils.getProperty(data ?? {}, "system.attributes.hp.value");
    if ( isUpdate && (hp === 0) ) this._toggleDeathTray(true);
    this._toggleBastionTab();
  }

  /* -------------------------------------------- */

  /**
   * Handle displaying the bastion tab when characters are eligible.
   * @protected
   */
  _toggleBastionTab() {
    const [bastion] = this.element.find('nav.tabs [data-tab="bastion"]');
    const { enabled } = game.settings.get("sentius", "bastionConfiguration");
    const { basic, special } = CONFIG.SENTIUS.facilities.advancement;
    const threshold = Math.min(...Object.keys(basic), ...Object.keys(special));
    if ( bastion ) bastion.toggleAttribute("hidden", (this.actor.system.details.level < threshold) || !enabled);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async getData(options) {
    const context = await super.getData(options);
    const { attributes, bastion, details, traits } = this.actor.system;

    // Class
    context.labels.class = Object.values(this.actor.classes).sort((a, b) => {
      return b.system.levels - a.system.levels;
    }).map(c => `${c.name} ${c.system.levels}`).join(" / ");

    // Exhaustion
    if ( CONFIG.SENTIUS.conditionTypes.exhaustion ) {
      const max = CONFIG.SENTIUS.conditionTypes.exhaustion.levels;
      context.exhaustion = Array.fromRange(max, 1).reduce((acc, n) => {
        const label = game.i18n.format("SENTIUS.ExhaustionLevel", { n });
        const classes = ["pip"];
        const filled = attributes.exhaustion >= n;
        if ( filled ) classes.push("filled");
        if ( n === max ) classes.push("death");
        const pip = { n, label, filled, tooltip: label, classes: classes.join(" ") };

        if ( n <= max / 2 ) acc.left.push(pip);
        else acc.right.push(pip);
        return acc;
      }, { left: [], right: [] });
    }

    // Speed
    context.speed = Object.entries(CONFIG.SENTIUS.movementTypes).reduce((obj, [k, label]) => {
      const value = attributes.movement[k];
      if ( value > obj.value ) Object.assign(obj, { value, label });
      return obj;
    }, { value: 0, label: CONFIG.SENTIUS.movementTypes.walk });

    // Death Saves
    context.death.open = this._deathTrayOpen;

    // Ability Scores
    context.abilityRows = Object.entries(context.abilities).reduce((obj, [k, ability]) => {
      ability.key = k;
      ability.abbr = CONFIG.SENTIUS.abilities[k]?.abbreviation ?? "";
      ability.baseValue = context.source.abilities[k]?.value ?? 0;
      if ( obj.bottom.length > 5 ) obj.top.push(ability);
      else obj.bottom.push(ability);
      return obj;
    }, { top: [], bottom: [] });
    context.abilityRows.optional = Object.keys(CONFIG.SENTIUS.abilities).length - 6;

    // Saving Throws
    context.saves = {};
    for ( let ability of Object.values(context.abilities) ) {
      ability = context.saves[ability.key] = { ...ability };
      ability.class = this.constructor.PROFICIENCY_CLASSES[context.editable ? ability.baseProf : ability.proficient];
      ability.hover = CONFIG.SENTIUS.proficiencyLevels[ability.proficient];
    }

    if ( this.actor.statuses.has(CONFIG.specialStatusEffects.CONCENTRATING) || context.editable ) {
      context.saves.concentration = {
        isConcentration: true,
        class: "colspan concentration",
        label: game.i18n.localize("SENTIUS.Concentration"),
        abbr: game.i18n.localize("SENTIUS.Concentration"),
        save: attributes.concentration.save
      };
    }

    // Size
    context.size = {
      label: CONFIG.SENTIUS.actorSizes[traits.size]?.label ?? traits.size,
      abbr: CONFIG.SENTIUS.actorSizes[traits.size]?.abbreviation ?? "—",
      mod: attributes.encumbrance.mod
    };

    // Skills & Tools
    for ( const [key, entry] of Object.entries(context.skills).concat(Object.entries(context.tools)) ) {
      entry.class = this.constructor.PROFICIENCY_CLASSES[context.editable ? entry.baseValue : entry.value];
      if ( key in CONFIG.SENTIUS.skills ) entry.reference = CONFIG.SENTIUS.skills[key].reference;
      else if ( key in CONFIG.SENTIUS.tools ) entry.reference = Trait.getBaseItemUUID(CONFIG.SENTIUS.tools[key].id);
    }

    // Character Background
    context.creatureType = {
      class: details.type.value === "custom" ? "none" : "",
      icon: CONFIG.SENTIUS.creatureTypes[details.type.value]?.icon ?? "icons/svg/mystery-man.svg",
      title: details.type.value === "custom"
        ? details.type.custom
        : CONFIG.SENTIUS.creatureTypes[details.type.value]?.label,
      reference: CONFIG.SENTIUS.creatureTypes[details.type.value]?.reference,
      subtitle: details.type.subtype
    };

    if ( details.race instanceof sentius.documents.Item5e ) context.race = details.race;
    if ( details.background instanceof sentius.documents.Item5e ) context.background = details.background;

    // Senses
    if ( foundry.utils.isEmpty(context.senses) ) delete context.senses;

    // Spellcasting
    context.spellcasting = [];
    for ( const item of Object.values(this.actor.classes).sort((a, b) => b.system.levels - a.system.levels) ) {
      const sc = item.spellcasting;
      if ( !sc?.progression || (sc.progression === "none") ) continue;
      const ability = this.actor.system.abilities[sc.ability];
      const mod = ability?.mod ?? 0;
      const name = item.system.spellcasting.progression === sc.progression ? item.name : item.subclass?.name;
      context.spellcasting.push({
        label: game.i18n.format("SENTIUS.SpellcastingClass", { class: name }),
        ability: { mod, ability: sc.ability },
        attack: sc.attack,
        preparation: sc.preparation,
        primary: this.actor.system.attributes.spellcasting === sc.ability,
        save: sc.save
      });
    }

    // Characteristics
    context.characteristics = [
      "alignment", "eyes", "height", "faith", "hair", "weight", "gender", "skin", "age"
    ].map(k => {
      const fields = CharacterData.schema.fields.details.fields;
      const field = fields[k];
      const name = `system.details.${k}`;
      return { name, label: field.label, value: foundry.utils.getProperty(this.actor, name) ?? "" };
    });

    // Favorites
    context.favorites = await this._prepareFavorites();
    context.favorites.sort((a, b) => a.sort - b.sort);

    // Epic Boons
    if ( context.system.details.xp.boonsEarned !== undefined ) {
      const pluralRules = new Intl.PluralRules(game.i18n.lang);
      context.epicBoonsEarned = game.i18n.format(
        `SENTIUS.ExperiencePointsBoons.${pluralRules.select(context.system.details.xp.boonsEarned ?? 0)}`,
        { number: formatNumber(context.system.details.xp.boonsEarned ?? 0, { signDisplay: "always" }) }
      );
    }

    // Bastion
    context.bastion = {
      description: await TextEditor.enrichHTML(bastion.description, {
        secrets: this.actor.isOwner,
        rollData: context.rollData,
        relativeTo: this.actor
      })
    };

    // Facilities
    await this._prepareFacilities(context);

    return context;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _prepareItems(context) {
    super._prepareItems(context);
    context.containers = context.inventory
      .findSplice(entry => entry.dataset.type === "container")
      ?.items?.sort((a, b) => a.sort - b.sort);
    context.inventory = context.inventory.filter(entry => entry.items.length);
    context.inventory.push({ label: "SENTIUS.Contents", items: [], dataset: { type: "all" } });
    context.inventory.forEach(section => {
      section.categories = [
        { activityPartial: "sentius.activity-column-price" },
        { activityPartial: "sentius.activity-column-weight" },
        { activityPartial: "sentius.activity-column-quantity" },
        { activityPartial: "sentius.activity-column-uses" },
        { activityPartial: "sentius.activity-column-controls" }
      ];
    });

    // Remove races & background as they are shown on the details tab instead.
    const features = context.features.filter(f => (f.dataset.type !== "background") && (f.dataset.type !== "race"));
    features.forEach(f => {
      if ( f.hasActions ) f.dataset.type = "active";
      else f.dataset.type = "passive";
    });

    // Add extra categories for features grouping.
    Object.values(this.actor.classes ?? {}).sort((a, b) => b.system.levels - a.system.levels).forEach(cls => {
      features.push({
        label: game.i18n.format("SENTIUS.FeaturesClass", { class: cls.name }),
        items: [],
        dataset: { type: cls.identifier }
      });
    });

    if ( this.actor.system.details.race instanceof sentius.documents.Item5e ) {
      features.push({ label: "SENTIUS.Species.Features", items: [], dataset: { type: "race" } });
    }

    if ( this.actor.system.details.background instanceof sentius.documents.Item5e ) {
      features.push({ label: "SENTIUS.FeaturesBackground", items: [], dataset: { type: "background" } });
    }

    features.push({ label: "SENTIUS.FeaturesOther", items: [], dataset: { type: "other" } });
    context.classes = features.findSplice(f => f.isClass)?.items;

    context.features = {
      sections: features,
      filters: [
        { key: "action", label: "SENTIUS.Action" },
        { key: "bonus", label: "SENTIUS.BonusAction" },
        { key: "reaction", label: "SENTIUS.Reaction" },
        { key: "sr", label: "SENTIUS.ShortRest" },
        { key: "lr", label: "SENTIUS.LongRest" },
        { key: "concentration", label: "SENTIUS.Concentration" },
        { key: "mgc", label: "SENTIUS.Item.Property.Magical" }
      ]
    };

    // TODO: Customise this per-section.
    features.forEach(section => {
      section.categories = [
        {
          classes: "item-uses", label: "SENTIUS.Uses", itemPartial: "sentius.column-uses",
          activityPartial: "sentius.activity-column-uses"
        },
        {
          classes: "item-recovery", label: "SENTIUS.Recovery", itemPartial: "sentius.column-recovery",
          activityPartial: "sentius.activity-column-recovery"
        },
        {
          classes: "item-controls", itemPartial: "sentius.column-feature-controls",
          activityPartial: "sentius.activity-column-controls"
        }
      ];
    });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".death-tab").on("click", () => this._toggleDeathTray());
    html.find("[data-action]").on("click", this._onAction.bind(this));

    // Apply special context menus for items outside inventory elements
    const featuresElement = html[0].querySelector(`[data-tab="features"] ${this.options.elements.inventory}`);
    if ( featuresElement ) {
      new ContextMenu5e(html, ".pills-lg [data-item-id], .favorites [data-item-id], .facility[data-item-id]", [], {
        onOpen: (...args) => featuresElement._onOpenContextMenu(...args)
      });
    }

    // Edit mode only.
    if ( this._mode === this.constructor.MODES.EDIT ) {
      html.find(".tab.details .item-action").on("click", this._onItemAction.bind(this));
    }

    if ( !this.isEditable ) {
      html[0].querySelectorAll('[data-action="findItem"]').forEach(el => el.classList.add("disabled"));
    }
  }

  /* -------------------------------------------- */

  /** @override */
  _disableOverriddenFields(html) {
    // When in edit mode, field values will be the base value, rather than the derived value, so it should not be
    // necessary to disable them anymore.
  }

  /* -------------------------------------------- */

  /** @override */
  _getSubmitData(updateData={}) {
    // Skip over ActorSheet#_getSubmitData to allow for editing overridden values.
    return FormApplication.prototype._getSubmitData.call(this, updateData);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async activateEditor(name, options={}, initialContent="") {
    options.relativeLinks = true;
    options.plugins = {
      menu: ProseMirror.ProseMirrorMenu.build(ProseMirror.defaultSchema, {
        compact: true,
        destroyOnSave: false,
        onSave: () => this.saveEditor(name, { remove: false })
      })
    };
    return super.activateEditor(name, options, initialContent);
  }

  /* -------------------------------------------- */

  /**
   * Handling beginning a drag-drop operation on an Activity.
   * @param {DragEvent} event  The originating drag event.
   * @protected
   */
  _onDragActivity(event) {
    const { itemId } = event.target.closest("[data-item-id]").dataset;
    const { activityId } = event.target.closest("[data-activity-id]").dataset;
    const activity = this.actor.items.get(itemId)?.system.activities?.get(activityId);
    if ( activity ) event.dataTransfer.setData("text/plain", JSON.stringify(activity.toDragData()));
  }

  /* -------------------------------------------- */

  /**
   * Handle beginning a drag-drop operation on an Item.
   * @param {DragEvent} event  The originating drag event.
   * @protected
   */
  _onDragItem(event) {
    const { itemId } = event.target.closest("[data-item-id]").dataset;
    const item = this.actor.items.get(itemId);
    if ( item ) event.dataTransfer.setData("text/plain", JSON.stringify(item.toDragData()));
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _onDragStart(event) {
    // Add another deferred deactivation to catch the second pointerenter event that seems to be fired on Firefox.
    requestAnimationFrame(() => game.tooltip.deactivate());
    game.tooltip.deactivate();

    const modes = CONFIG.SENTIUS.spellPreparationModes;

    const { key } = event.target.closest("[data-key]")?.dataset ?? {};
    const { level, preparationMode } = event.target.closest("[data-level]")?.dataset ?? {};
    const isSlots = event.target.closest("[data-favorite-id]") || event.target.classList.contains("spell-header");
    let type;
    if ( key in CONFIG.SENTIUS.skills ) type = "skill";
    else if ( key in CONFIG.SENTIUS.tools ) type = "tool";
    else if ( modes[preparationMode]?.upcast && (level !== "0") && isSlots ) type = "slots";
    if ( !type ) {
      if ( event.target.matches("[data-item-id] > .item-row") ) return this._onDragItem(event);
      else if ( event.target.matches("[data-item-id] [data-activity-id], [data-item-id][data-activity-id]") ) {
        return this._onDragActivity(event);
      }
      return super._onDragStart(event);
    }
    const dragData = { sentius: { action: "favorite", type } };
    if ( type === "slots" ) dragData.sentius.id = (preparationMode === "prepared") ? `spell${level}` : preparationMode;
    else dragData.sentius.id = key;
    event.dataTransfer.setData("application/json", JSON.stringify(dragData));
  }

  /* -------------------------------------------- */

  /**
   * Toggle the death save tray.
   * @param {boolean} [open]  Force a particular open state.
   * @protected
   */
  _toggleDeathTray(open) {
    const tray = this.form.querySelector(".death-tray");
    const tab = tray.querySelector(".death-tab");
    tray.classList.toggle("open", open);
    this._deathTrayOpen = tray.classList.contains("open");
    tab.dataset.tooltip = `SENTIUS.DeathSave${this._deathTrayOpen ? "Hide" : "Show"}`;
    tab.setAttribute("aria-label", game.i18n.localize(tab.dataset.tooltip));
  }

  /* -------------------------------------------- */

  /**
   * Handle the user performing some sheet action.
   * @param {PointerEvent} event  The triggering event.
   * @protected
   */
  _onAction(event) {
    const target = event.currentTarget;
    switch ( target.dataset.action ) {
      case "addFacility": this._onAddFacility(event); break;
      case "deleteOccupant": this._onDeleteOccupant(event); break;
      case "findItem":
        this._onFindItem(target.dataset.itemType, { classIdentifier: target.dataset.classIdentifier });
        break;
      case "removeFavorite": this._onRemoveFavorite(event); break;
      case "spellcasting": this._onToggleSpellcasting(event); break;
      case "toggleInspiration": this._onToggleInspiration(); break;
      case "useFacility": this._onUseFacility(event); break;
      case "useFavorite": this._onUseFavorite(event); break;
      case "viewOccupant": this._onViewOccupant(event); break;
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle prompting the user to add a new facility.
   * @param {PointerEvent} event  The triggering event.
   * @returns {Promise<void>}
   * @protected
   */
  async _onAddFacility(event) {
    const { type } = event.target.closest("[data-type]").dataset;
    const otherType = type === "basic" ? "special" : "basic";
    const result = await CompendiumBrowser.selectOne({
      filters: { locked: {
        types: new Set(["facility"]),
        additional: { type: { [type]: 1, [otherType]: -1 }, level: { max: this.actor.system.details.level } }
      } }
    });
    if ( result ) this._onDropItemCreate(await fromUuid(result));
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _onChangeInput(event) {
    const { name } = event.target.dataset;
    const { itemId } = event.target.closest("[data-item-id]")?.dataset ?? {};
    const item = this.actor.items.get(itemId);
    if ( event.target.closest(".favorites") && name && item ) return item.update({ [name]: event.target.value });
    return super._onChangeInput(event);
  }

  /* -------------------------------------------- */

  /** @override */
  _onConfigureSheet(event) {
    event.preventDefault();
    new SheetConfig5e(this.document, {
      top: this.position.top + 40,
      left: this.position.left + ((this.position.width - DocumentSheet.defaultOptions.width) / 2)
    }).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle deleting an occupant from a facility.
   * @param {PointerEvent} event  The triggering event.
   * @returns {Promise<Item5e>|void}
   * @protected
   */
  _onDeleteOccupant(event) {
    event.stopPropagation();
    const { facilityId } = event.target.closest("[data-facility-id]")?.dataset ?? {};
    const { prop } = event.target.closest("[data-prop]")?.dataset ?? {};
    const { index } = event.target.closest("[data-index]")?.dataset ?? {};
    const facility = this.actor.items.get(facilityId);
    if ( !facility || !prop || (index === undefined) ) return;
    let { value } = foundry.utils.getProperty(facility, prop);
    value = value.filter((_, i) => i !== Number(index));
    return facility.update({ [`${prop}.value`]: value });
  }

  /* -------------------------------------------- */

  /**
   * Show available items of a given type.
   * @param {string} type                       The item type.
   * @param {object} [options={}]
   * @param {string} [options.classIdentifier]  Identifier of the class when finding a subclass.
   * @protected
   */
  async _onFindItem(type, { classIdentifier }={}) {
    if ( !this.isEditable ) return;
    const filters = { locked: { types: new Set([type]) } };
    if ( classIdentifier ) filters.locked.additional = { class: { [classIdentifier]: 1 } };
    const result = await CompendiumBrowser.selectOne({ filters });
    if ( result ) this._onDropItemCreate(await fromUuid(result));
  }

  /* -------------------------------------------- */

  /**
   * Handle toggling inspiration.
   * @protected
   */
  _onToggleInspiration() {
    this.actor.update({ "system.attributes.inspiration": !this.actor.system.attributes.inspiration });
  }

  /* -------------------------------------------- */

  /**
   * Handle toggling the character's primary spellcasting ability.
   * @param {PointerEvent} event  The triggering event.
   * @protected
   */
  _onToggleSpellcasting(event) {
    const ability = event.currentTarget.closest("[data-ability]")?.dataset.ability;
    this.actor.update({ "system.attributes.spellcasting": ability });
  }

  /* -------------------------------------------- */

  /**
   * Handle viewing a facility occupant.
   * @param {PointerEvent} event  The triggering event.
   * @protected
   */
  async _onViewOccupant(event) {
    const { actorUuid } = event.currentTarget.dataset;
    const actor = await fromUuid(actorUuid);
    actor?.sheet.render(true);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _filterItem(item) {
    if ( item.type === "container" ) return true;
  }

  /* -------------------------------------------- */
  /*  Favorites                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onDrop(event) {
    if ( !event.target.closest(".favorites") ) return super._onDrop(event);
    const dragData = event.dataTransfer.getData("application/json") || event.dataTransfer.getData("text/plain");
    if ( !dragData ) return super._onDrop(event);
    let data;
    try {
      data = JSON.parse(dragData);
    } catch(e) {
      console.error(e);
      return;
    }
    const { action, type, id } = data.sentius ?? {};
    if ( action === "favorite" ) return this._onDropFavorite(event, { type, id });
    if ( data.type === "Activity" ) return this._onDropActivity(event, data);
    return super._onDrop(event);
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping an Activity onto the sheet.
   * @param {DragEvent} event  The originating drag event.
   * @param {object} data      The Activity drag data.
   * @returns {Promise<Actor5e|void>}
   * @protected
   */
  async _onDropActivity(event, data) {
    if ( !event.target.closest(".favorites") ) return;
    const activity = await fromUuid(data.uuid);
    if ( !activity || (activity.actor !== this.actor) ) return;
    const uuid = `${activity.item.getRelativeUUID(this.actor)}.Activity.${activity.id}`;
    return this._onDropFavorite(event, { type: "activity", id: uuid });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onDropActor(event, data) {
    if ( !event.target.closest(".facility-occupants") || !data.uuid ) return super._onDropActor(event, data);
    const { facilityId } = event.target.closest("[data-facility-id]").dataset;
    const facility = this.actor.items.get(facilityId);
    if ( !facility ) return;
    const { prop } = event.target.closest("[data-prop]").dataset;
    const { max, value } = foundry.utils.getProperty(facility, prop);
    if ( (value.length + 1) > max ) return;
    return facility.update({ [`${prop}.value`]: [...value, data.uuid] });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onDropItem(event, data) {
    if ( !event.target.closest(".favorites") ) return super._onDropItem(event, data);
    const item = await Item.implementation.fromDropData(data);
    if ( item?.parent !== this.actor ) return super._onDropItem(event, data);
    const uuid = item.getRelativeUUID(this.actor);
    return this._onDropFavorite(event, { type: "item", id: uuid });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _onDropActiveEffect(event, data) {
    if ( !event.target.closest(".favorites") ) return super._onDropActiveEffect(event, data);
    const effect = await ActiveEffect.implementation.fromDropData(data);
    if ( effect.target !== this.actor ) return super._onDropActiveEffect(event, data);
    const uuid = effect.getRelativeUUID(this.actor);
    return this._onDropFavorite(event, { type: "effect", id: uuid });
  }

  /* -------------------------------------------- */

  /**
   * Handle an owned item or effect being dropped in the favorites area.
   * @param {DragEvent} event            The triggering event.
   * @param {ActorFavorites5e} favorite  The favorite that was dropped.
   * @returns {Promise<Actor5e>|void}
   * @protected
   */
  _onDropFavorite(event, favorite) {
    if ( this.actor.system.hasFavorite(favorite.id) ) return this._onSortFavorites(event, favorite.id);
    return this.actor.system.addFavorite(favorite);
  }

  /* -------------------------------------------- */

  /**
   * Handle removing a favorite.
   * @param {PointerEvent} event  The triggering event.
   * @returns {Promise<Actor5e>|void}
   * @protected
   */
  _onRemoveFavorite(event) {
    const { favoriteId } = event.currentTarget.closest("[data-favorite-id]")?.dataset ?? {};
    if ( !favoriteId ) return;
    return this.actor.system.removeFavorite(favoriteId);
  }

  /* -------------------------------------------- */

  /**
   * Handle re-ordering the favorites list.
   * @param {DragEvent} event  The drop event.
   * @param {string} srcId     The identifier of the dropped favorite.
   * @returns {Promise<Actor5e>|void}
   * @protected
   */
  _onSortFavorites(event, srcId) {
    const dropTarget = event.target.closest("[data-favorite-id]");
    if ( !dropTarget ) return;
    let source;
    let target;
    const targetId = dropTarget.dataset.favoriteId;
    if ( srcId === targetId ) return;
    const siblings = this.actor.system.favorites.filter(f => {
      if ( f.id === targetId ) target = f;
      else if ( f.id === srcId ) source = f;
      return f.id !== srcId;
    });
    const updates = SortingHelpers.performIntegerSort(source, { target, siblings });
    const favorites = this.actor.system.favorites.reduce((map, f) => map.set(f.id, { ...f }), new Map());
    for ( const { target, update } of updates ) {
      const favorite = favorites.get(target.id);
      foundry.utils.mergeObject(favorite, update);
    }
    return this.actor.update({ "system.favorites": Array.from(favorites.values()) });
  }

  /* -------------------------------------------- */

  /**
   * Handle using a facility.
   * @param {PointerEvent} event  The triggering event.
   * @returns {Promise|void}
   * @protected
   */
  _onUseFacility(event) {
    const { facilityId } = event.target.closest("[data-facility-id]")?.dataset ?? {};
    const facility = this.actor.items.get(facilityId);
    return facility?.use({ legacy: false, chooseActivity: true, event });
  }

  /* -------------------------------------------- */

  /**
   * Handle using a favorited item.
   * @param {PointerEvent} event  The triggering event.
   * @returns {Promise|void}
   * @protected
   */
  async _onUseFavorite(event) {
    if ( !this.isEditable || (event.target.tagName === "INPUT") ) return;
    const { favoriteId } = event.currentTarget.closest("[data-favorite-id]").dataset;
    const favorite = await fromUuid(favoriteId, { relative: this.actor });
    if ( (favorite instanceof sentius.documents.Item5e) || event.currentTarget.dataset.activityId ) {
      if ( favorite.type === "container" ) return favorite.sheet.render(true);
      return favorite.use({ legacy: false, event });
    }
    if ( favorite instanceof sentius.documents.ActiveEffect5e ) return favorite.update({ disabled: !favorite.disabled });
  }

  /* -------------------------------------------- */

  /**
   * Prepare bastion facility data for display.
   * @param {object} context  Render context.
   * @returns {Promise<void>}
   * @protected
   */
  async _prepareFacilities(context) {
    const allDefenders = [];
    const basic = [];
    const special = [];

    // TODO: Consider batching compendium lookups. Most occupants are likely to all be from the same compendium.
    for ( const facility of Object.values(this.actor.itemTypes.facility) ) {
      const { id, img, labels, name, system } = facility;
      const { building, craft, defenders, disabled, free, hirelings, progress, size, trade, type } = system;
      const subtitle = [
        building.built ? CONFIG.SENTIUS.facilities.sizes[size].label : game.i18n.localize("SENTIUS.FACILITY.Build.Unbuilt")
      ];
      if ( trade.stock.max ) subtitle.push(`${trade.stock.value ?? 0} &sol; ${trade.stock.max}`);
      const context = {
        id, labels, name, building, disabled, free, progress,
        craft: craft.item ? await fromUuid(craft.item) : null,
        creatures: await this._prepareFacilityOccupants(trade.creatures),
        defenders: await this._prepareFacilityOccupants(defenders),
        executing: CONFIG.SENTIUS.facilities.orders[progress.order]?.icon,
        hirelings: await this._prepareFacilityOccupants(hirelings),
        img: foundry.utils.getRoute(img),
        isSpecial: type.value === "special",
        subtitle: subtitle.join(" &bull; ")
      };
      allDefenders.push(...context.defenders.map(({ actor }) => {
        if ( !actor ) return null;
        const { img, name, uuid } = actor;
        return { img, name, uuid, facility: facility.id };
      }).filter(_ => _));
      if ( context.isSpecial ) special.push(context);
      else basic.push(context);
    }

    context.defenders = allDefenders;
    context.facilities = { basic: { chosen: basic }, special: { chosen: special } };
    ["basic", "special"].forEach(type => {
      const facilities = context.facilities[type];
      const config = CONFIG.SENTIUS.facilities.advancement[type];
      let [, available] = Object.entries(config).reverse().find(([level]) => {
        return level <= this.actor.system.details.level;
      }) ?? [];
      facilities.value = facilities.chosen.filter(({ free }) => (type === "basic") || !free).length;
      facilities.max = available ?? 0;
      available = (available ?? 0) - facilities.value;
      facilities.available = Array.fromRange(Math.max(0, available)).map(() => {
        return { label: `SENTIUS.FACILITY.AvailableFacility.${type}.free` };
      });
    });

    if ( !context.facilities.basic.available.length ) {
      context.facilities.basic.available.push({ label: "SENTIUS.FACILITY.AvailableFacility.basic.build" });
    }
  }

  /* -------------------------------------------- */

  /**
   * Prepare facility occupants for display.
   * @param {FacilityOccupants} occupants  The occupants.
   * @returns {Promise<object[]>}
   * @protected
   */
  _prepareFacilityOccupants(occupants) {
    const { max, value } = occupants;
    return Promise.all(Array.fromRange(max).map(async i => {
      const uuid = value[i];
      if ( uuid ) return { actor: await fromUuid(uuid) };
      return { empty: true };
    }));
  }

  /* -------------------------------------------- */

  /**
   * Prepare favorites for display.
   * @returns {Promise<object>}
   * @protected
   */
  async _prepareFavorites() {
    // Legacy resources
    const resources = Object.entries(this.actor.system.resources).reduce((arr, [k, r]) => {
      const { value, max, sr, lr, label } = r;
      const source = this.actor._source.system.resources[k];
      if ( label && max ) arr.push({
        id: `resources.${k}`,
        type: "resource",
        img: "icons/svg/upgrade.svg",
        resource: { value, max, source },
        css: "uses",
        title: label,
        subtitle: [
          sr ? game.i18n.localize("SENTIUS.AbbreviationSR") : null,
          lr ? game.i18n.localize("SENTIUS.AbbreviationLR") : null
        ].filterJoin(" &bull; ")
      });
      return arr;
    }, []);

    return resources.concat(await this.actor.system.favorites.reduce(async (arr, f) => {
      const { id, type, sort } = f;
      const favorite = await fromUuid(id, { relative: this.actor });
      if ( !favorite && ((type === "item") || (type === "effect") || (type === "activity")) ) return arr;
      arr = await arr;

      let data;
      if ( type === "item" ) data = await favorite.system.getFavoriteData();
      else if ( (type === "effect") || (type === "activity") ) data = await favorite.getFavoriteData();
      else data = await this._getFavoriteData(type, id);
      if ( !data ) return arr;
      let {
        img, title, subtitle, value, uses, quantity, modifier, passive,
        save, range, reference, toggle, suppressed, level
      } = data;

      if ( foundry.utils.getType(save?.ability) === "Set" ) save = {
        ...save, ability: save.ability.size > 2
          ? game.i18n.localize("SENTIUS.AbbreviationDC")
          : Array.from(save.ability).map(k => CONFIG.SENTIUS.abilities[k].abbreviation).join(" / ")
      };

      const css = [];
      if ( uses?.max ) {
        css.push("uses");
        uses.value = Math.round(uses.value);
      }
      else if ( modifier !== undefined ) css.push("modifier");
      else if ( save?.dc ) css.push("save");
      else if ( value !== undefined ) css.push("value");

      if ( toggle === false ) css.push("disabled");
      if ( uses?.max > 99 ) css.push("uses-sm");
      if ( modifier !== undefined ) {
        const value = Number(modifier.replace?.(/\s+/g, "") ?? modifier);
        if ( !isNaN(value) ) modifier = value;
      }

      const rollableClass = [];
      if ( this.isEditable && (type !== "slots") ) rollableClass.push("rollable");
      if ( type === "skill" ) rollableClass.push("skill-name");
      else if ( type === "tool" ) rollableClass.push("tool-name");

      if ( suppressed ) subtitle = game.i18n.localize("SENTIUS.Suppressed");
      const itemId = type === "item" ? favorite.id : type === "activity" ? favorite.item.id : null;
      arr.push({
        id, img, type, title, value, uses, sort, save, modifier, passive, range, reference, suppressed, level, itemId,
        effectId: type === "effect" ? favorite.id : null,
        parentId: (type === "effect") && (favorite.parent !== favorite.target) ? favorite.parent.id: null,
        activityId: type === "activity" ? favorite.id : null,
        preparationMode: (type === "slots") ? (/spell\d+/.test(id) ? "prepared" : id) : null,
        key: (type === "skill") || (type === "tool") ? id : null,
        toggle: toggle === undefined ? null : { applicable: true, value: toggle },
        quantity: quantity > 1 ? quantity : "",
        rollableClass: rollableClass.filterJoin(" "),
        css: css.filterJoin(" "),
        bareName: type === "slots",
        subtitle: Array.isArray(subtitle) ? subtitle.filterJoin(" &bull; ") : subtitle
      });
      return arr;
    }, []));
  }

  /* -------------------------------------------- */

  /**
   * Prepare data for a favorited entry.
   * @param {"skill"|"tool"|"slots"} type  The type of favorite.
   * @param {string} id                    The favorite's identifier.
   * @returns {Promise<FavoriteData5e|void>}
   * @protected
   */
  async _getFavoriteData(type, id) {
    // Spell slots
    if ( type === "slots" ) {
      const { value, max, level } = this.actor.system.spells[id] ?? {};
      const uses = { value, max, name: `system.spells.${id}.value` };
      if ( !/spell\d+/.test(id) ) return {
        uses, level,
        title: game.i18n.localize(`SENTIUS.SpellSlots${id.capitalize()}`),
        subtitle: [
          game.i18n.localize(`SENTIUS.SpellLevel${level}`),
          game.i18n.localize(`SENTIUS.Abbreviation${CONFIG.SENTIUS.spellcastingTypes[id]?.shortRest ? "SR" : "LR"}`)
        ],
        img: CONFIG.SENTIUS.spellcastingTypes[id]?.img || CONFIG.SENTIUS.spellcastingTypes.pact.img
      };

      const plurals = new Intl.PluralRules(game.i18n.lang, { type: "ordinal" });
      const isSR = CONFIG.SENTIUS.spellcastingTypes.leveled.shortRest;
      return {
        uses, level,
        title: game.i18n.format(`SENTIUS.SpellSlotsN.${plurals.select(level)}`, { n: level }),
        subtitle: game.i18n.localize(`SENTIUS.Abbreviation${isSR ? "SR" : "LR"}`),
        img: CONFIG.SENTIUS.spellcastingTypes.leveled.img.replace("{id}", id)
      };
    }

    // Skills & Tools
    else {
      const data = this.actor.system[`${type}s`]?.[id];
      if ( !data ) return;
      const { total, ability, passive } = data ?? {};
      const subtitle = game.i18n.format("SENTIUS.AbilityPromptTitle", {
        ability: CONFIG.SENTIUS.abilities[ability].label
      });
      let img;
      let title;
      let reference;
      if ( type === "tool" ) {
        reference = Trait.getBaseItemUUID(CONFIG.SENTIUS.toolIds[id]);
        ({ img, name: title } = Trait.getBaseItem(reference, { indexOnly: true }));
      }
      else if ( type === "skill" ) ({ icon: img, label: title, reference } = CONFIG.SENTIUS.skills[id]);
      return { img, title, subtitle, modifier: total, passive, reference };
    }
  }

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /** @inheritDoc */
  canExpand(item) {
    return !["background", "race", "facility"].includes(item.type) && super.canExpand(item);
  }
}