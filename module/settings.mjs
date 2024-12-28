import BastionSettingsConfig, { BastionSetting } from "./applications/settings/bastion-settings.mjs";
import CompendiumBrowserSettingsConfig from "./applications/settings/compendium-browser-settings.mjs";
import ModuleArtSettingsConfig from "./applications/settings/module-art-settings.mjs";
import VisibilitySettingsConfig from "./applications/settings/visibility-settings.mjs";

/**
 * Register all of the system's keybindings.
 */
export function registerSystemKeybindings() {
  game.keybindings.register("sentius", "skipDialogNormal", {
    name: "KEYBINDINGS.SENTIUS.SkipDialogNormal",
    editable: [{ key: "ShiftLeft" }, { key: "ShiftRight" }]
  });

  game.keybindings.register("sentius", "skipDialogAdvantage", {
    name: "KEYBINDINGS.SENTIUS.SkipDialogAdvantage",
    editable: [{ key: "AltLeft" }, { key: "AltRight" }]
  });

  game.keybindings.register("sentius", "skipDialogDisadvantage", {
    name: "KEYBINDINGS.SENTIUS.SkipDialogDisadvantage",
    editable: [{ key: "ControlLeft" }, { key: "ControlRight" }, { key: "OsLeft" }, { key: "OsRight" }]
  });
}

/* -------------------------------------------- */

/**
 * Register all of the system's settings.
 */
export function registerSystemSettings() {
  // Internal System Migration Version
  game.settings.register("sentius", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  game.settings.register("sentius", "challengeVisibility", {
    name: "SETTINGS.SENTIUS.VISIBILITY.CHALLENGE.Name",
    hint: "SETTINGS.SENTIUS.VISIBILITY.CHALLENGE.Hint",
    scope: "world",
    config: false,
    default: "player",
    type: String,
    choices: {
      all: "SETTINGS.SENTIUS.VISIBILITY.CHALLENGE.All",
      player: "SETTINGS.SENTIUS.VISIBILITY.CHALLENGE.Player",
      none: "SETTINGS.SENTIUS.VISIBILITY.CHALLENGE.None"
    }
  });

  game.settings.register("sentius", "attackRollVisibility", {
    name: "SETTINGS.SENTIUS.VISIBILITY.ATTACK.Name",
    hint: "SETTINGS.SENTIUS.VISIBILITY.ATTACK.Hint",
    scope: "world",
    config: false,
    default: "none",
    type: String,
    choices: {
      all: "SETTINGS.SENTIUS.VISIBILITY.ATTACK.All",
      hideAC: "SETTINGS.SENTIUS.VISIBILITY.ATTACK.HideAC",
      none: "SETTINGS.SENTIUS.VISIBILITY.ATTACK.None"
    }
  });

  game.settings.register("sentius", "bloodied", {
    name: "SETTINGS.SENTIUS.BLOODIED.Name",
    hint: "SETTINGS.SENTIUS.BLOODIED.Hint",
    scope: "world",
    config: false,
    default: "player",
    type: String,
    choices: {
      all: "SETTINGS.SENTIUS.BLOODIED.All",
      player: "SETTINGS.SENTIUS.BLOODIED.Player",
      none: "SETTINGS.SENTIUS.BLOODIED.None"
    }
  });

  // Encumbrance tracking
  game.settings.register("sentius", "encumbrance", {
    name: "SETTINGS.5eEncumbrance.Name",
    hint: "SETTINGS.5eEncumbrance.Hint",
    scope: "world",
    config: true,
    default: "none",
    type: String,
    choices: {
      none: "SETTINGS.5eEncumbrance.None",
      normal: "SETTINGS.5eEncumbrance.Normal",
      variant: "SETTINGS.5eEncumbrance.Variant"
    }
  });

  // Rules version
  game.settings.register("sentius", "rulesVersion", {
    name: "SETTINGS.SENTIUS.RULESVERSION.Name",
    hint: "SETTINGS.SENTIUS.RULESVERSION.Hint",
    scope: "world",
    config: true,
    default: "modern",
    type: String,
    choices: {
      modern: "SETTINGS.SENTIUS.RULESVERSION.Modern",
      legacy: "SETTINGS.SENTIUS.RULESVERSION.Legacy"
    },
    requiresReload: true
  });

  // Rest Recovery Rules
  game.settings.register("sentius", "restVariant", {
    name: "SETTINGS.5eRestN",
    hint: "SETTINGS.5eRestL",
    scope: "world",
    config: true,
    default: "normal",
    type: String,
    choices: {
      normal: "SETTINGS.5eRestPHB",
      gritty: "SETTINGS.5eRestGritty",
      epic: "SETTINGS.5eRestEpic"
    }
  });

  // Diagonal Movement Rule
  if ( game.release.generation < 12 ) {
    game.settings.register("sentius", "diagonalMovement", {
      name: "SETTINGS.5eDiagN",
      hint: "SETTINGS.5eDiagL",
      scope: "world",
      config: true,
      default: "555",
      type: String,
      choices: {
        555: "SETTINGS.5eDiagPHB",
        5105: "SETTINGS.5eDiagDMG",
        EUCL: "SETTINGS.5eDiagEuclidean"
      },
      onChange: rule => canvas.grid.diagonalRule = rule
    });
  }

  // Allow rotating square templates
  game.settings.register("sentius", "gridAlignedSquareTemplates", {
    name: "SETTINGS.5eGridAlignedSquareTemplatesN",
    hint: "SETTINGS.5eGridAlignedSquareTemplatesL",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  // Proficiency modifier type
  game.settings.register("sentius", "proficiencyModifier", {
    name: "SETTINGS.5eProfN",
    hint: "SETTINGS.5eProfL",
    scope: "world",
    config: true,
    default: "bonus",
    type: String,
    choices: {
      bonus: "SETTINGS.5eProfBonus",
      dice: "SETTINGS.5eProfDice"
    }
  });

  // Allow feats during Ability Score Improvements
  game.settings.register("sentius", "allowFeats", {
    name: "SETTINGS.5eFeatsN",
    hint: "SETTINGS.5eFeatsL",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  // Use Honor ability score
  game.settings.register("sentius", "honorScore", {
    name: "SETTINGS.5eHonorN",
    hint: "SETTINGS.5eHonorL",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: true
  });

  // Use Sanity ability score
  game.settings.register("sentius", "sanityScore", {
    name: "SETTINGS.5eSanityN",
    hint: "SETTINGS.5eSanityL",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: true
  });

  // Apply Dexterity as Initiative Tiebreaker
  game.settings.register("sentius", "initiativeDexTiebreaker", {
    name: "SETTINGS.5eInitTBN",
    hint: "SETTINGS.5eInitTBL",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Use initiative scores for NPCs
  game.settings.register("sentius", "initiativeScore", {
    name: "SETTINGS.SENTIUS.INITIATIVESCORE.Name",
    hint: "SETTINGS.SENTIUS.INITIATIVESCORE.Hint",
    scope: "world",
    config: true,
    default: "none",
    type: String,
    choices: {
      none: "SETTINGS.SENTIUS.INITIATIVESCORE.None",
      npcs: "SETTINGS.SENTIUS.INITIATIVESCORE.NPCs",
      all: "SETTINGS.SENTIUS.INITIATIVESCORE.All"
    }
  });

  // Record Currency Weight
  game.settings.register("sentius", "currencyWeight", {
    name: "SETTINGS.5eCurWtN",
    hint: "SETTINGS.5eCurWtL",
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });

  // Leveling Mode
  game.settings.register("sentius", "levelingMode", {
    name: "SETTINGS.SENTIUS.LEVELING.Name",
    hint: "SETTINGS.SENTIUS.LEVELING.Hint",
    scope: "world",
    config: true,
    default: "xpBoons",
    choices: {
      noxp: "SETTINGS.SENTIUS.LEVELING.NoXP",
      xp: "SETTINGS.SENTIUS.LEVELING.XP",
      xpBoons: "SETTINGS.SENTIUS.LEVELING.XPBoons"
    }
  });

  // Disable Advancements
  game.settings.register("sentius", "disableAdvancements", {
    name: "SETTINGS.5eNoAdvancementsN",
    hint: "SETTINGS.5eNoAdvancementsL",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Disable Concentration Tracking
  game.settings.register("sentius", "disableConcentration", {
    name: "SETTINGS.5eNoConcentrationN",
    hint: "SETTINGS.5eNoConcentrationL",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Collapse Item Cards (by default)
  game.settings.register("sentius", "autoCollapseItemCards", {
    name: "SETTINGS.5eAutoCollapseCardN",
    hint: "SETTINGS.5eAutoCollapseCardL",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    onChange: s => {
      ui.chat.render();
    }
  });

  // Collapse Chat Card Trays
  game.settings.register("sentius", "autoCollapseChatTrays", {
    name: "SETTINGS.SENTIUS.COLLAPSETRAYS.Name",
    hint: "SETTINGS.SENTIUS.COLLAPSETRAYS.Hint",
    scope: "client",
    config: true,
    default: "older",
    type: String,
    choices: {
      never: "SETTINGS.SENTIUS.COLLAPSETRAYS.Never",
      older: "SETTINGS.SENTIUS.COLLAPSETRAYS.Older",
      always: "SETTINGS.SENTIUS.COLLAPSETRAYS.Always"
    }
  });

  // Allow Polymorphing
  game.settings.register("sentius", "allowPolymorphing", {
    name: "SETTINGS.5eAllowPolymorphingN",
    hint: "SETTINGS.5eAllowPolymorphingL",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Polymorph Settings
  game.settings.register("sentius", "polymorphSettings", {
    scope: "client",
    default: {
      keepPhysical: false,
      keepMental: false,
      keepSaves: false,
      keepSkills: false,
      mergeSaves: false,
      mergeSkills: false,
      keepClass: false,
      keepFeats: false,
      keepSpells: false,
      keepItems: false,
      keepBio: false,
      keepVision: true,
      keepSelf: false,
      keepAE: false,
      keepOriginAE: true,
      keepOtherOriginAE: true,
      keepFeatAE: true,
      keepSpellAE: true,
      keepEquipmentAE: true,
      keepClassAE: true,
      keepBackgroundAE: true,
      transformTokens: true
    }
  });

  // Allow Summoning
  game.settings.register("sentius", "allowSummoning", {
    name: "SETTINGS.SENTIUS.ALLOWSUMMONING.Name",
    hint: "SETTINGS.SENTIUS.ALLOWSUMMONING.Hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Metric Length Weights
  game.settings.register("sentius", "metricLengthUnits", {
    name: "SETTINGS.SENTIUS.METRIC.LengthUnits.Name",
    hint: "SETTINGS.SENTIUS.METRIC.LengthUnits.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // Metric Unit Weights
  game.settings.register("sentius", "metricWeightUnits", {
    name: "SETTINGS.SENTIUS.METRIC.WeightUnits.Name",
    hint: "SETTINGS.SENTIUS.METRIC.WeightUnits.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // Critical Damage Modifiers
  game.settings.register("sentius", "criticalDamageModifiers", {
    name: "SETTINGS.5eCriticalModifiersN",
    hint: "SETTINGS.5eCriticalModifiersL",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // Critical Damage Maximize
  game.settings.register("sentius", "criticalDamageMaxDice", {
    name: "SETTINGS.5eCriticalMaxDiceN",
    hint: "SETTINGS.5eCriticalMaxDiceL",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // Strict validation
  game.settings.register("sentius", "strictValidation", {
    scope: "world",
    config: false,
    type: Boolean,
    default: true
  });

  // Dynamic art.
  game.settings.registerMenu("sentius", "moduleArtConfiguration", {
    name: "SENTIUS.ModuleArtConfigN",
    label: "SENTIUS.ModuleArtConfigL",
    hint: "SENTIUS.ModuleArtConfigH",
    icon: "fa-solid fa-palette",
    type: ModuleArtSettingsConfig,
    restricted: true
  });

  game.settings.register("sentius", "moduleArtConfiguration", {
    name: "Module Art Configuration",
    scope: "world",
    config: false,
    type: Object,
    default: {
      sentius: {
        portraits: true,
        tokens: true
      }
    }
  });

  // Compendium Browser source exclusion
  game.settings.registerMenu("sentius", "packSourceConfiguration", {
    name: "SENTIUS.CompendiumBrowser.Sources.Name",
    label: "SENTIUS.CompendiumBrowser.Sources.Label",
    hint: "SENTIUS.CompendiumBrowser.Sources.Hint",
    icon: "fas fa-book-open-reader",
    type: CompendiumBrowserSettingsConfig,
    restricted: true
  });

  game.settings.register("sentius", "packSourceConfiguration", {
    name: "Pack Source Configuration",
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  // Bastions
  game.settings.registerMenu("sentius", "bastionConfiguration", {
    name: "SENTIUS.Bastion.Configuration.Name",
    label: "SENTIUS.Bastion.Configuration.Label",
    hint: "SENTIUS.Bastion.Configuration.Hint",
    icon: "fas fa-chess-rook",
    type: BastionSettingsConfig,
    restricted: true
  });

  game.settings.register("sentius", "bastionConfiguration", {
    name: "Bastion Configuration",
    scope: "world",
    config: false,
    type: BastionSetting,
    default: {
      button: false,
      enabled: false,
      duration: 7
    },
    onChange: () => game.sentius.bastion.initializeUI()
  });

  // Visibility Settings
  game.settings.registerMenu("sentius", "visibilityConfiguration", {
    name: "SETTINGS.SENTIUS.VISIBILITY.Name",
    label: "SETTINGS.SENTIUS.VISIBILITY.Label",
    hint: "SETTINGS.SENTIUS.VISIBILITY.Hint",
    icon: "fas fa-eye",
    type: VisibilitySettingsConfig,
    restricted: true
  });

  game.settings.register("sentius", "concealItemDescriptions", {
    name: "SETTINGS.SENTIUS.VISIBILITY.ITEMDESCRIPTIONS.Name",
    hint: "SETTINGS.SENTIUS.VISIBILITY.ITEMDESCRIPTIONS.Hint",
    scope: "world",
    config: false,
    default: false,
    type: Boolean
  });

  // Primary Group
  game.settings.register("sentius", "primaryParty", {
    name: "Primary Party",
    scope: "world",
    config: false,
    default: null,
    type: PrimaryPartyData,
    onChange: s => ui.actors.render()
  });

  // Control hints
  game.settings.register("sentius", "controlHints", {
    name: "SENTIUS.Controls.Name",
    hint: "SENTIUS.Controls.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });

  // NPC sheet default skills
  game.settings.register("sentius", "defaultSkills", {
    name: "SETTINGS.SENTIUS.DEFAULTSKILLS.Name",
    hint: "SETTINGS.SENTIUS.DEFAULTSKILLS.Hint",
    type: new foundry.data.fields.SetField(
      new foundry.data.fields.StringField({
        choices: () => CONFIG.SENTIUS.skills
      })
    ),
    default: [],
    config: true
  });
}

/**
 * Data model for tracking information on the primary party.
 *
 * @property {Actor5e} actor  Group actor representing the primary party.
 */
class PrimaryPartyData extends foundry.abstract.DataModel {
  static defineSchema() {
    return { actor: new foundry.data.fields.ForeignDocumentField(foundry.documents.BaseActor) };
  }
}

/* -------------------------------------------- */

/**
 * Register additional settings after modules have had a chance to initialize to give them a chance to modify choices.
 */
export function registerDeferredSettings() {
  game.settings.register("sentius", "theme", {
    name: "SETTINGS.SENTIUS.THEME.Name",
    hint: "SETTINGS.SENTIUS.THEME.Hint",
    scope: "client",
    config: false,
    default: "",
    type: String,
    choices: {
      "": "SHEETS.SENTIUS.THEME.Automatic",
      ...CONFIG.SENTIUS.themes
    },
    onChange: s => setTheme(document.body, s)
  });

  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    setTheme(document.body, game.settings.get("sentius", "theme"));
  });
  matchMedia("(prefers-contrast: more)").addEventListener("change", () => {
    setTheme(document.body, game.settings.get("sentius", "theme"));
  });

  // Hook into core color scheme setting.
  const isV13 = game.release.generation >= 13;
  const settingKey = isV13 ? "uiConfig" : "colorScheme";
  const setting = game.settings.get("core", settingKey);
  const settingConfig = game.settings.settings.get(`core.${settingKey}`);
  const { onChange } = settingConfig ?? {};
  if ( onChange ) settingConfig.onChange = (s, ...args) => {
    onChange(s, ...args);
    setTheme(document.body, isV13 ? s.colorScheme : s);
  };
  setTheme(document.body, isV13 ? setting.colorScheme : setting);
}

/* -------------------------------------------- */

/**
 * Set the theme on an element, removing the previous theme class in the process.
 * @param {HTMLElement} element     Body or sheet element on which to set the theme data.
 * @param {string} [theme=""]       Theme key to set.
 * @param {Set<string>} [flags=[]]  Additional theming flags to set.
 */
export function setTheme(element, theme="", flags=new Set()) {
  element.className = element.className.replace(/\bsentius-(theme|flag)-[\w-]+\b/g, "");

  // Primary Theme
  if ( !theme && (element === document.body) ) {
    if ( matchMedia("(prefers-color-scheme: dark)").matches ) theme = "dark";
    if ( matchMedia("(prefers-color-scheme: light)").matches ) theme = "light";
  }
  if ( theme ) {
    element.classList.add(`sentius-theme-${theme.slugify()}`);
    element.dataset.theme = theme;
  }
  else delete element.dataset.theme;

  // Additional Flags
  if ( (element === document.body) && matchMedia("(prefers-contrast: more)").matches ) flags.add("high-contrast");
  for ( const flag of flags ) element.classList.add(`sentius-flag-${flag.slugify()}`);
  element.dataset.themeFlags = Array.from(flags).join(" ");
}
