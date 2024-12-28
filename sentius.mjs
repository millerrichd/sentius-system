/**
 * Sentius RPG for Foundry Virtual Tabletop
 * A system set in the future on an different world where tears open and unleash monsters.
 * Author: Richard Miller
 * Software License: MIT
 * Repository: https://github.com/millerrichd/sentius-system
 * Issue Tracker: https://github.com/millerrichd/sentius-system/issues
 */

// Import Configuration
import SENTIUS from "./module/config.mjs";
import { registerSystemKeybindings, registerSystemSettings, registerDeferredSettings } from "./module/settings.mjs";

// Import Submodules
import * as applications from "./module/applications/_module.mjs";
import * as canvas from "./module/canvas/_module.mjs";
import * as dataModels from "./module/data/_module.mjs";
import * as dice from "./module/dice/_module.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as enrichers from "./module/enrichers.mjs";
import * as Filter from "./module/filter.mjs";
import * as migrations from "./module/migration.mjs";
import {default as registry} from "./module/registry.mjs";
import * as utils from "./module/utils.mjs";
import {ModuleArt} from "./module/module-art.mjs";
import registerModuleData from "./module/module-registration.mjs";
import Tooltips5e from "./module/tooltips.mjs";

/* -------------------------------------------- */
/*  Define Module Structure                     */
/* -------------------------------------------- */

globalThis.sentius = {
  applications,
  canvas,
  config: SENTIUS,
  dataModels,
  dice,
  documents,
  enrichers,
  Filter,
  migrations,
  registry,
  utils
};

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", function() {
  globalThis.sentius = game.sentius = Object.assign(game.system, globalThis.sentius);
  console.log(`Initializing the Sentius RPG System - Version ${sentius.version}\n${SENTIUS.ASCII}`);

  // Record Configuration Values
  CONFIG.SENTIUS = SENTIUS;
  CONFIG.ActiveEffect.documentClass = documents.ActiveEffect5e;
  CONFIG.ActiveEffect.legacyTransferral = false;
  CONFIG.Actor.documentClass = documents.ActorSentius;
  CONFIG.ChatMessage.documentClass = documents.ChatMessageSentius;
  CONFIG.Combat.documentClass = documents.CombatSentius;
  CONFIG.Combatant.documentClass = documents.CombatantSentius;
  CONFIG.Item.collection = dataModels.collection.ItemsSentius;
  CONFIG.Item.compendiumIndexFields.push("system.container");
  CONFIG.Item.documentClass = documents.ItemSentius;
  CONFIG.Token.documentClass = documents.TokenDocumentSentius;
  CONFIG.Token.objectClass = canvas.TokenSentius;
  CONFIG.User.documentClass = documents.UserSentius;
  CONFIG.time.roundTime = 6;
  Roll.TOOLTIP_TEMPLATE = "systems/sentius/templates/chat/roll-breakdown.hbs";
  CONFIG.Dice.BasicRoll = dice.BasicRoll;
  CONFIG.Dice.DamageRoll = dice.DamageRoll;
  CONFIG.Dice.D20Die = dice.D20Die;
  CONFIG.Dice.D20Roll = dice.D20Roll;
  CONFIG.MeasuredTemplate.defaults.angle = 53.13; // Sentius cone RAW should be 53.13 degrees
  CONFIG.Note.objectClass = canvas.NoteSentius;
  CONFIG.ui.combat = applications.combat.CombatTrackerSentius;
  CONFIG.ui.items = sentius.applications.item.ItemDirectory5e;

  // Register System Settings
  registerSystemSettings();
  registerSystemKeybindings();

  // Configure module art & register module data
  game.sentius.moduleArt = new ModuleArt();
  registerModuleData();

  // Configure bastions
  game.sentius.bastion = new documents.Bastion();

  // Configure tooltips
  game.sentius.tooltips = new Tooltips5e();

  // Set up status effects
  _configureStatusEffects();

  // Register Roll Extensions
  CONFIG.Dice.rolls = [dice.BasicRoll, dice.D20Roll, dice.DamageRoll];

  // Hook up system data types
  CONFIG.ActiveEffect.dataModels = dataModels.activeEffect.config;
  CONFIG.Actor.dataModels = dataModels.actor.config;
  CONFIG.Item.dataModels = dataModels.item.config;
  CONFIG.JournalEntryPage.dataModels = dataModels.journal.config;

  // Add fonts
  _configureFonts();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("sentius", applications.actor.ActorSheetSentiusCharacter, {
    types: ["character"],
    label: "SENTIUS.SheetClassCharacterLegacy"
  });
  DocumentSheetConfig.registerSheet(Actor, "sentius", applications.actor.ActorSheetSentiusCharacter2, {
    types: ["character"],
    makeDefault: true,
    label: "SENTIUS.SheetClassCharacter"
  });
  Actors.registerSheet("sentius", applications.actor.ActorSheetSentiusNPC, {
    types: ["npc"],
    label: "SENTIUS.SheetClassNPCLegacy"
  });
  DocumentSheetConfig.registerSheet(Actor, "sentius", applications.actor.ActorSheetSentiusNPC2, {
    types: ["npc"],
    makeDefault: true,
    label: "SENTIUS.SheetClassNPC"
  });
  Actors.registerSheet("sentius", applications.actor.ActorSheetSentiusVehicle, {
    types: ["vehicle"],
    makeDefault: true,
    label: "SENTIUS.SheetClassVehicle"
  });
  Actors.registerSheet("sentius", applications.actor.GroupActorSheet, {
    types: ["group"],
    makeDefault: true,
    label: "SENTIUS.SheetClassGroup"
  });

  DocumentSheetConfig.unregisterSheet(Item, "core", ItemSheet);
  DocumentSheetConfig.registerSheet(Item, "sentius", applications.item.ItemSheetSentius2, {
    makeDefault: true,
    label: "SENTIUS.SheetClassItem"
  });
  DocumentSheetConfig.unregisterSheet(Item, "sentius", applications.item.ItemSheetSentius, { types: ["container"] });
  DocumentSheetConfig.unregisterSheet(Item, "sentius", applications.item.ItemSheetSentius2, { types: ["container"] });
  DocumentSheetConfig.registerSheet(Item, "sentius", applications.item.ContainerSheet2, {
    makeDefault: true,
    types: ["container"],
    label: "SENTIUS.SheetClassContainer"
  });

  DocumentSheetConfig.registerSheet(JournalEntry, "sentius", applications.journal.JournalSheetSentius, {
    makeDefault: true,
    label: "SENTIUS.SheetClassJournalEntry"
  });
  DocumentSheetConfig.registerSheet(JournalEntryPage, "sentius", applications.journal.JournalClassPageSheet, {
    label: "SENTIUS.SheetClassClassSummary",
    types: ["class", "subclass"]
  });
  DocumentSheetConfig.registerSheet(JournalEntryPage, "sentius", applications.journal.JournalMapLocationPageSheet, {
    label: "SENTIUS.SheetClassMapLocation",
    types: ["map"]
  });
  DocumentSheetConfig.registerSheet(JournalEntryPage, "sentius", applications.journal.JournalRulePageSheet, {
    label: "SENTIUS.SheetClassRule",
    types: ["rule"]
  });
  DocumentSheetConfig.registerSheet(JournalEntryPage, "sentius", applications.journal.JournalSpellListPageSheet, {
    label: "SENTIUS.SheetClassSpellList",
    types: ["spells"]
  });

  if ( game.release.generation === 12 ) {
    // TODO: Update sheet classes and remove the above check
    CONFIG.Token.prototypeSheetClass = applications.TokenConfigSentius;
    DocumentSheetConfig.unregisterSheet(TokenDocument, "core", TokenConfig);
    DocumentSheetConfig.registerSheet(TokenDocument, "sentius", applications.TokenConfigSentius, {
      label: "SENTIUS.SheetClassToken"
    });
  }

  // Preload Handlebars helpers & partials
  utils.registerHandlebarsHelpers();
  utils.preloadHandlebarsTemplates();

  // Enrichers
  enrichers.registerCustomEnrichers();

  // Exhaustion handling
  documents.ActiveEffect5e.registerHUDListeners();
});

/* -------------------------------------------- */

/**
 * Configure explicit lists of attributes that are trackable on the token HUD and in the combat tracker.
 * @internal
 */
function _configureTrackableAttributes() {
  const common = {
    bar: [],
    value: [
      ...Object.keys(SENTIUS.abilities).map(ability => `abilities.${ability}.value`),
      ...Object.keys(SENTIUS.movementTypes).map(movement => `attributes.movement.${movement}`),
      "attributes.ac.value", "attributes.init.total"
    ]
  };

  const altSpells = Object.entries(SENTIUS.spellPreparationModes).reduce((acc, [k, v]) => {
    if ( !["prepared", "always"].includes(k) && v.upcast ) acc.push(`spells.${k}`);
    return acc;
  }, []);

  const creature = {
    bar: [
      ...common.bar,
      "attributes.hp",
      ...altSpells,
      ...Array.fromRange(Object.keys(SENTIUS.spellLevels).length - 1, 1).map(l => `spells.spell${l}`)
    ],
    value: [
      ...common.value,
      ...Object.keys(SENTIUS.skills).map(skill => `skills.${skill}.passive`),
      ...Object.keys(SENTIUS.senses).map(sense => `attributes.senses.${sense}`),
      "attributes.spelldc"
    ]
  };

  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: [...creature.bar, "resources.primary", "resources.secondary", "resources.tertiary", "details.xp"],
      value: [...creature.value]
    },
    npc: {
      bar: [...creature.bar, "resources.legact", "resources.legres"],
      value: [...creature.value, "details.cr", "details.spellLevel", "details.xp.value"]
    },
    vehicle: {
      bar: [...common.bar, "attributes.hp"],
      value: [...common.value]
    },
    group: {
      bar: [],
      value: []
    }
  };
}

/* -------------------------------------------- */

/**
 * Configure which attributes are available for item consumption.
 * @internal
 */
function _configureConsumableAttributes() {
  const altSpells = Object.entries(SENTIUS.spellPreparationModes).reduce((acc, [k, v]) => {
    if ( !["prepared", "always"].includes(k) && v.upcast ) acc.push(`spells.${k}.value`);
    return acc;
  }, []);

  CONFIG.SENTIUS.consumableResources = [
    ...Object.keys(SENTIUS.abilities).map(ability => `abilities.${ability}.value`),
    "attributes.ac.flat",
    "attributes.hp.value",
    "attributes.exhaustion",
    ...Object.keys(SENTIUS.senses).map(sense => `attributes.senses.${sense}`),
    ...Object.keys(SENTIUS.movementTypes).map(type => `attributes.movement.${type}`),
    ...Object.keys(SENTIUS.currencies).map(denom => `currency.${denom}`),
    "details.xp.value",
    "resources.primary.value", "resources.secondary.value", "resources.tertiary.value",
    "resources.legact.value", "resources.legres.value",
    ...altSpells,
    ...Array.fromRange(Object.keys(SENTIUS.spellLevels).length - 1, 1).map(level => `spells.spell${level}.value`)
  ];
}

/* -------------------------------------------- */

/**
 * Configure additional system fonts.
 */
function _configureFonts() {
  Object.assign(CONFIG.fontDefinitions, {
    Roboto: {
      editor: true,
      fonts: [
        { urls: ["systems/sentius/fonts/roboto/Roboto-Regular.woff2"] },
        { urls: ["systems/sentius/fonts/roboto/Roboto-Bold.woff2"], weight: "bold" },
        { urls: ["systems/sentius/fonts/roboto/Roboto-Italic.woff2"], style: "italic" },
        { urls: ["systems/sentius/fonts/roboto/Roboto-BoldItalic.woff2"], weight: "bold", style: "italic" }
      ]
    },
    "Roboto Condensed": {
      editor: true,
      fonts: [
        { urls: ["systems/sentius/fonts/roboto-condensed/RobotoCondensed-Regular.woff2"] },
        { urls: ["systems/sentius/fonts/roboto-condensed/RobotoCondensed-Bold.woff2"], weight: "bold" },
        { urls: ["systems/sentius/fonts/roboto-condensed/RobotoCondensed-Italic.woff2"], style: "italic" },
        {
          urls: ["systems/sentius/fonts/roboto-condensed/RobotoCondensed-BoldItalic.woff2"], weight: "bold",
          style: "italic"
        }
      ]
    },
    "Roboto Slab": {
      editor: true,
      fonts: [
        { urls: ["systems/sentius/fonts/roboto-slab/RobotoSlab-Regular.ttf"] },
        { urls: ["systems/sentius/fonts/roboto-slab/RobotoSlab-Bold.ttf"], weight: "bold" }
      ]
    }
  });
}

/* -------------------------------------------- */

/**
 * Configure system status effects.
 */
function _configureStatusEffects() {
  const addEffect = (effects, {special, ...data}) => {
    data = foundry.utils.deepClone(data);
    data._id = utils.staticID(`sentius${data.id}`);
    data.img = data.icon ?? data.img;
    delete data.icon;
    effects.push(data);
    if ( special ) CONFIG.specialStatusEffects[special] = data.id;
  };
  CONFIG.statusEffects = Object.entries(CONFIG.SENTIUS.statusEffects).reduce((arr, [id, data]) => {
    const original = CONFIG.statusEffects.find(s => s.id === id);
    addEffect(arr, foundry.utils.mergeObject(original ?? {}, { id, ...data }, { inplace: false }));
    return arr;
  }, []);
  for ( const [id, {label: name, ...data}] of Object.entries(CONFIG.SENTIUS.conditionTypes) ) {
    addEffect(CONFIG.statusEffects, { id, name, ...data });
  }
  for ( const [id, data] of Object.entries(CONFIG.SENTIUS.encumbrance.effects) ) {
    addEffect(CONFIG.statusEffects, { id, ...data, hud: false });
  }
}

/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */

/**
 * Prepare attribute lists.
 */
Hooks.once("setup", function() {
  // Configure trackable & consumable attributes.
  _configureTrackableAttributes();
  _configureConsumableAttributes();

  CONFIG.SENTIUS.trackableAttributes = expandAttributeList(CONFIG.SENTIUS.trackableAttributes);
  game.sentius.moduleArt.registerModuleArt();
  Tooltips5e.activateListeners();
  game.sentius.tooltips.observe();

  // Register settings after modules have had a chance to initialize
  registerDeferredSettings();

  // Apply table of contents compendium style if specified in flags
  game.packs
    .filter(p => p.metadata.flags?.display === "table-of-contents")
    .forEach(p => p.applicationClass = applications.journal.TableOfContentsCompendium);

  // Apply custom item compendium
  game.packs.filter(p => p.metadata.type === "Item")
    .forEach(p => p.applicationClass = applications.item.ItemCompendium5e);

  // Create CSS for currencies
  const style = document.createElement("style");
  const currencies = append => Object.entries(CONFIG.SENTIUS.currencies)
    .map(([key, { icon }]) => `&.${key}${append ?? ""} { background-image: url("${icon}"); }`);
  style.innerHTML = `
    :is(.sentius2, .sentius2-journal) :is(i, span).currency {
      ${currencies().join("\n")}
    }
    .sentius2 .form-group label.label-icon.currency {
      ${currencies("::after").join("\n")}
    }
  `;
  document.head.append(style);
});

/* --------------------------------------------- */

/**
 * Expand a list of attribute paths into an object that can be traversed.
 * @param {string[]} attributes  The initial attributes configuration.
 * @returns {object}  The expanded object structure.
 */
function expandAttributeList(attributes) {
  return attributes.reduce((obj, attr) => {
    foundry.utils.setProperty(obj, attr, true);
    return obj;
  }, {});
}

/* --------------------------------------------- */

/**
 * Perform one-time pre-localization and sorting of some configuration objects
 */
Hooks.once("i18nInit", () => {
  if ( game.settings.get("sentius", "rulesVersion") === "legacy" ) {
    const { translations, _fallback } = game.i18n;
    foundry.utils.mergeObject(translations, {
      "TYPES.Item": {
        race: game.i18n.localize("TYPES.Item.raceLegacy"),
        racePl: game.i18n.localize("TYPES.Item.raceLegacyPl")
      },
      SENTIUS: {
        "Feature.Species": game.i18n.localize("SENTIUS.Feature.SpeciesLegacy"),
        FlagsAlertHint: game.i18n.localize("SENTIUS.FlagsAlertHintLegacy"),
        LanguagesExotic: game.i18n.localize("SENTIUS.LanguagesExoticLegacy"),
        LongRestHint: game.i18n.localize("SENTIUS.LongRestHintLegacy"),
        LongRestHintGroup: game.i18n.localize("SENTIUS.LongRestHintGroupLegacy"),
        "TARGET.Type.Emanation": foundry.utils.mergeObject(
          _fallback.SENTIUS?.TARGET?.Type?.Radius ?? {},
          translations.SENTIUS?.TARGET?.Type?.Radius ?? {},
          { inplace: false }
        ),
        TraitArmorPlural: foundry.utils.mergeObject(
          _fallback.SENTIUS?.TraitArmorLegacyPlural ?? {},
          translations.SENTIUS?.TraitArmorLegacyPlural ?? {},
          { inplace: false }
        ),
        TraitArmorProf: game.i18n.localize("SENTIUS.TraitArmorLegacyProf")
      }
    });
  }
  utils.performPreLocalization(CONFIG.SENTIUS);
  Object.values(CONFIG.SENTIUS.activityTypes).forEach(c => c.documentClass.localize());
});

/* -------------------------------------------- */
/*  Foundry VTT Ready                           */
/* -------------------------------------------- */

/**
 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
 */
Hooks.once("ready", function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if ( ["Item", "ActiveEffect"].includes(data.type) ) {
      documents.macro.create5eMacro(data, slot);
      return false;
    }
  });

  // Register items by type
  sentius.registry.classes.initialize();

  // Chat message listeners
  documents.ChatMessage5e.activateListeners();

  // Bastion initialization
  game.sentius.bastion.initializeUI();

  // Determine whether a system migration is required and feasible
  if ( !game.user.isGM ) return;
  const cv = game.settings.get("sentius", "systemMigrationVersion") || game.world.flags.sentius?.version;
  const totalDocuments = game.actors.size + game.scenes.size + game.items.size;
  if ( !cv && totalDocuments === 0 ) return game.settings.set("sentius", "systemMigrationVersion", game.system.version);
  if ( cv && !foundry.utils.isNewerVersion(game.system.flags.needsMigrationVersion, cv) ) return;

  // Compendium pack folder migration.
  if ( foundry.utils.isNewerVersion("3.0.0", cv) ) {
    migrations.reparentCompendiums("Sentius RPG Content", "Sentius RPG Content");
  }

  // Perform the migration
  if ( cv && foundry.utils.isNewerVersion(game.system.flags.compatibleMigrationVersion, cv) ) {
    ui.notifications.error("MIGRATION.5eVersionTooOldWarning", {localize: true, permanent: true});
  }
  migrations.migrateWorld();
});

/* -------------------------------------------- */
/*  System Styling                              */
/* -------------------------------------------- */

Hooks.on("renderPause", (app, [html]) => {
  html.classList.add("sentius2");
  const img = html.querySelector("img");
  img.src = "systems/sentius/ui/official/ampersand.svg";
  img.className = "";
});

Hooks.on("renderSettings", (app, [html]) => {
  const details = html.querySelector("#game-details");
  const pip = details.querySelector(".system-info .update");
  details.querySelector(".system").remove();

  const heading = document.createElement("div");
  heading.classList.add("sentius2", "sidebar-heading");
  heading.innerHTML = `
    <h2>${game.i18n.localize("WORLD.GameSystem")}</h2>
    <ul class="links">
      <li>
        <a href="https://github.com/millerrichd/sentius-system/releases/latest" target="_blank">
          ${game.i18n.localize("SENTIUS.Notes")}
        </a>
      </li>
      <li>
        <a href="https://github.com/millerrichd/sentius-system/issues" target="_blank">${game.i18n.localize("SENTIUS.Issues")}</a>
      </li>
      <li>
        <a href="https://github.com/millerrichd/sentius-system/wiki" target="_blank">${game.i18n.localize("SENTIUS.Wiki")}</a>
      </li>
      <li>
        <a href="https://discord.com/channels/170995199584108546/670336046164213761" target="_blank">
          ${game.i18n.localize("SENTIUS.Discord")}
        </a>
      </li>
    </ul>
  `;
  details.insertAdjacentElement("afterend", heading);

  const badge = document.createElement("div");
  badge.classList.add("sentius2", "system-badge");
  badge.innerHTML = `
    <img src="systems/sentius/ui/official/sentius-badge-32.webp" data-tooltip="${sentius.title}" alt="${sentius.title}">
    <span class="system-info">${sentius.version}</span>
  `;
  if ( pip ) badge.querySelector(".system-info").insertAdjacentElement("beforeend", pip);
  heading.insertAdjacentElement("afterend", badge);
});

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */

Hooks.on("renderChatPopout", documents.ChatMessage5e.onRenderChatPopout);
Hooks.on("getChatLogEntryContext", documents.ChatMessage5e.addChatMessageContextOptions);

Hooks.on("renderChatLog", (app, html, data) => {
  documents.ItemSentius.chatListeners(html);
  documents.ChatMessageSentius.onRenderChatLog(html);
});
Hooks.on("renderChatPopout", (app, html, data) => documents.ItemSentius.chatListeners(html));

Hooks.on("chatMessage", (app, message, data) => applications.Award.chatMessage(message));

Hooks.on("renderActorDirectory", (app, html, data) => documents.ActorSentius.onRenderActorDirectory(html));
Hooks.on("getActorDirectoryEntryContext", documents.ActorSentius.addDirectoryContextOptions);

Hooks.on("renderCompendiumDirectory", (app, [html], data) => applications.CompendiumBrowser.injectSidebarButton(html));
Hooks.on("getCompendiumEntryContext", documents.ItemSentius.addCompendiumContextOptions);
Hooks.on("getItemDirectoryEntryContext", documents.ItemSentius.addDirectoryContextOptions);

Hooks.on("renderJournalPageSheet", applications.journal.JournalSheetSentius.onRenderJournalPageSheet);

Hooks.on("targetToken", canvas.TokenSentius.onTargetToken);

Hooks.on("preCreateScene", (doc, createData, options, userId) => {
  // Set default grid units based on metric length setting
  const units = utils.defaultUnits("length");
  if ( (units !== sentius.grid.units) && !foundry.utils.getProperty(createData, "grid.distance")
    && !foundry.utils.getProperty(createData, "grid.units") ) {
    const C = CONFIG.SENTIUS.movementUnits;
    doc.updateSource({
      grid: {
        // TODO: Replace with `convertLength` method once added
        distance: sentius.grid.distance * (C[sentius.grid.units]?.conversion ?? 1) / (C[units]?.conversion ?? 1), units
      }
    });
  }
});

// TODO: Generalize this logic and make it available in the re-designed transform application.
Hooks.on("sentius.transformActor", (subject, target, d, options) => {
  const isLegacy = game.settings.get("sentius", "rulesVersion") === "legacy";
  if ( (options.preset !== "wildshape") || !subject.classes?.druid || isLegacy ) return;
  let temp = subject.classes.druid.system.levels;
  if ( subject.classes.druid.subclass?.identifier === "moon" ) temp *= 3;
  d.system.attributes.hp.temp = temp;
});

/* -------------------------------------------- */
/*  Bundled Module Exports                      */
/* -------------------------------------------- */

export {
  applications,
  canvas,
  dataModels,
  dice,
  documents,
  enrichers,
  Filter,
  migrations,
  registry,
  utils,
  SENTIUS
};
