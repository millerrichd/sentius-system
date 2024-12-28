/* -------------------------------------------- */
/*  Formatters                                  */
/* -------------------------------------------- */

/**
 * Format a Challenge Rating using the proper fractional symbols.
 * @param {number} value                   CR value to format.
 * @param {object} [options={}]
 * @param {boolean} [options.narrow=true]  Use narrow fractions (e.g. ⅛) rather than wide ones (e.g. 1/8).
 * @returns {string}
 */
export function formatCR(value, { narrow=true }={}) {
  if ( value === null ) return "—";
  const fractions = narrow ? { 0.125: "⅛", 0.25: "¼", 0.5: "½" } : { 0.125: "1/8", 0.25: "1/4", 0.5: "1/2" };
  return fractions[value] ?? formatNumber(value);
}

/* -------------------------------------------- */

/**
 * Form a number using the provided distance unit.
 * @param {number} value         The distance to format.
 * @param {string} unit          Distance unit as defined in `CONFIG.SENTIUS.movementUnits`.
 * @param {object} [options={}]  Formatting options passed to `formatNumber`.
 * @returns {string}
 */
export function formatDistance(value, unit, options={}) {
  return _formatSystemUnits(value, unit, CONFIG.SENTIUS.movementUnits[unit], options);
}

/* -------------------------------------------- */

/**
 * Format a modifier for display with its sign separate.
 * @param {number} mod  The modifier.
 * @returns {Handlebars.SafeString}
 */
export function formatModifier(mod) {
  if ( !Number.isFinite(mod) ) return new Handlebars.SafeString("—");
  return new Handlebars.SafeString(`<span class="sign">${mod < 0 ? "-" : "+"}</span>${Math.abs(mod)}`);
}

/* -------------------------------------------- */

/**
 * A helper for using Intl.NumberFormat within handlebars.
 * @param {number} value    The value to format.
 * @param {object} options  Options forwarded to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat}
 * @param {boolean} [options.numerals]  Format the number as roman numerals.
 * @param {boolean} [options.words]     Write out number as full word, if possible.
 * @returns {string}
 */
export function formatNumber(value, { numerals, words, ...options }={}) {
  if ( words && game.i18n.has(`SENTIUS.NUMBER.${value}`, false) ) return game.i18n.localize(`SENTIUS.NUMBER.${value}`);
  if ( numerals ) return _formatNumberAsNumerals(value);
  const formatter = new Intl.NumberFormat(game.i18n.lang, options);
  return formatter.format(value);
}

/**
 * Roman numerals.
 * @type {Record<string, number>}
 */
const _roman = {
  M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1
};

/**
 * Format a number as roman numerals.
 * @param {number} n  The number to format.
 * @returns {string}
 */
function _formatNumberAsNumerals(n) {
  let out = "";
  if ( (n < 1) || !Number.isInteger(n) ) return out;
  for ( const [numeral, decimal] of Object.entries(_roman) ) {
    const quotient = Math.floor(n / decimal);
    n -= quotient * decimal;
    out += numeral.repeat(quotient);
  }
  return out;
}

/* -------------------------------------------- */

/**
 * Produce a number with the parts wrapped in their own spans.
 * @param {number} value      A number for format.
 * @param {object} [options]  Formatting options.
 * @returns {string}
 */
export function formatNumberParts(value, options) {
  if ( options.numerals ) throw new Error("Cannot segment numbers when formatted as numerals.");
  return new Intl.NumberFormat(game.i18n.lang, options).formatToParts(value)
    .reduce((str, { type, value }) => `${str}<span class="${type}">${value}</span>`, "");
}

/* -------------------------------------------- */

/**
 * A helper for using Intl.NumberFormat within handlebars for format a range.
 * @param {number} min      The lower end of the range.
 * @param {number} max      The upper end of the range.
 * @param {object} options  Options forwarded to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat}
 * @returns {string}
 */
export function formatRange(min, max, options) {
  const formatter = new Intl.NumberFormat(game.i18n.lang, options);
  return formatter.formatRange(min, max);
}

/* -------------------------------------------- */

/**
 * A helper function to format textarea text to HTML with linebreaks.
 * @param {string} value  The text to format.
 * @returns {Handlebars.SafeString}
 */
export function formatText(value) {
  return new Handlebars.SafeString(value?.replaceAll("\n", "<br>") ?? "");
}

/* -------------------------------------------- */

/**
 * Form a number using the provided weight unit.
 * @param {number} value         The weight to format.
 * @param {string} unit          Weight unit as defined in `CONFIG.SENTIUS.weightUnits`.
 * @param {object} [options={}]  Formatting options passed to `formatNumber`.
 * @returns {string}
 */
export function formatWeight(value, unit, options={}) {
  return _formatSystemUnits(value, unit, CONFIG.SENTIUS.weightUnits[unit], options);
}

/* -------------------------------------------- */

/**
 * Format a number using one of core's built-in unit types.
 * @param {number} value                   Value to display.
 * @param {string} unit                    Name of the unit to use.
 * @param {UnitConfiguration} config       Configuration data for the unit.
 * @param {object} [options={}]            Formatting options passed to `formatNumber`.
 * @param {boolean} [options.parts=false]  Format to parts.
 * @returns {string}
 */
function _formatSystemUnits(value, unit, config, { parts=false, ...options }={}) {
  options.unitDisplay ??= "short";
  if ( config?.counted ) {
    const localizationKey = `${config.counted}.${options.unitDisplay}.${getPluralRules().select(value)}`;
    return game.i18n.format(localizationKey, { number: formatNumber(value, options) });
  }
  unit = config?.formattingUnit ?? unit;
  if ( isValidUnit(unit) ) {
    options.style ??= "unit";
    options.unit ??= unit;
  }
  return (parts ? formatNumberParts : formatNumber)(value, options);
}

/* -------------------------------------------- */

/**
 * Cached store of Intl.PluralRules instances.
 * @type {Record<string, Intl.PluralRules>}
 */
const _pluralRules = {};

/**
 * Get a PluralRules object, fetching from cache if possible.
 * @param {object} [options={}]
 * @param {string} [options.type=cardinal]
 * @returns {Intl.PluralRules}
 */
export function getPluralRules({ type="cardinal" }={}) {
  _pluralRules[type] ??= new Intl.PluralRules(game.i18n.lang, { type });
  return _pluralRules[type];
}

/* -------------------------------------------- */
/*  Formulas                                    */
/* -------------------------------------------- */

/**
 * Return whether a string is a valid reroll, explosion, min, or max dice modifier.
 * @param {string} mod      The modifier to test.
 * @returns {boolean}
 */
export function isValidDieModifier(mod) {
  const regex = {
    reroll: /rr?([0-9]+)?([<>=]+)?([0-9]+)?/i,
    explode: /xo?([0-9]+)?([<>=]+)?([0-9]+)?/i,
    minimum: /(?:min)([0-9]+)/i,
    maximum: /(?:max)([0-9]+)/i,
    dropKeep: /[dk]([hl])?([0-9]+)?/i,
    count: /(?:c[sf])([<>=]+)?([0-9]+)?/i
  };
  return Object.values(regex).some(rgx => rgx.test(mod));
}

/* -------------------------------------------- */

/**
 * Handle a delta input for a number value from a form.
 * @param {HTMLInputElement} input  Input that contains the modified value.
 * @param {Document} target         Target document to be updated.
 * @returns {number|void}
 */
export function parseInputDelta(input, target) {
  let value = input.value;
  if ( ["+", "-"].includes(value[0]) ) {
    const delta = parseFloat(value);
    value = Number(foundry.utils.getProperty(target, input.dataset.name ?? input.name)) + delta;
  }
  else if ( value[0] === "=" ) value = Number(value.slice(1));
  if ( Number.isNaN(value) ) return;
  input.value = value;
  return value;
}

/* -------------------------------------------- */

/**
 * Prepare the final formula value for a model field.
 * @param {ItemDataModel|BaseActivityData} model  Model for which the value is being prepared.
 * @param {string} keyPath                        Path to the field within the model.
 * @param {string} label                          Label to use in preparation warnings.
 * @param {object} rollData                       Roll data to use when replacing formula values.
 */
export function prepareFormulaValue(model, keyPath, label, rollData) {
  const value = foundry.utils.getProperty(model, keyPath);
  if ( !value ) return;
  const item = model.item ?? model.parent;
  const property = game.i18n.localize(label);
  try {
    const formula = replaceFormulaData(value, rollData, { item, property });
    const roll = new Roll(formula);
    foundry.utils.setProperty(model, keyPath, roll.evaluateSync().total);
  } catch(err) {
    if ( item.isEmbedded ) {
      const message = game.i18n.format("SENTIUS.FormulaMalformedError", { property, name: model.name ?? item.name });
      item.actor._preparationWarnings.push({ message, link: item.uuid, type: "error" });
      console.error(message, err);
    }
  }
}

/* -------------------------------------------- */

/**
 * Replace referenced data attributes in the roll formula with values from the provided data.
 * If the attribute is not found in the provided data, display a warning on the actor.
 * @param {string} formula           The original formula within which to replace.
 * @param {object} data              The data object which provides replacements.
 * @param {object} [options={}]
 * @param {Actor5e} [options.actor]            Actor for which the value is being prepared.
 * @param {Item5e} [options.item]              Item for which the value is being prepared.
 * @param {string|null} [options.missing="0"]  Value to use when replacing missing references, or `null` to not replace.
 * @param {string} [options.property]          Name of the property to which this formula belongs.
 * @returns {string}                 Formula with replaced data.
 */
export function replaceFormulaData(formula, data, { actor, item, missing="0", property }={}) {
  const dataRgx = new RegExp(/@([a-z.0-9_-]+)/gi);
  const missingReferences = new Set();
  formula = String(formula).replace(dataRgx, (match, term) => {
    let value = foundry.utils.getProperty(data, term);
    if ( value == null ) {
      missingReferences.add(match);
      return missing ?? match[0];
    }
    return String(value).trim();
  });
  actor ??= item?.parent;
  if ( (missingReferences.size > 0) && actor && property ) {
    const listFormatter = new Intl.ListFormat(game.i18n.lang, { style: "long", type: "conjunction" });
    const message = game.i18n.format("SENTIUS.FormulaMissingReferenceWarn", {
      property, name: item?.name ?? actor.name, references: listFormatter.format(missingReferences)
    });
    actor._preparationWarnings.push({ message, link: item?.uuid ?? actor.uuid, type: "warning" });
  }
  return formula;
}

/* -------------------------------------------- */

/**
 * Convert a bonus value to a simple integer for displaying on the sheet.
 * @param {number|string|null} bonus  Bonus formula.
 * @param {object} [data={}]          Data to use for replacing @ strings.
 * @returns {number}                  Simplified bonus as an integer.
 * @protected
 */
export function simplifyBonus(bonus, data={}) {
  if ( !bonus ) return 0;
  if ( Number.isNumeric(bonus) ) return Number(bonus);
  try {
    const roll = new Roll(bonus, data);
    return roll.isDeterministic ? roll.evaluateSync().total : 0;
  } catch(error) {
    console.error(error);
    return 0;
  }
}

/* -------------------------------------------- */
/*  IDs                                         */
/* -------------------------------------------- */

/**
 * Create an ID from the input truncating or padding the value to make it reach 16 characters.
 * @param {string} id
 * @returns {string}
 */
export function staticID(id) {
  if ( id.length >= 16 ) return id.substring(0, 16);
  return id.padEnd(16, "0");
}

/* -------------------------------------------- */
/*  Keybindings Helper                          */
/* -------------------------------------------- */

/**
 * Based on the provided event, determine if the keys are pressed to fulfill the specified keybinding.
 * @param {Event} event    Triggering event.
 * @param {string} action  Keybinding action within the `sentius` namespace.
 * @returns {boolean}      Is the keybinding triggered?
 */
export function areKeysPressed(event, action) {
  if ( !event ) return false;
  const activeModifiers = {};
  const addModifiers = (key, pressed) => {
    activeModifiers[key] = pressed;
    KeyboardManager.MODIFIER_CODES[key].forEach(n => activeModifiers[n] = pressed);
  };
  addModifiers(KeyboardManager.MODIFIER_KEYS.CONTROL, event.ctrlKey || event.metaKey);
  addModifiers(KeyboardManager.MODIFIER_KEYS.SHIFT, event.shiftKey);
  addModifiers(KeyboardManager.MODIFIER_KEYS.ALT, event.altKey);
  return game.keybindings.get("sentius", action).some(b => {
    if ( game.keyboard.downKeys.has(b.key) && b.modifiers.every(m => activeModifiers[m]) ) return true;
    if ( b.modifiers.length ) return false;
    return activeModifiers[b.key];
  });
}

/* -------------------------------------------- */
/*  Object Helpers                              */
/* -------------------------------------------- */

/**
 * Transform an object, returning only the keys which match the provided filter.
 * @param {object} obj         Object to transform.
 * @param {Function} [filter]  Filtering function. If none is provided, it will just check for truthiness.
 * @returns {string[]}         Array of filtered keys.
 */
export function filteredKeys(obj, filter) {
  filter ??= e => e;
  return Object.entries(obj).filter(e => filter(e[1])).map(e => e[0]);
}

/* -------------------------------------------- */

/**
 * Check whether an object exists without transversing any getters, preventing any deprecation warnings from triggering.
 * @param {object} object
 * @param {string} keyPath
 * @returns {boolean}
 */
export function safePropertyExists(object, keyPath) {
  const parts = keyPath.split(".");
  for ( const part of parts ) {
    const descriptor = Object.getOwnPropertyDescriptor(object, part);
    if ( !descriptor || !("value" in descriptor) ) return false;
    object = object[part];
  }
  return true;
}

/* -------------------------------------------- */

/**
 * Sort the provided object by its values or by an inner sortKey.
 * @param {object} obj                 The object to sort.
 * @param {string|Function} [sortKey]  An inner key upon which to sort or sorting function.
 * @returns {object}                   A copy of the original object that has been sorted.
 */
export function sortObjectEntries(obj, sortKey) {
  let sorted = Object.entries(obj);
  const sort = (lhs, rhs) => foundry.utils.getType(lhs) === "string" ? lhs.localeCompare(rhs, game.i18n.lang) : lhs - rhs;
  if ( foundry.utils.getType(sortKey) === "function" ) sorted = sorted.sort((lhs, rhs) => sortKey(lhs[1], rhs[1]));
  else if ( sortKey ) sorted = sorted.sort((lhs, rhs) => sort(lhs[1][sortKey], rhs[1][sortKey]));
  else sorted = sorted.sort((lhs, rhs) => sort(lhs[1], rhs[1]));
  return Object.fromEntries(sorted);
}

/* -------------------------------------------- */

/**
 * Retrieve the indexed data for a Document using its UUID. Will never return a result for embedded documents.
 * @param {string} uuid  The UUID of the Document index to retrieve.
 * @returns {object}     Document's index if one could be found.
 */
export function indexFromUuid(uuid) {
  const parts = uuid.split(".");
  let index;

  // Compendium Documents
  if ( parts[0] === "Compendium" ) {
    const [, scope, packName, id] = parts;
    const pack = game.packs.get(`${scope}.${packName}`);
    index = pack?.index.get(id);
  }

  // World Documents
  else if ( parts.length < 3 ) {
    const [docName, id] = parts;
    const collection = CONFIG[docName].collection.instance;
    index = collection.get(id);
  }

  return index || null;
}

/* -------------------------------------------- */

/**
 * Creates an HTML document link for the provided UUID.
 * Try to build links to compendium content synchronously to avoid DB lookups.
 * @param {string} uuid                    UUID for which to produce the link.
 * @param {object} [options]
 * @param {string} [options.tooltip]       Tooltip to add to the link.
 * @param {string} [options.renderBroken]  If a UUID cannot found, render it as a broken link instead of returning the
 *                                         empty string.
 * @returns {string}                       Link to the item or empty string if item wasn't found.
 */
export function linkForUuid(uuid, { tooltip, renderBroken }={}) {
  let doc = fromUuidSync(uuid);
  if ( !doc ) {
    if ( renderBroken ) return `
      <a class="content-link broken" data-uuid="${uuid}">
        <i class="fas fa-unlink"></i> ${game.i18n.localize("Unknown")}
      </a>
    `;
    return "";
  }
  if ( uuid.startsWith("Compendium.") && !(doc instanceof foundry.abstract.Document) ) {
    const {collection} = foundry.utils.parseUuid(uuid);
    const cls = collection.documentClass;
    // Minimal "shell" of a document using index data
    doc = new cls(foundry.utils.deepClone(doc), {pack: collection.metadata.id});
  }
  const a = doc.toAnchor();
  if ( tooltip ) a.dataset.tooltip = tooltip;
  return a.outerHTML;
}

/* -------------------------------------------- */
/*  Targeting                                   */
/* -------------------------------------------- */

/**
 * Important information on a targeted token.
 *
 * @typedef {object} TargetDescriptor5e
 * @property {string} uuid  The UUID of the target.
 * @property {string} img   The target's image.
 * @property {string} name  The target's name.
 * @property {number} ac    The target's armor class, if applicable.
 */

/**
 * Grab the targeted tokens and return relevant information on them.
 * @returns {TargetDescriptor[]}
 */
export function getTargetDescriptors() {
  const targets = new Map();
  for ( const token of game.user.targets ) {
    const { name } = token;
    const { img, system, uuid, statuses } = token.actor ?? {};
    if ( uuid ) {
      const ac = statuses.has("coverTotal") ? null : system.attributes?.ac?.value;
      targets.set(uuid, { name, img, uuid, ac: ac ?? null });
    }
  }
  return Array.from(targets.values());
}

/* -------------------------------------------- */

/**
 * Get currently selected tokens in the scene or user's character's tokens.
 * @returns {Token5e[]}
 */
export function getSceneTargets() {
  let targets = canvas.tokens?.controlled.filter(t => t.actor) ?? [];
  if ( !targets.length && game.user.character ) targets = game.user.character.getActiveTokens();
  return targets;
}

/* -------------------------------------------- */
/*  Conversions                                 */
/* -------------------------------------------- */

/**
 * Convert the provided weight to another unit.
 * @param {number} value  The weight being converted.
 * @param {string} from   The initial units.
 * @param {string} to     The final units.
 * @returns {number}      Weight in the specified units.
 */
export function convertWeight(value, from, to) {
  if ( from === to ) return value;
  const message = unit => `Weight unit ${unit} not defined in CONFIG.SENTIUS.weightUnits`;
  if ( !CONFIG.SENTIUS.weightUnits[from] ) throw new Error(message(from));
  if ( !CONFIG.SENTIUS.weightUnits[to] ) throw new Error(message(to));
  return value
    * CONFIG.SENTIUS.weightUnits[from].conversion
    / CONFIG.SENTIUS.weightUnits[to].conversion;
}

/* -------------------------------------------- */

/**
 * Default units to use depending on system setting.
 * @param {"length"|"weight"} type  Type of units to select.
 * @returns {string}
 */
export function defaultUnits(type) {
  return CONFIG.SENTIUS.defaultUnits[type]?.[
    game.settings.get("sentius", `metric${type.capitalize()}Units`) ? "metric" : "imperial"
  ];
}

/* -------------------------------------------- */
/*  Validators                                  */
/* -------------------------------------------- */

/**
 * Ensure the provided string contains only the characters allowed in identifiers.
 * @param {string} identifier
 * @returns {boolean}
 */
function isValidIdentifier(identifier) {
  return /^([a-z0-9_-]+)$/i.test(identifier);
}

export const validators = {
  isValidIdentifier: isValidIdentifier
};

/* -------------------------------------------- */

/**
 * Determine whether the provided unit is usable within `Intl.NumberFormat`.
 * @param {string} unit
 * @returns {boolean}
 */
export function isValidUnit(unit) {
  if ( unit?.includes("-per-") ) return unit.split("-per-").every(u => isValidUnit(u));
  return Intl.supportedValuesOf("unit").includes(unit);
}

/* -------------------------------------------- */
/*  Handlebars Template Helpers                 */
/* -------------------------------------------- */

/**
 * Define a set of template paths to pre-load. Pre-loaded templates are compiled and cached for fast access when
 * rendering. These paths will also be available as Handlebars partials by using the file name
 * (e.g. "sentius.actor-traits").
 * @returns {Promise}
 */
export async function preloadHandlebarsTemplates() {
  const partials = [
    // Shared Partials
    "systems/sentius/templates/shared/active-effects.hbs",
    "systems/sentius/templates/shared/active-effects2.hbs",
    "systems/sentius/templates/shared/inventory.hbs",
    "systems/sentius/templates/shared/inventory2.hbs",
    "systems/sentius/templates/apps/parts/trait-list.hbs",
    "systems/sentius/templates/apps/parts/traits-list.hbs",

    // Actor Sheet Partials
    "systems/sentius/templates/actors/parts/actor-classes.hbs",
    "systems/sentius/templates/actors/parts/actor-trait-pills.hbs",
    "systems/sentius/templates/actors/parts/actor-traits.hbs",
    "systems/sentius/templates/actors/parts/actor-features.hbs",
    "systems/sentius/templates/actors/parts/actor-inventory.hbs",
    "systems/sentius/templates/actors/parts/actor-spellbook.hbs",
    "systems/sentius/templates/actors/parts/actor-warnings.hbs",
    "systems/sentius/templates/actors/parts/actor-warnings-dialog.hbs",
    "systems/sentius/templates/actors/parts/biography-textbox.hbs",
    "systems/sentius/templates/actors/tabs/character-bastion.hbs",
    "systems/sentius/templates/actors/tabs/character-biography.hbs",
    "systems/sentius/templates/actors/tabs/character-details.hbs",
    "systems/sentius/templates/actors/tabs/creature-features.hbs",
    "systems/sentius/templates/actors/tabs/creature-spells.hbs",
    "systems/sentius/templates/actors/tabs/group-members.hbs",
    "systems/sentius/templates/actors/tabs/npc-biography.hbs",

    // Actor Sheet Item Summary Columns
    "systems/sentius/templates/actors/parts/columns/column-feature-controls.hbs",
    "systems/sentius/templates/actors/parts/columns/column-formula.hbs",
    "systems/sentius/templates/actors/parts/columns/column-recovery.hbs",
    "systems/sentius/templates/actors/parts/columns/column-roll.hbs",
    "systems/sentius/templates/actors/parts/columns/column-uses.hbs",

    // Item Sheet Partials
    "systems/sentius/templates/items/details/details-background.hbs",
    "systems/sentius/templates/items/details/details-class.hbs",
    "systems/sentius/templates/items/details/details-consumable.hbs",
    "systems/sentius/templates/items/details/details-container.hbs",
    "systems/sentius/templates/items/details/details-equipment.hbs",
    "systems/sentius/templates/items/details/details-facility.hbs",
    "systems/sentius/templates/items/details/details-feat.hbs",
    "systems/sentius/templates/items/details/details-loot.hbs",
    "systems/sentius/templates/items/details/details-mountable.hbs",
    "systems/sentius/templates/items/details/details-species.hbs",
    "systems/sentius/templates/items/details/details-spell.hbs",
    "systems/sentius/templates/items/details/details-spellcasting.hbs",
    "systems/sentius/templates/items/details/details-starting-equipment.hbs",
    "systems/sentius/templates/items/details/details-subclass.hbs",
    "systems/sentius/templates/items/details/details-tool.hbs",
    "systems/sentius/templates/items/details/details-weapon.hbs",
    "systems/sentius/templates/items/parts/item-action.hbs",
    "systems/sentius/templates/items/parts/item-activation.hbs",
    "systems/sentius/templates/items/parts/item-activities.hbs",
    "systems/sentius/templates/items/parts/item-advancement.hbs",
    "systems/sentius/templates/items/parts/item-advancement2.hbs",
    "systems/sentius/templates/items/parts/item-description.hbs",
    "systems/sentius/templates/items/parts/item-description2.hbs",
    "systems/sentius/templates/items/parts/item-details.hbs",
    "systems/sentius/templates/items/parts/item-mountable.hbs",
    "systems/sentius/templates/items/parts/item-spellcasting.hbs",
    "systems/sentius/templates/items/parts/item-source.hbs",
    "systems/sentius/templates/items/parts/item-summary.hbs",
    "systems/sentius/templates/items/parts/item-tooltip.hbs",
    "systems/sentius/templates/items/parts/spell-block.hbs",

    // Field Partials
    "systems/sentius/templates/shared/fields/field-activation.hbs",
    "systems/sentius/templates/shared/fields/field-damage.hbs",
    "systems/sentius/templates/shared/fields/field-duration.hbs",
    "systems/sentius/templates/shared/fields/field-range.hbs",
    "systems/sentius/templates/shared/fields/field-targets.hbs",
    "systems/sentius/templates/shared/fields/field-uses.hbs",
    "systems/sentius/templates/shared/fields/fieldlist.hbs",

    // Journal Partials
    "systems/sentius/templates/journal/parts/journal-legacy-traits.hbs",
    "systems/sentius/templates/journal/parts/journal-modern-traits.hbs",
    "systems/sentius/templates/journal/parts/journal-table.hbs",

    // Activity Partials
    "systems/sentius/templates/activity/columns/activity-column-controls.hbs",
    "systems/sentius/templates/activity/columns/activity-column-formula.hbs",
    "systems/sentius/templates/activity/columns/activity-column-price.hbs",
    "systems/sentius/templates/activity/columns/activity-column-quantity.hbs",
    "systems/sentius/templates/activity/columns/activity-column-range.hbs",
    "systems/sentius/templates/activity/columns/activity-column-recovery.hbs",
    "systems/sentius/templates/activity/columns/activity-column-roll.hbs",
    "systems/sentius/templates/activity/columns/activity-column-school.hbs",
    "systems/sentius/templates/activity/columns/activity-column-target.hbs",
    "systems/sentius/templates/activity/columns/activity-column-time.hbs",
    "systems/sentius/templates/activity/columns/activity-column-uses.hbs",
    "systems/sentius/templates/activity/columns/activity-column-weight.hbs",
    "systems/sentius/templates/activity/activity-row-summary.hbs",
    "systems/sentius/templates/activity/parts/activity-usage-notes.hbs",

    // Advancement Partials
    "systems/sentius/templates/advancement/parts/advancement-ability-score-control.hbs",
    "systems/sentius/templates/advancement/parts/advancement-controls.hbs",
    "systems/sentius/templates/advancement/parts/advancement-spell-config.hbs"
  ];

  const paths = {};
  for ( const path of partials ) {
    paths[path.replace(".hbs", ".html")] = path;
    paths[`sentius.${path.split("/").pop().replace(".hbs", "")}`] = path;
  }

  return loadTemplates(paths);
}

/* -------------------------------------------- */

/**
 * A helper that converts the provided object into a series of `data-` entries.
 * @param {object} object   Object to convert into dataset entries.
 * @param {object} options  Handlebars options.
 * @returns {string}
 */
function dataset(object, options) {
  const entries = [];
  for ( let [key, value] of Object.entries(object ?? {}) ) {
    if ( value === undefined ) continue;
    key = key.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (a, b) => (b ? "-" : "") + a.toLowerCase());
    entries.push(`data-${key}="${value}"`);
  }
  return new Handlebars.SafeString(entries.join(" "));
}

/* -------------------------------------------- */

/**
 * A helper to create a set of <option> elements in a <select> block grouped together
 * in <optgroup> based on the provided categories.
 *
 * @param {SelectChoices} choices          Choices to format.
 * @param {object} [options]
 * @param {boolean} [options.localize]     Should the label be localized?
 * @param {string} [options.blank]         Name for the empty option, if one should be added.
 * @param {string} [options.labelAttr]     Attribute pointing to label string.
 * @param {string} [options.chosenAttr]    Attribute pointing to chosen boolean.
 * @param {string} [options.childrenAttr]  Attribute pointing to array of children.
 * @returns {Handlebars.SafeString}        Formatted option list.
 */
function groupedSelectOptions(choices, options) {
  const localize = options.hash.localize ?? false;
  const blank = options.hash.blank ?? null;
  const labelAttr = options.hash.labelAttr ?? "label";
  const chosenAttr = options.hash.chosenAttr ?? "chosen";
  const childrenAttr = options.hash.childrenAttr ?? "children";

  // Create an option
  const option = (name, label, chosen) => {
    if ( localize ) label = game.i18n.localize(label);
    html += `<option value="${name}" ${chosen ? "selected" : ""}>${label}</option>`;
  };

  // Create a group
  const group = category => {
    let label = category[labelAttr];
    if ( localize ) game.i18n.localize(label);
    html += `<optgroup label="${label}">`;
    children(category[childrenAttr]);
    html += "</optgroup>";
  };

  // Add children
  const children = children => {
    for ( let [name, child] of Object.entries(children) ) {
      if ( child[childrenAttr] ) group(child);
      else option(name, child[labelAttr], child[chosenAttr] ?? false);
    }
  };

  // Create the options
  let html = "";
  if ( blank !== null ) option("", blank);
  children(choices);
  return new Handlebars.SafeString(html);
}

/* -------------------------------------------- */

/**
 * A helper that fetch the appropriate item context from root and adds it to the first block parameter.
 * @param {object} context  Current evaluation context.
 * @param {object} options  Handlebars options.
 * @returns {string}
 */
function itemContext(context, options) {
  if ( arguments.length !== 2 ) throw new Error("#sentius-itemContext requires exactly one argument");
  if ( foundry.utils.getType(context) === "function" ) context = context.call(this);

  const ctx = options.data.root.itemContext?.[context.id];
  if ( !ctx ) {
    const inverse = options.inverse(this);
    if ( inverse ) return options.inverse(this);
  }

  return options.fn(context, { data: options.data, blockParams: [ctx] });
}

/* -------------------------------------------- */

/**
 * Conceal a section and display a notice if unidentified.
 * @param {boolean} conceal  Should the section be concealed?
 * @param {object} options   Handlebars options.
 * @returns {string}
 */
function concealSection(conceal, options) {
  let content = options.fn(this);
  if ( !conceal ) return content;

  content = `<div inert>
    ${content}
  </div>
  <div class="unidentified-notice">
      <div>
          <strong>${game.i18n.localize("SENTIUS.Unidentified.Title")}</strong>
          <p>${game.i18n.localize("SENTIUS.Unidentified.Notice")}</p>
      </div>
  </div>`;
  return content;
}

/* -------------------------------------------- */

/**
 * Construct an object from the provided arguments.
 * @param {object} options       Handlebars options.
 * @param {object} options.hash
 * @returns {object}
 */
function makeObject({ hash }) {
  return hash;
}

/* -------------------------------------------- */

/**
 * Register custom Handlebars helpers used by 5e.
 */
export function registerHandlebarsHelpers() {
  Handlebars.registerHelper({
    getProperty: foundry.utils.getProperty,
    "sentius-concealSection": concealSection,
    "sentius-dataset": dataset,
    "sentius-formatCR": formatCR,
    "sentius-formatModifier": formatModifier,
    "sentius-groupedSelectOptions": groupedSelectOptions,
    "sentius-itemContext": itemContext,
    "sentius-linkForUuid": (uuid, options) => linkForUuid(uuid, options.hash),
    "sentius-numberFormat": (context, options) => formatNumber(context, options.hash),
    "sentius-numberParts": (context, options) => formatNumberParts(context, options.hash),
    "sentius-object": makeObject,
    "sentius-textFormat": formatText
  });
}

/* -------------------------------------------- */
/*  Config Pre-Localization                     */
/* -------------------------------------------- */

/**
 * Storage for pre-localization configuration.
 * @type {object}
 * @private
 */
const _preLocalizationRegistrations = {};

/**
 * Mark the provided config key to be pre-localized during the init stage.
 * @param {string} configKeyPath          Key path within `CONFIG.SENTIUS` to localize.
 * @param {object} [options={}]
 * @param {string} [options.key]          If each entry in the config enum is an object,
 *                                        localize and sort using this property.
 * @param {string[]} [options.keys=[]]    Array of localization keys. First key listed will be used for sorting
 *                                        if multiple are provided.
 * @param {boolean} [options.sort=false]  Sort this config enum, using the key if set.
 */
export function preLocalize(configKeyPath, { key, keys=[], sort=false }={}) {
  if ( key ) keys.unshift(key);
  _preLocalizationRegistrations[configKeyPath] = { keys, sort };
}

/* -------------------------------------------- */

/**
 * Execute previously defined pre-localization tasks on the provided config object.
 * @param {object} config  The `CONFIG.SENTIUS` object to localize and sort. *Will be mutated.*
 */
export function performPreLocalization(config) {
  for ( const [keyPath, settings] of Object.entries(_preLocalizationRegistrations) ) {
    const target = foundry.utils.getProperty(config, keyPath);
    if ( !target ) continue;
    _localizeObject(target, settings.keys);
    if ( settings.sort ) foundry.utils.setProperty(config, keyPath, sortObjectEntries(target, settings.keys[0]));
  }

  // Localize & sort status effects
  CONFIG.statusEffects.forEach(s => s.name = game.i18n.localize(s.name));
  CONFIG.statusEffects.sort((lhs, rhs) =>
    lhs.order || rhs.order ? (lhs.order ?? Infinity) - (rhs.order ?? Infinity)
      : lhs.name.localeCompare(rhs.name, game.i18n.lang)
  );
}

/* -------------------------------------------- */

/**
 * Localize the values of a configuration object by translating them in-place.
 * @param {object} obj       The configuration object to localize.
 * @param {string[]} [keys]  List of inner keys that should be localized if this is an object.
 * @private
 */
function _localizeObject(obj, keys) {
  for ( const [k, v] of Object.entries(obj) ) {
    const type = typeof v;
    if ( type === "string" ) {
      obj[k] = game.i18n.localize(v);
      continue;
    }

    if ( type !== "object" ) {
      console.error(new Error(
        `Pre-localized configuration values must be a string or object, ${type} found for "${k}" instead.`
      ));
      continue;
    }
    if ( !keys?.length ) {
      console.error(new Error(
        "Localization keys must be provided for pre-localizing when target is an object."
      ));
      continue;
    }

    for ( const key of keys ) {
      const value = foundry.utils.getProperty(v, key);
      if ( !value ) continue;
      foundry.utils.setProperty(v, key, game.i18n.localize(value));
    }
  }
}

/* -------------------------------------------- */
/*  Localization                                */
/* -------------------------------------------- */

/**
 * A cache of already-fetched labels for faster lookup.
 * @type {Map<string, string>}
 */
const _attributeLabelCache = new Map();

/**
 * Convert an attribute path to a human-readable label.
 * @param {string} attr              The attribute path.
 * @param {object} [options]
 * @param {Actor5e} [options.actor]  An optional reference actor.
 * @returns {string|void}
 */
export function getHumanReadableAttributeLabel(attr, { actor }={}) {
  // Check any actor-specific names first.
  if ( attr.startsWith("resources.") && actor ) {
    const key = attr.replace(/\.value$/, "");
    const resource = foundry.utils.getProperty(actor, `system.${key}`);
    if ( resource?.label ) return resource.label;
  }

  if ( (attr === "details.xp.value") && (actor?.type === "npc") ) {
    return game.i18n.localize("SENTIUS.ExperiencePointsValue");
  }

  if ( attr.startsWith(".") && actor ) {
    // TODO: Remove `strict: false` when https://github.com/foundryvtt/foundryvtt/issues/11214 is resolved
    // Only necessary when opening the token config for an actor in a compendium
    const item = fromUuidSync(attr, { relative: actor, strict: false });
    return item?.name ?? attr;
  }

  // Check if the attribute is already in cache.
  let label = _attributeLabelCache.get(attr);
  if ( label ) return label;

  // Derived fields.
  if ( attr === "attributes.init.total" ) label = "SENTIUS.InitiativeBonus";
  else if ( (attr === "attributes.ac.value") || (attr === "attributes.ac.flat") ) label = "SENTIUS.ArmorClass";
  else if ( attr === "attributes.spelldc" ) label = "SENTIUS.SpellDC";

  // Abilities.
  else if ( attr.startsWith("abilities.") ) {
    const [, key] = attr.split(".");
    label = game.i18n.format("SENTIUS.AbilityScoreL", { ability: CONFIG.SENTIUS.abilities[key].label });
  }

  // Skills.
  else if ( attr.startsWith("skills.") ) {
    const [, key] = attr.split(".");
    label = game.i18n.format("SENTIUS.SkillPassiveScore", { skill: CONFIG.SENTIUS.skills[key].label });
  }

  // Spell slots.
  else if ( attr.startsWith("spells.") ) {
    const [, key] = attr.split(".");
    if ( !/spell\d+/.test(key) ) label = `SENTIUS.SpellSlots${key.capitalize()}`;
    else {
      const plurals = new Intl.PluralRules(game.i18n.lang, {type: "ordinal"});
      const level = Number(key.slice(5));
      label = game.i18n.format(`SENTIUS.SpellSlotsN.${plurals.select(level)}`, { n: level });
    }
  }

  // Currency
  else if ( attr.startsWith("currency.") ) {
    const [, key] = attr.split(".");
    label = CONFIG.SENTIUS.currencies[key]?.label;
  }

  // Attempt to find the attribute in a data model.
  if ( !label ) {
    const { CharacterData, NPCData, VehicleData, GroupData } = sentius.dataModels.actor;
    for ( const model of [CharacterData, NPCData, VehicleData, GroupData] ) {
      const field = model.schema.getField(attr);
      if ( field ) {
        label = field.label;
        break;
      }
    }
  }

  if ( label ) {
    label = game.i18n.localize(label);
    _attributeLabelCache.set(attr, label);
  }

  return label;
}

/* -------------------------------------------- */

/**
 * Split a semi-colon-separated list and clean out any empty entries.
 * @param {string} input
 * @returns {string}
 */
export function splitSemicolons(input) {
  return input.split(";").map(t => t.trim()).filter(t => t);
}

/* -------------------------------------------- */
/*  Migration                                   */
/* -------------------------------------------- */

/**
 * Synchronize the spells for all Actors in some collection with source data from an Item compendium pack.
 * @param {CompendiumCollection} actorPack      An Actor compendium pack which will be updated
 * @param {CompendiumCollection} spellsPack     An Item compendium pack which provides source data for spells
 * @returns {Promise<void>}
 */
export async function synchronizeActorSpells(actorPack, spellsPack) {

  // Load all actors and spells
  const actors = await actorPack.getDocuments();
  const spells = await spellsPack.getDocuments();
  const spellsMap = spells.reduce((obj, item) => {
    obj[item.name] = item;
    return obj;
  }, {});

  // Unlock the pack
  await actorPack.configure({locked: false});

  // Iterate over actors
  SceneNavigation.displayProgressBar({label: "Synchronizing Spell Data", pct: 0});
  for ( const [i, actor] of actors.entries() ) {
    const {toDelete, toCreate} = _synchronizeActorSpells(actor, spellsMap);
    if ( toDelete.length ) await actor.deleteEmbeddedDocuments("Item", toDelete);
    if ( toCreate.length ) await actor.createEmbeddedDocuments("Item", toCreate, {keepId: true});
    console.debug(`${actor.name} | Synchronized ${toCreate.length} spells`);
    SceneNavigation.displayProgressBar({label: actor.name, pct: ((i / actors.length) * 100).toFixed(0)});
  }

  // Re-lock the pack
  await actorPack.configure({locked: true});
  SceneNavigation.displayProgressBar({label: "Synchronizing Spell Data", pct: 100});
}

/* -------------------------------------------- */

/**
 * A helper function to synchronize spell data for a specific Actor.
 * @param {Actor5e} actor
 * @param {Object<string,Item5e>} spellsMap
 * @returns {{toDelete: string[], toCreate: object[]}}
 * @private
 */
function _synchronizeActorSpells(actor, spellsMap) {
  const spells = actor.itemTypes.spell;
  const toDelete = [];
  const toCreate = [];
  if ( !spells.length ) return {toDelete, toCreate};

  for ( const spell of spells ) {
    const source = spellsMap[spell.name];
    if ( !source ) {
      console.warn(`${actor.name} | ${spell.name} | Does not exist in spells compendium pack`);
      continue;
    }

    // Combine source data with the preparation and uses data from the actor
    const spellData = source.toObject();
    const {preparation, uses, save} = spell.toObject().system;
    Object.assign(spellData.system, {preparation, uses});
    spellData.system.save.dc = save.dc;
    foundry.utils.setProperty(spellData, "_stats.compendiumSource", source.uuid);

    // Record spells to be deleted and created
    toDelete.push(spell.id);
    toCreate.push(spellData);
  }
  return {toDelete, toCreate};
}