// import MapLocationControlIcon from "./canvas/map-location-control-icon.mjs";
// import { ConsumptionTargetData } from "./data/activity/fields/consumption-targets-field.mjs";
// import * as activities from "./documents/activity/_module.mjs";
// import * as advancement from "./documents/advancement/_module.mjs";
// import { preLocalize } from "./utils.mjs";

// Namespace Configuration Values
const SENTIUS = {};

// ASCII Artwork
SENTIUS.ASCII = `
  _________              __  .__             ____________________  ________ 
 /   _____/ ____   _____/  |_|__|__ __  _____\______   \______   \/  _____/ 
 \_____  \_/ __ \ /    \   __\  |  |  \/  ___/|       _/|     ___/   \  ___ 
 /        \  ___/|   |  \  | |  |  |  /\___ \ |    |   \|    |   \    \_\  \
/_______  /\___  >___|  /__| |__|____//____  >|____|_  /|____|    \______  /
        \/     \/     \/                   \/        \/                  \/ 
`;

/**
 * Configuration data for abilities.
 *
 * @typedef {object} AbilityConfiguration
 * @property {string} label                               Localized label.
 * @property {string} abbreviation                        Localized abbreviation.
 * @property {string} fullKey                             Fully written key used as alternate for enrichers.
 * @property {string} [reference]                         Reference to a rule page describing this ability.
 * @property {string} [type]                              Whether this is a "physical" or "mental" ability.
 * @property {Object<string, number|string>}  [defaults]  Default values for this ability based on actor type.
 *                                                        If a string is used, the system will attempt to fetch.
 *                                                        the value of the specified ability.
 * @property {string} [icon]                              An SVG icon that represents the ability.
 */

/**
 * The set of Ability Scores used within the system.
 * @enum {AbilityConfiguration}
 */
SENTIUS.abilities = {
  agility: {
    label: "SENTIUS.AbilityAgi",
    abbreviation: "SENTIUS.AbilityAgiAbbr",
    type: "physical",
    fullKey: "agility"
  },
  endurance: {
    label: "SENTIUS.AbilityEnd",
    abbreviation: "SENTIUS.AbilityEndAbbr",
    type: "physical",
    fullKey: "endurance"
  },
  quickness: {
    label: "SENTIUS.AbilityQui",
    abbreviation: "SENTIUS.AbilityQuiAbbr",
    type: "physical",
    fullKey: "quickness"
  },
  strength: { 
    label: "SENTIUS.AbilityStr",
    abbreviation: "SENTIUS.AbilityStrAbbr",
    type: "physical",
    fullKey: "strength"
  },
  intuition: { 
    label: "SENTIUS.AbilityInt",
    abbreviation: "SENTIUS.AbilityIntAbbr",
    type: "mental",
    fullKey: "intutition"
  },
  presence: {
    label: "SENTIUS.AbilityPre",
    abbreviation: "SENTIUS.AbilityPreAbbr",
    type: "mental",
    fullKey: "presence"
  },
  reasoning: {
    label: "SENTIUS.AbilityRea",
    abbreviation: "SENTIUS.AbilityReaAbbr",
    type: "mental",
    fullKey: "reasoning"
  },
  will: {
    label: "SENTIUS.AbilityWil",
    abbreviation: "SENTIUS.AbilityWilAbbr",
    type: "mental",
    fullKey: "will"
  }
  // str: {
  //   label: "SENTIUS.AbilityStr",
  //   abbreviation: "SENTIUS.AbilityStrAbbr",
  //   type: "physical",
  //   fullKey: "strength",
  //   reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.nUPv6C66Ur64BIUH",
  //   icon: "systems/sentius/icons/svg/abilities/strength.svg"
  // },
  // dex: {
  //   label: "SENTIUS.AbilityDex",
  //   abbreviation: "SENTIUS.AbilityDexAbbr",
  //   type: "physical",
  //   fullKey: "dexterity",
  //   reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.ER8CKDUWLsFXuARJ",
  //   icon: "systems/sentius/icons/svg/abilities/dexterity.svg"
  // },
  // con: {
  //   label: "SENTIUS.AbilityCon",
  //   abbreviation: "SENTIUS.AbilityConAbbr",
  //   type: "physical",
  //   fullKey: "constitution",
  //   reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.MpA4jnwD17Q0RPg7",
  //   icon: "systems/sentius/icons/svg/abilities/constitution.svg"
  // },
  // int: {
  //   label: "SENTIUS.AbilityInt",
  //   abbreviation: "SENTIUS.AbilityIntAbbr",
  //   type: "mental",
  //   fullKey: "intelligence",
  //   reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.WzWWcTIppki35YvF",
  //   icon: "systems/sentius/icons/svg/abilities/intelligence.svg",
  //   defaults: { vehicle: 0 }
  // },
  // wis: {
  //   label: "SENTIUS.AbilityWis",
  //   abbreviation: "SENTIUS.AbilityWisAbbr",
  //   type: "mental",
  //   fullKey: "wisdom",
  //   reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.v3IPyTtqvXqN934s",
  //   icon: "systems/sentius/icons/svg/abilities/wisdom.svg",
  //   defaults: { vehicle: 0 }
  // },
  // cha: {
  //   label: "SENTIUS.AbilityCha",
  //   abbreviation: "SENTIUS.AbilityChaAbbr",
  //   type: "mental",
  //   fullKey: "charisma",
  //   reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.9FyghudYFV5QJOuG",
  //   icon: "systems/sentius/icons/svg/abilities/charisma.svg",
  //   defaults: { vehicle: 0 }
  // },
  // hon: {
  //   label: "SENTIUS.AbilityHon",
  //   abbreviation: "SENTIUS.AbilityHonAbbr",
  //   type: "mental",
  //   fullKey: "honor",
  //   defaults: { npc: "cha", vehicle: 0 },
  //   improvement: false
  // },
  // san: {
  //   label: "SENTIUS.AbilitySan",
  //   abbreviation: "SENTIUS.AbilitySanAbbr",
  //   type: "mental",
  //   fullKey: "sanity",
  //   defaults: { npc: "wis", vehicle: 0 },
  //   improvement: false
  // }
};
preLocalize("abilities", { keys: ["label", "abbreviation"] });

/**
 * Configure which ability score is used as the default modifier for initiative rolls,
 * when calculating hit points per level and hit dice, and as the default modifier for
 * saving throws to maintain concentration.
 * @enum {string}
 */
// SENTIUS.derivedAttributes = {
//   meleeAttack: "str",
//   rangedAttack: "dex",
//   initiative: "dex",
//   hitPoints: "con",
//   concentration: "con"
// };

/* -------------------------------------------- */

/**
 * Configuration data for skills.
 *
 * @typedef {object} SkillConfiguration
 * @property {string} label        Localized label.
 * @property {string} ability      Key for the default ability used by this skill.
 * @property {string} fullKey      Fully written key used as alternate for enrichers.
 * @property {string} [reference]  Reference to a rule page describing this skill.
 */

/**
 * The set of skill which can be trained with their default ability scores.
 * @enum {SkillConfiguration}
 */
// SENTIUS.skills = {
//   acr: {
//     label: "SENTIUS.SkillAcr",
//     ability: "dex",
//     fullKey: "acrobatics",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.AvvBLEHNl7kuwPkN",
//     icon: "icons/equipment/feet/shoes-simple-leaf-green.webp"
//   },
//   ani: {
//     label: "SENTIUS.SkillAni",
//     ability: "wis",
//     fullKey: "animalHandling",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.xb3MCjUvopOU4viE",
//     icon: "icons/environment/creatures/horse-brown.webp"
//   },
//   arc: {
//     label: "SENTIUS.SkillArc",
//     ability: "int",
//     fullKey: "arcana",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.h3bYSPge8IOqne1N",
//     icon: "icons/sundries/books/book-embossed-jewel-silver-green.webp"
//   },
//   ath: {
//     label: "SENTIUS.SkillAth",
//     ability: "str",
//     fullKey: "athletics",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.rIR7ttYDUpH3tMzv",
//     icon: "icons/magic/control/buff-strength-muscle-damage-orange.webp"
//   },
//   dec: {
//     label: "SENTIUS.SkillDec",
//     ability: "cha",
//     fullKey: "deception",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.mqVZ2fz0L7a9VeKJ",
//     icon: "icons/magic/control/mouth-smile-deception-purple.webp"
//   },
//   his: {
//     label: "SENTIUS.SkillHis",
//     ability: "int",
//     fullKey: "history",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.kRBZbdWMGW9K3wdY",
//     icon: "icons/sundries/books/book-embossed-bound-brown.webp"
//   },
//   ins: {
//     label: "SENTIUS.SkillIns",
//     ability: "wis",
//     fullKey: "insight",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.8R5SMbAGbECNgO8z",
//     icon: "icons/magic/perception/orb-crystal-ball-scrying-blue.webp"
//   },
//   itm: {
//     label: "SENTIUS.SkillItm",
//     ability: "cha",
//     fullKey: "intimidation",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.4VHHI2gJ1jEsppfg",
//     icon: "icons/skills/social/intimidation-impressing.webp"
//   },
//   inv: {
//     label: "SENTIUS.SkillInv",
//     ability: "int",
//     fullKey: "investigation",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.Y7nmbQAruWOs7WRM",
//     icon: "icons/tools/scribal/magnifying-glass.webp"
//   },
//   med: {
//     label: "SENTIUS.SkillMed",
//     ability: "wis",
//     fullKey: "medicine",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.GeYmM7BVfSCAga4o",
//     icon: "icons/tools/cooking/mortar-herbs-yellow.webp"
//   },
//   nat: {
//     label: "SENTIUS.SkillNat",
//     ability: "int",
//     fullKey: "nature",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.ueMx3uF2PQlcye31",
//     icon: "icons/magic/nature/plant-sprout-snow-green.webp"
//   },
//   prc: {
//     label: "SENTIUS.SkillPrc",
//     ability: "wis",
//     fullKey: "perception",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.zjEeHCUqfuprfzhY",
//     icon: "icons/magic/perception/eye-ringed-green.webp"
//   },
//   prf: {
//     label: "SENTIUS.SkillPrf",
//     ability: "cha",
//     fullKey: "performance",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.hYT7Z06yDNBcMtGe",
//     icon: "icons/tools/instruments/lute-gold-brown.webp"
//   },
//   per: {
//     label: "SENTIUS.SkillPer",
//     ability: "cha",
//     fullKey: "persuasion",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.4R5H8iIsdFQTsj3X",
//     icon: "icons/skills/social/diplomacy-handshake.webp"
//   },
//   rel: {
//     label: "SENTIUS.SkillRel",
//     ability: "int",
//     fullKey: "religion",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.CXVzERHdP4qLhJXM",
//     icon: "icons/magic/holy/saint-glass-portrait-halo.webp"
//   },
//   slt: {
//     label: "SENTIUS.SkillSlt",
//     ability: "dex",
//     fullKey: "sleightOfHand",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.yg6SRpGNVz9nDW0A",
//     icon: "icons/sundries/gaming/playing-cards.webp"
//   },
//   ste: {
//     label: "SENTIUS.SkillSte",
//     ability: "dex",
//     fullKey: "stealth",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.4MfrpERNiQXmvgCI",
//     icon: "icons/magic/perception/shadow-stealth-eyes-purple.webp"
//   },
//   sur: {
//     label: "SENTIUS.SkillSur",
//     ability: "wis",
//     fullKey: "survival",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.t3EzDU5b9BVAIEVi",
//     icon: "icons/magic/fire/flame-burning-campfire-yellow-blue.webp"
//   }
// };
// preLocalize("skills", { key: "label", sort: true });

/* -------------------------------------------- */

/**
 * Character alignment options.
 * @enum {string}
 */
// SENTIUS.alignments = {
//   lg: "SENTIUS.AlignmentLG",
//   ng: "SENTIUS.AlignmentNG",
//   cg: "SENTIUS.AlignmentCG",
//   ln: "SENTIUS.AlignmentLN",
//   tn: "SENTIUS.AlignmentTN",
//   cn: "SENTIUS.AlignmentCN",
//   le: "SENTIUS.AlignmentLE",
//   ne: "SENTIUS.AlignmentNE",
//   ce: "SENTIUS.AlignmentCE"
// };
// preLocalize("alignments");

/* -------------------------------------------- */

/**
 * An enumeration of item attunement types.
 * @enum {string}
 */
// SENTIUS.attunementTypes = {
//   required: "SENTIUS.AttunementRequired",
//   optional: "SENTIUS.AttunementOptional"
// };
// preLocalize("attunementTypes");

/**
 * An enumeration of item attunement states.
 * @type {{"0": string, "1": string, "2": string}}
 * @deprecated since 3.2, available until 3.4
 */
// SENTIUS.attunements = {
//   0: "SENTIUS.AttunementNone",
//   1: "SENTIUS.AttunementRequired",
//   2: "SENTIUS.AttunementAttuned"
// };
// preLocalize("attunements");

/* -------------------------------------------- */
/*  Weapon Details                              */
/* -------------------------------------------- */

/**
 * The set of types which a weapon item can take.
 * @enum {string}
 */
// SENTIUS.weaponTypes = {
//   simpleM: "SENTIUS.WeaponSimpleM",
//   simpleR: "SENTIUS.WeaponSimpleR",
//   martialM: "SENTIUS.WeaponMartialM",
//   martialR: "SENTIUS.WeaponMartialR",
//   natural: "SENTIUS.WeaponNatural",
//   improv: "SENTIUS.WeaponImprov",
//   siege: "SENTIUS.WeaponSiege"
// };
// preLocalize("weaponTypes");

/* -------------------------------------------- */

/**
 * General weapon categories.
 * @enum {string}
 */
// SENTIUS.weaponProficiencies = {
//   sim: "SENTIUS.WeaponSimpleProficiency",
//   mar: "SENTIUS.WeaponMartialProficiency"
// };
// preLocalize("weaponProficiencies");

/* -------------------------------------------- */

/**
 * @typedef {object} WeaponMasterConfiguration
 * @property {string} label        Localized label for the mastery
 * @property {string} [reference]  Reference to a rule page describing this mastery.
 */

/**
 * Weapon masteries.
 * @enum {WeaponMasterConfiguration}
 */
// SENTIUS.weaponMasteries = {
//   cleave: {
//     label: "SENTIUS.WEAPON.Mastery.Cleave"
//   },
//   graze: {
//     label: "SENTIUS.WEAPON.Mastery.Graze"
//   },
//   nick: {
//     label: "SENTIUS.WEAPON.Mastery.Nick"
//   },
//   push: {
//     label: "SENTIUS.WEAPON.Mastery.Push"
//   },
//   sap: {
//     label: "SENTIUS.WEAPON.Mastery.Sap"
//   },
//   slow: {
//     label: "SENTIUS.WEAPON.Mastery.Slow"
//   },
//   topple: {
//     label: "SENTIUS.WEAPON.Mastery.Topple"
//   },
//   vex: {
//     label: "SENTIUS.WEAPON.Mastery.Vex"
//   }
// };
// preLocalize("weaponMasteries", { key: "label", sort: true });

/* -------------------------------------------- */

/**
 * A mapping between `SENTIUS.weaponTypes` and `SENTIUS.weaponProficiencies` that
 * is used to determine if character has proficiency when adding an item.
 * @enum {(boolean|string)}
 */
// SENTIUS.weaponProficienciesMap = {
//   simpleM: "sim",
//   simpleR: "sim",
//   martialM: "mar",
//   martialR: "mar"
// };

/* -------------------------------------------- */

/**
 * A mapping between `SENTIUS.weaponTypes` and `SENTIUS.attackClassifications`. Unlisted types are assumed to be
 * of the "weapon" classification.
 * @enum {string}
 */
// SENTIUS.weaponClassificationMap = {};

/* -------------------------------------------- */

/**
 * A mapping between `SENTIUS.weaponTypes` and `SENTIUS.attackTypes`.
 * @enum {string}
 */
// SENTIUS.weaponTypeMap = {
//   simpleM: "melee",
//   simpleR: "ranged",
//   martialM: "melee",
//   martialR: "ranged",
//   siege: "ranged"
// };

/* -------------------------------------------- */

/**
 * The basic weapon types in 5e. This enables specific weapon proficiencies or
 * starting equipment provided by classes and backgrounds.
 * @enum {string}
 */
// SENTIUS.weaponIds = {
//   battleaxe: "I0WocDSuNpGJayPb",
//   blowgun: "wNWK6yJMHG9ANqQV",
//   club: "nfIRTECQIG81CvM4",
//   dagger: "0E565kQUBmndJ1a2",
//   dart: "3rCO8MTIdPGSW6IJ",
//   flail: "UrH3sMdnUDckIHJ6",
//   glaive: "rOG1OM2ihgPjOvFW",
//   greataxe: "1Lxk6kmoRhG8qQ0u",
//   greatclub: "QRCsxkCwWNwswL9o",
//   greatsword: "xMkP8BmFzElcsMaR",
//   halberd: "DMejWAc8r8YvDPP1",
//   handaxe: "eO7Fbv5WBk5zvGOc",
//   handcrossbow: "qaSro7kFhxD6INbZ",
//   heavycrossbow: "RmP0mYRn2J7K26rX",
//   javelin: "DWLMnODrnHn8IbAG",
//   lance: "RnuxdHUAIgxccVwj",
//   lightcrossbow: "ddWvQRLmnnIS0eLF",
//   lighthammer: "XVK6TOL4sGItssAE",
//   longbow: "3cymOVja8jXbzrdT",
//   longsword: "10ZP2Bu3vnCuYMIB",
//   mace: "Ajyq6nGwF7FtLhDQ",
//   maul: "DizirD7eqjh8n95A",
//   morningstar: "dX8AxCh9o0A9CkT3",
//   net: "aEiM49V8vWpWw7rU",
//   pike: "tC0kcqZT9HHAO0PD",
//   quarterstaff: "g2dWN7PQiMRYWzyk",
//   rapier: "Tobce1hexTnDk4sV",
//   scimitar: "fbC0Mg1a73wdFbqO",
//   shortsword: "osLzOwQdPtrK3rQH",
//   sickle: "i4NeNZ30ycwPDHMx",
//   spear: "OG4nBBydvmfWYXIk",
//   shortbow: "GJv6WkD7D2J6rP6M",
//   sling: "3gynWO9sN4OLGMWD",
//   trident: "F65ANO66ckP8FDMa",
//   warpick: "2YdfjN1PIIrSHZii",
//   warhammer: "F0Df164Xv1gWcYt0",
//   whip: "QKTyxoO0YDnAsbYe"
// };

/* -------------------------------------------- */

/**
 * The basic ammunition types.
 * @enum {string}
 */
// SENTIUS.ammoIds = {
//   arrow: "3c7JXOzsv55gqJS5",
//   blowgunNeedle: "gBQ8xqTA5f8wP5iu",
//   crossbowBolt: "SItCnYBqhzqBoaWG",
//   slingBullet: "z9SbsMIBZzuhZOqT"
// };

/* -------------------------------------------- */
/*  Bastion Facilities                          */
/* -------------------------------------------- */

/**
 * @typedef FacilityConfiguration
 * @property {Record<string, Record<number, number>>} advancement  The number of free facilities of a given type awarded
 *                                                                 at certain character levels.
 * @property {Record<string, FacilityOrder>} orders                Orders that can be issued to a facility.
 * @property {Record<string, FacilitySize>} sizes                  Facility size categories.
 * @property {Record<string, SubtypeTypeConfiguration>} types      Facility types and subtypes.
 */

/**
 * @typedef FacilityOrder
 * @property {string} label       The human-readable name of the order.
 * @property {string} icon        The SVG icon for this order.
 * @property {boolean} [basic]    Whether this order can be issued to basic facilities.
 * @property {number} [duration]  The amount of time taken to complete the order if different to a normal bastion turn.
 * @property {boolean} [hidden]   This order is not normally available for execution.
 */

/**
 * @typedef FacilitySize
 * @property {string} label    The human-readable name of the size category.
 * @property {number} days     The number of days to build the facility.
 * @property {number} squares  The maximum area the facility may occupy in the bastion plan.
 * @property {number} value    The cost in gold pieces to build the facility.
 */

/**
 * Configuration data for bastion facilities.
 * @type {FacilityConfiguration}
 */
// SENTIUS.facilities = {
//   advancement: {
//     basic: { 5: 2 },
//     special: { 5: 2, 9: 4, 13: 5, 17: 6 }
//   },
//   orders: {
//     build: {
//       label: "SENTIUS.FACILITY.Orders.build.inf",
//       icon: "systems/sentius/icons/svg/facilities/build.svg"
//     },
//     change: {
//       label: "SENTIUS.FACILITY.Orders.change.inf",
//       icon: "systems/sentius/icons/svg/facilities/change.svg",
//       duration: 21
//     },
//     craft: {
//       label: "SENTIUS.FACILITY.Orders.craft.inf",
//       icon: "systems/sentius/icons/svg/facilities/craft.svg"
//     },
//     empower: {
//       label: "SENTIUS.FACILITY.Orders.empower.inf",
//       icon: "systems/sentius/icons/svg/facilities/empower.svg"
//     },
//     enlarge: {
//       label: "SENTIUS.FACILITY.Orders.enlarge.inf",
//       icon: "systems/sentius/icons/svg/facilities/enlarge.svg",
//       basic: true
//     },
//     harvest: {
//       label: "SENTIUS.FACILITY.Orders.harvest.inf",
//       icon: "systems/sentius/icons/svg/facilities/harvest.svg"
//     },
//     maintain: {
//       label: "SENTIUS.FACILITY.Orders.maintain.inf",
//       icon: "systems/sentius/icons/svg/facilities/maintain.svg"
//     },
//     recruit: {
//       label: "SENTIUS.FACILITY.Orders.recruit.inf",
//       icon: "systems/sentius/icons/svg/facilities/recruit.svg"
//     },
//     repair: {
//       label: "SENTIUS.FACILITY.Orders.repair.inf",
//       icon: "systems/sentius/icons/svg/facilities/repair.svg",
//       hidden: true
//     },
//     research: {
//       label: "SENTIUS.FACILITY.Orders.research.inf",
//       icon: "systems/sentius/icons/svg/facilities/research.svg"
//     },
//     trade: {
//       label: "SENTIUS.FACILITY.Orders.trade.inf",
//       icon: "systems/sentius/icons/svg/facilities/trade.svg"
//     }
//   },
//   sizes: {
//     cramped: {
//       label: "SENTIUS.FACILITY.Sizes.cramped",
//       days: 20,
//       squares: 4,
//       value: 500
//     },
//     roomy: {
//       label: "SENTIUS.FACILITY.Sizes.roomy",
//       days: 45,
//       squares: 16,
//       value: 1_000
//     },
//     vast: {
//       label: "SENTIUS.FACILITY.Sizes.vast",
//       days: 125,
//       squares: 36,
//       value: 3_000
//     }
//   },
//   types: {
//     basic: {
//       label: "SENTIUS.FACILITY.Types.Basic.Label.one",
//       subtypes: {
//         bedroom: "SENTIUS.FACILITY.Types.Basic.Bedroom",
//         diningRoom: "SENTIUS.FACILITY.Types.Basic.DiningRoom",
//         parlor: "SENTIUS.FACILITY.Types.Basic.Parlor",
//         courtyard: "SENTIUS.FACILITY.Types.Basic.Courtyard",
//         kitchen: "SENTIUS.FACILITY.Types.Basic.Kitchen",
//         storage: "SENTIUS.FACILITY.Types.Basic.Storage"
//       }
//     },
//     special: {
//       label: "SENTIUS.FACILITY.Types.Special.Label.one",
//       subtypes: {
//         arcaneStudy: "SENTIUS.FACILITY.Types.Special.ArcaneStudy",
//         armory: "SENTIUS.FACILITY.Types.Special.Armory",
//         barrack: "SENTIUS.FACILITY.Types.Special.Barrack",
//         garden: "SENTIUS.FACILITY.Types.Special.Garden",
//         library: "SENTIUS.FACILITY.Types.Special.Library",
//         sanctuary: "SENTIUS.FACILITY.Types.Special.Sanctuary",
//         smithy: "SENTIUS.FACILITY.Types.Special.Smithy",
//         storehouse: "SENTIUS.FACILITY.Types.Special.Storehouse",
//         workshop: "SENTIUS.FACILITY.Types.Special.Workshop",
//         gamingHall: "SENTIUS.FACILITY.Types.Special.GamingHall",
//         greenhouse: "SENTIUS.FACILITY.Types.Special.Greenhouse",
//         laboratory: "SENTIUS.FACILITY.Types.Special.Laboratory",
//         sacristy: "SENTIUS.FACILITY.Types.Special.Sacristy",
//         scriptorium: "SENTIUS.FACILITY.Types.Special.Scriptorium",
//         stable: "SENTIUS.FACILITY.Types.Special.Stable",
//         teleportationCircle: "SENTIUS.FACILITY.Types.Special.TeleportationCircle",
//         theater: "SENTIUS.FACILITY.Types.Special.Theater",
//         trainingArea: "SENTIUS.FACILITY.Types.Special.TrainingArea",
//         trophyRoom: "SENTIUS.FACILITY.Types.Special.TrophyRoom",
//         archive: "SENTIUS.FACILITY.Types.Special.Archive",
//         meditationChamber: "SENTIUS.FACILITY.Types.Special.MeditationChamber",
//         menagerie: "SENTIUS.FACILITY.Types.Special.Menagerie",
//         observatory: "SENTIUS.FACILITY.Types.Special.Observatory",
//         pub: "SENTIUS.FACILITY.Types.Special.Pub",
//         reliquary: "SENTIUS.FACILITY.Types.Special.Reliquary",
//         demiplane: "SENTIUS.FACILITY.Types.Special.Demiplane",
//         guildhall: "SENTIUS.FACILITY.Types.Special.Guildhall",
//         sanctum: "SENTIUS.FACILITY.Types.Special.Sanctum",
//         warRoom: "SENTIUS.FACILITY.Types.Special.WarRoom"
//       }
//     }
//   }
// };
// preLocalize("facilities.orders", { key: "label", sort: true });
// preLocalize("facilities.sizes", { key: "label", sort: true });
// preLocalize("facilities.types", { key: "label", sort: true });
// preLocalize("facilities.types.basic.subtypes", { sort: true });
// preLocalize("facilities.types.special.subtypes", { sort: true });

/* -------------------------------------------- */
/*  Tool Details                                */
/* -------------------------------------------- */

/**
 * The categories into which Tool items can be grouped.
 *
 * @enum {string}
 */
// SENTIUS.toolTypes = {
//   art: "SENTIUS.ToolArtisans",
//   game: "SENTIUS.ToolGamingSet",
//   music: "SENTIUS.ToolMusicalInstrument"
// };
// preLocalize("toolTypes", { sort: true });

/**
 * The categories of tool proficiencies that a character can gain.
 *
 * @enum {string}
 */
// SENTIUS.toolProficiencies = {
//   ...SENTIUS.toolTypes,
//   vehicle: "SENTIUS.ToolVehicle"
// };
// preLocalize("toolProficiencies", { sort: true });

/**
 * @typedef ToolConfiguration
 * @property {string} ability  Default ability used for the tool.
 * @property {string} id       UUID of reference tool or ID within pack defined by `SENTIUS.sourcePacks.ITEMS`.
 */

/**
 * Configuration data for tools.
 * @enum {ToolConfiguration}
 */
// SENTIUS.tools = {
//   alchemist: {
//     ability: "int",
//     id: "SztwZhbhZeCqyAes"
//   },
//   bagpipes: {
//     ability: "cha",
//     id: "yxHi57T5mmVt0oDr"
//   },
//   brewer: {
//     ability: "int",
//     id: "Y9S75go1hLMXUD48"
//   },
//   calligrapher: {
//     ability: "dex",
//     id: "jhjo20QoiD5exf09"
//   },
//   card: {
//     ability: "wis",
//     id: "YwlHI3BVJapz4a3E"
//   },
//   carpenter: {
//     ability: "str",
//     id: "8NS6MSOdXtUqD7Ib"
//   },
//   cartographer: {
//     ability: "wis",
//     id: "fC0lFK8P4RuhpfaU"
//   },
//   chess: {
//     ability: "wis",
//     id: "23y8FvWKf9YLcnBL"
//   },
//   cobbler: {
//     ability: "dex",
//     id: "hM84pZnpCqKfi8XH"
//   },
//   cook: {
//     ability: "wis",
//     id: "Gflnp29aEv5Lc1ZM"
//   },
//   dice: {
//     ability: "wis",
//     id: "iBuTM09KD9IoM5L8"
//   },
//   disg: {
//     ability: "cha",
//     id: "IBhDAr7WkhWPYLVn"
//   },
//   drum: {
//     ability: "cha",
//     id: "69Dpr25pf4BjkHKb"
//   },
//   dulcimer: {
//     ability: "cha",
//     id: "NtdDkjmpdIMiX7I2"
//   },
//   flute: {
//     ability: "cha",
//     id: "eJOrPcAz9EcquyRQ"
//   },
//   forg: {
//     ability: "dex",
//     id: "cG3m4YlHfbQlLEOx"
//   },
//   glassblower: {
//     ability: "int",
//     id: "rTbVrNcwApnuTz5E"
//   },
//   herb: {
//     ability: "int",
//     id: "i89okN7GFTWHsvPy"
//   },
//   horn: {
//     ability: "cha",
//     id: "aa9KuBy4dst7WIW9"
//   },
//   jeweler: {
//     ability: "int",
//     id: "YfBwELTgPFHmQdHh"
//   },
//   leatherworker: {
//     ability: "dex",
//     id: "PUMfwyVUbtyxgYbD"
//   },
//   lute: {
//     ability: "cha",
//     id: "qBydtUUIkv520DT7"
//   },
//   lyre: {
//     ability: "cha",
//     id: "EwG1EtmbgR3bM68U"
//   },
//   mason: {
//     ability: "str",
//     id: "skUih6tBvcBbORzA"
//   },
//   navg: {
//     ability: "wis",
//     id: "YHCmjsiXxZ9UdUhU"
//   },
//   painter: {
//     ability: "wis",
//     id: "ccm5xlWhx74d6lsK"
//   },
//   panflute: {
//     ability: "cha",
//     id: "G5m5gYIx9VAUWC3J"
//   },
//   pois: {
//     ability: "int",
//     id: "il2GNi8C0DvGLL9P"
//   },
//   potter: {
//     ability: "int",
//     id: "hJS8yEVkqgJjwfWa"
//   },
//   shawm: {
//     ability: "cha",
//     id: "G3cqbejJpfB91VhP"
//   },
//   smith: {
//     ability: "str",
//     id: "KndVe2insuctjIaj"
//   },
//   thief: {
//     ability: "dex",
//     id: "woWZ1sO5IUVGzo58"
//   },
//   tinker: {
//     ability: "dex",
//     id: "0d08g1i5WXnNrCNA"
//   },
//   viol: {
//     ability: "cha",
//     id: "baoe3U5BfMMMxhCU"
//   },
//   weaver: {
//     ability: "dex",
//     id: "ap9prThUB2y9lDyj"
//   },
//   woodcarver: {
//     ability: "dex",
//     id: "xKErqkLo4ASYr5EP"
//   }
// };

/**
 * The basic tool types in Sentius. This enables specific tool proficiencies or
 * starting equipment provided by classes and backgrounds.
 * @enum {string}
 */
// SENTIUS.toolIds = new Proxy(SENTIUS.tools, {
//   get(target, prop) {
//     return target[prop]?.id ?? target[prop];
//   },
//   set(target, prop, value) {
//     foundry.utils.logCompatibilityWarning(
//       "Appending to CONFIG.SENTIUS.toolIds is deprecated, use CONFIG.SENTIUS.tools instead.",
//       { since: "SENTIUS RPG 0.1", until: "SENTIUS RPG 0.1", once: true }
//     );
//     target[prop] ??= { ability: "int" };
//     target[prop].id = value;
//     return true;
//   }
// });

/* -------------------------------------------- */

/**
 * Time periods that accept a numeric value.
 * @enum {string}
 */
// SENTIUS.scalarTimePeriods = {
//   turn: "SENTIUS.TimeTurn",
//   round: "SENTIUS.TimeRound",
//   minute: "SENTIUS.TimeMinute",
//   hour: "SENTIUS.TimeHour",
//   day: "SENTIUS.TimeDay",
//   month: "SENTIUS.TimeMonth",
//   year: "SENTIUS.TimeYear"
// };
// preLocalize("scalarTimePeriods");

/* -------------------------------------------- */

/**
 * Time periods for spells that don't have a defined ending.
 * @enum {string}
 */
// SENTIUS.permanentTimePeriods = {
//   disp: "SENTIUS.TimeDisp",
//   dstr: "SENTIUS.TimeDispTrig",
//   perm: "SENTIUS.TimePerm"
// };
// preLocalize("permanentTimePeriods");

/* -------------------------------------------- */

/**
 * Time periods that don't accept a numeric value.
 * @enum {string}
 */
// SENTIUS.specialTimePeriods = {
//   inst: "SENTIUS.TimeInst",
//   spec: "SENTIUS.Special"
// };
// preLocalize("specialTimePeriods");

/* -------------------------------------------- */

/**
 * The various lengths of time over which effects can occur.
 * @enum {string}
 */
// SENTIUS.timePeriods = {
//   ...SENTIUS.specialTimePeriods,
//   ...SENTIUS.permanentTimePeriods,
//   ...SENTIUS.scalarTimePeriods
// };
// preLocalize("timePeriods");

/* -------------------------------------------- */

/**
 * Ways in which to activate an item that cannot be labeled with a cost.
 * @enum {string}
 */
// SENTIUS.staticAbilityActivationTypes = {
//   none: "SENTIUS.NoneActionLabel",
//   special: SENTIUS.timePeriods.spec
// };

/**
 * Various ways in which an item or ability can be activated.
 * @enum {string}
 */
// SENTIUS.abilityActivationTypes = {
//   ...SENTIUS.staticAbilityActivationTypes,
//   action: "SENTIUS.Action",
//   bonus: "SENTIUS.BonusAction",
//   reaction: "SENTIUS.Reaction",
//   minute: SENTIUS.timePeriods.minute,
//   hour: SENTIUS.timePeriods.hour,
//   day: SENTIUS.timePeriods.day,
//   legendary: "SENTIUS.LegendaryActionLabel",
//   mythic: "SENTIUS.MythicActionLabel",
//   lair: "SENTIUS.LairActionLabel",
//   crew: "SENTIUS.VehicleCrewAction"
// };
// preLocalize("abilityActivationTypes");

/* -------------------------------------------- */

/**
 * @typedef {ActivityActivationTypeConfig}
 * @property {string} label            Localized label for the activation type.
 * @property {string} [group]          Localized label for the presentational group.
 * @property {boolean} [scalar=false]  Does this activation type have a numeric value attached?
 */

/**
 * Configuration data for activation types on activities.
 * @enum {ActivityActivationTypeConfig}
 */
// SENTIUS.activityActivationTypes = {
//   action: {
//     label: "SENTIUS.Action",
//     group: "SENTIUS.ACTIVATION.Category.Standard"
//   },
//   bonus: {
//     label: "SENTIUS.BonusAction",
//     group: "SENTIUS.ACTIVATION.Category.Standard"
//   },
//   reaction: {
//     label: "SENTIUS.Reaction",
//     group: "SENTIUS.ACTIVATION.Category.Standard"
//   },
//   minute: {
//     label: "SENTIUS.TimeMinute",
//     group: "SENTIUS.ACTIVATION.Category.Time",
//     scalar: true
//   },
//   hour: {
//     label: "SENTIUS.TimeHour",
//     group: "SENTIUS.ACTIVATION.Category.Time",
//     scalar: true
//   },
//   day: {
//     label: "SENTIUS.TimeDay",
//     group: "SENTIUS.ACTIVATION.Category.Time",
//     scalar: true
//   },
//   legendary: {
//     label: "SENTIUS.LegendaryActionLabel",
//     group: "SENTIUS.ACTIVATION.Category.Monster",
//     scalar: true
//   },
//   mythic: {
//     label: "SENTIUS.MythicActionLabel",
//     group: "SENTIUS.ACTIVATION.Category.Monster",
//     scalar: true
//   },
//   lair: {
//     label: "SENTIUS.LairActionLabel",
//     group: "SENTIUS.ACTIVATION.Category.Monster"
//   },
//   crew: {
//     label: "SENTIUS.VehicleCrewAction",
//     group: "SENTIUS.ACTIVATION.Category.Vehicle",
//     scalar: true
//   },
//   special: {
//     label: "SENTIUS.Special"
//   }
// };
// preLocalize("activityActivationTypes", { key: "label" });

/* -------------------------------------------- */

/**
 * Different things that an ability can consume upon use.
 * @enum {string}
 */
// SENTIUS.abilityConsumptionTypes = {
//   ammo: "SENTIUS.ConsumeAmmunition",
//   attribute: "SENTIUS.ConsumeAttribute",
//   hitDice: "SENTIUS.ConsumeHitDice",
//   material: "SENTIUS.ConsumeMaterial",
//   charges: "SENTIUS.ConsumeCharges"
// };
// preLocalize("abilityConsumptionTypes", { sort: true });

/* -------------------------------------------- */

/**
 * @typedef {object} ActivityConsumptionTargetConfig
 * @property {string} label                                     Localized label for the target type.
 * @property {ConsumptionConsumeFunction} consume               Function used to consume according to this type.
 * @property {ConsumptionLabelsFunction} consumptionLabels      Function used to generate a hint of consumption amount.
 * @property {{value: string, label: string}[]} [scalingModes]  Additional scaling modes for this consumption type in
 *                                                              addition to the default "amount" scaling.
 * @property {boolean} [targetRequiresEmbedded]                 Use text input rather than select when not embedded.
 * @property {ConsumptionValidTargetsFunction} [validTargets]   Function for creating an array of consumption targets.
 */

/**
 * @callback ConsumptionConsumeFunction
 * @this {ConsumptionTargetData}
 * @param {ActivityUseConfiguration} config  Configuration data for the activity usage.
 * @param {ActivityUsageUpdates} updates     Updates to be performed.
 * @throws ConsumptionError
 */

/**
 * @callback ConsumptionLabelsFunction
 * @this {ConsumptionTargetData}
 * @param {ActivityUseConfiguration} config  Configuration data for the activity usage.
 * @param {object} [options={}]
 * @param {boolean} [options.consumed]       Is this consumption currently set to be consumed?
 * @returns {ConsumptionLabels}
 */

/**
 * @typedef ConsumptionLabels
 * @property {string} label      Label displayed for the consumption checkbox.
 * @property {string} hint       Hint text describing what should be consumed.
 * @property {{ type: string, message: string }} [notes]  Additional notes relating to the consumption to be performed.
 * @property {boolean} [warn]    Display a warning icon indicating consumption will fail.
 */

/**
 * @callback ConsumptionValidTargetsFunction
 * @this {ConsumptionTargetData}
 * @returns {FormSelectOption[]}
 */

/**
 * Configuration information for different consumption targets.
 * @enum {ActivityConsumptionTargetConfig}
 */
// SENTIUS.activityConsumptionTypes = {
//   activityUses: {
//     label: "SENTIUS.CONSUMPTION.Type.ActivityUses.Label",
//     consume: ConsumptionTargetData.consumeActivityUses,
//     consumptionLabels: ConsumptionTargetData.consumptionLabelsActivityUses
//   },
//   itemUses: {
//     label: "SENTIUS.CONSUMPTION.Type.ItemUses.Label",
//     consume: ConsumptionTargetData.consumeItemUses,
//     consumptionLabels: ConsumptionTargetData.consumptionLabelsItemUses,
//     targetRequiresEmbedded: true,
//     validTargets: ConsumptionTargetData.validItemUsesTargets
//   },
//   material: {
//     label: "SENTIUS.CONSUMPTION.Type.Material.Label",
//     consume: ConsumptionTargetData.consumeMaterial,
//     consumptionLabels: ConsumptionTargetData.consumptionLabelsMaterial,
//     targetRequiresEmbedded: true,
//     validTargets: ConsumptionTargetData.validMaterialTargets
//   },
//   hitDice: {
//     label: "SENTIUS.CONSUMPTION.Type.HitDice.Label",
//     consume: ConsumptionTargetData.consumeHitDice,
//     consumptionLabels: ConsumptionTargetData.consumptionLabelsHitDice,
//     validTargets: ConsumptionTargetData.validHitDiceTargets
//   },
//   spellSlots: {
//     label: "SENTIUS.CONSUMPTION.Type.SpellSlots.Label",
//     consume: ConsumptionTargetData.consumeSpellSlots,
//     consumptionLabels: ConsumptionTargetData.consumptionLabelsSpellSlots,
//     scalingModes: [{ value: "level", label: "SENTIUS.CONSUMPTION.Scaling.SlotLevel" }],
//     validTargets: ConsumptionTargetData.validSpellSlotsTargets
//   },
//   attribute: {
//     label: "SENTIUS.CONSUMPTION.Type.Attribute.Label",
//     consume: ConsumptionTargetData.consumeAttribute,
//     consumptionLabels: ConsumptionTargetData.consumptionLabelsAttribute,
//     targetRequiresEmbedded: true,
//     validTargets: ConsumptionTargetData.validAttributeTargets
//   }
// };
// preLocalize("activityConsumptionTypes", { key: "label" });

/* -------------------------------------------- */

/**
 * Configuration data for actor sizes.
 *
 * @typedef {object} ActorSizeConfiguration
 * @property {string} label                   Localized label.
 * @property {string} abbreviation            Localized abbreviation.
 * @property {number} hitDie                  Default hit die denomination for NPCs of this size.
 * @property {number} [token=1]               Default token size.
 * @property {number} [capacityMultiplier=1]  Multiplier used to calculate carrying capacities.
 */

/**
 * Creature sizes ordered from smallest to largest.
 * @enum {ActorSizeConfiguration}
 */
// SENTIUS.actorSizes = {
//   tiny: {
//     label: "SENTIUS.SizeTiny",
//     abbreviation: "SENTIUS.SizeTinyAbbr",
//     hitDie: 4,
//     token: 0.5,
//     capacityMultiplier: 0.5
//   },
//   sm: {
//     label: "SENTIUS.SizeSmall",
//     abbreviation: "SENTIUS.SizeSmallAbbr",
//     hitDie: 6,
//     dynamicTokenScale: 0.8
//   },
//   med: {
//     label: "SENTIUS.SizeMedium",
//     abbreviation: "SENTIUS.SizeMediumAbbr",
//     hitDie: 8
//   },
//   lg: {
//     label: "SENTIUS.SizeLarge",
//     abbreviation: "SENTIUS.SizeLargeAbbr",
//     hitDie: 10,
//     token: 2,
//     capacityMultiplier: 2
//   },
//   huge: {
//     label: "SENTIUS.SizeHuge",
//     abbreviation: "SENTIUS.SizeHugeAbbr",
//     hitDie: 12,
//     token: 3,
//     capacityMultiplier: 4
//   },
//   grg: {
//     label: "SENTIUS.SizeGargantuan",
//     abbreviation: "SENTIUS.SizeGargantuanAbbr",
//     hitDie: 20,
//     token: 4,
//     capacityMultiplier: 8
//   }
// };
// preLocalize("actorSizes", { keys: ["label", "abbreviation"] });

/* -------------------------------------------- */
/*  Canvas                                      */
/* -------------------------------------------- */

/**
 * Colors used to visualize temporary and temporary maximum HP in token health bars.
 * @enum {number}
 */
// SENTIUS.tokenHPColors = {
//   damage: 0xFF0000,
//   healing: 0x00FF00,
//   temp: 0x66CCFF,
//   tempmax: 0x440066,
//   negmax: 0x550000
// };

/* -------------------------------------------- */

/**
 * Colors used when a dynamic token ring effects.
 * @enum {number}
 */
// SENTIUS.tokenRingColors = {
//   damage: 0xFF0000,
//   defeated: 0x000000,
//   healing: 0x00FF00,
//   temp: 0x33AAFF
// };

/* -------------------------------------------- */

/**
 * Configuration data for a map marker style. Options not included will fall back to the value set in `default` style.
 * Any additional styling options added will be passed into the custom marker class and be available for rendering.
 *
 * @typedef {object} MapLocationMarkerStyle
 * @property {typeof PIXI.Container} [icon]  Map marker class used to render the icon.
 * @property {number} [backgroundColor]      Color of the background inside the circle.
 * @property {number} [borderColor]          Color of the border in normal state.
 * @property {number} [borderHoverColor]     Color of the border when hovering over the marker.
 * @property {string} [fontFamily]           Font used for rendering the code on the marker.
 * @property {number} [shadowColor]          Color of the shadow under the marker.
 * @property {number} [textColor]            Color of the text on the marker.
 */

/**
 * Settings used to render map location markers on the canvas.
 * @enum {MapLocationMarkerStyle}
 */
// SENTIUS.mapLocationMarker = {
//   default: {
//     icon: MapLocationControlIcon,
//     backgroundColor: 0xFBF8F5,
//     borderColor: 0x000000,
//     borderHoverColor: 0xFF5500,
//     fontFamily: "Roboto Slab",
//     shadowColor: 0x000000,
//     textColor: 0x000000
//   }
// };

/* -------------------------------------------- */

/**
 * Configuration data for creature types.
 *
 * @typedef {object} CreatureTypeConfiguration
 * @property {string} label               Localized label.
 * @property {string} plural              Localized plural form used in swarm name.
 * @property {string} [reference]         Reference to a rule page describing this type.
 * @property {boolean} [detectAlignment]  Is this type detectable by spells such as "Detect Evil and Good"?
 */

/**
 * Default types of creatures.
 * @enum {CreatureTypeConfiguration}
 */
// SENTIUS.creatureTypes = {
//   aberration: {
//     label: "SENTIUS.CreatureAberration",
//     plural: "SENTIUS.CreatureAberrationPl",
//     icon: "icons/creatures/tentacles/tentacle-eyes-yellow-pink.webp",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.yy50qVC1JhPHt4LC",
//     detectAlignment: true
//   },
//   beast: {
//     label: "SENTIUS.CreatureBeast",
//     plural: "SENTIUS.CreatureBeastPl",
//     icon: "icons/creatures/claws/claw-bear-paw-swipe-red.webp",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.6bTHn7pZek9YX2tv"
//   },
//   celestial: {
//     label: "SENTIUS.CreatureCelestial",
//     plural: "SENTIUS.CreatureCelestialPl",
//     icon: "icons/creatures/abilities/wings-birdlike-blue.webp",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.T5CJwxjhBbi6oqaM",
//     detectAlignment: true
//   },
//   construct: {
//     label: "SENTIUS.CreatureConstruct",
//     plural: "SENTIUS.CreatureConstructPl",
//     icon: "icons/creatures/magical/construct-stone-earth-gray.webp",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.jQGAJZBZTqDFod8d"
//   },
//   dragon: {
//     label: "SENTIUS.CreatureDragon",
//     plural: "SENTIUS.CreatureDragonPl",
//     icon: "icons/creatures/abilities/dragon-fire-breath-orange.webp",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.k2IRXZwGk9W0PM2S"
//   },
//   elemental: {
//     label: "SENTIUS.CreatureElemental",
//     plural: "SENTIUS.CreatureElementalPl",
//     icon: "icons/creatures/magical/spirit-fire-orange.webp",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.7z1LXGGkXpHuzkFh",
//     detectAlignment: true
//   },
//   fey: {
//     label: "SENTIUS.CreatureFey",
//     plural: "SENTIUS.CreatureFeyPl",
//     icon: "icons/creatures/magical/fae-fairy-winged-glowing-green.webp",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.OFsRUt3pWljgm8VC",
//     detectAlignment: true
//   },
//   fiend: {
//     label: "SENTIUS.CreatureFiend",
//     plural: "SENTIUS.CreatureFiendPl",
//     icon: "icons/magic/death/skull-horned-goat-pentagram-red.webp",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.ElHKBJeiJPC7gj6k",
//     detectAlignment: true
//   },
//   giant: {
//     label: "SENTIUS.CreatureGiant",
//     plural: "SENTIUS.CreatureGiantPl",
//     icon: "icons/creatures/magical/humanoid-giant-forest-blue.webp",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.AOXn3Mv5vPZwo0Uf"
//   },
//   humanoid: {
//     label: "SENTIUS.CreatureHumanoid",
//     plural: "SENTIUS.CreatureHumanoidPl",
//     icon: "icons/environment/people/group.webp",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.iFzQs4AenN8ALRvw"
//   },
//   monstrosity: {
//     label: "SENTIUS.CreatureMonstrosity",
//     plural: "SENTIUS.CreatureMonstrosityPl",
//     icon: "icons/creatures/abilities/mouth-teeth-rows-red.webp",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.TX0yPEFTn79AMZ8P"
//   },
//   ooze: {
//     label: "SENTIUS.CreatureOoze",
//     plural: "SENTIUS.CreatureOozePl",
//     icon: "icons/creatures/slimes/slime-movement-pseudopods-green.webp",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.cgzIC1ecG03D97Fg"
//   },
//   plant: {
//     label: "SENTIUS.CreaturePlant",
//     plural: "SENTIUS.CreaturePlantPl",
//     icon: "icons/magic/nature/tree-animated-strike.webp",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.1oT7t6tHE4kZuSN1"
//   },
//   undead: {
//     label: "SENTIUS.CreatureUndead",
//     plural: "SENTIUS.CreatureUndeadPl",
//     icon: "icons/magic/death/skull-horned-worn-fire-blue.webp",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.D2BdqS1GeD5rcZ6q",
//     detectAlignment: true
//   }
// };
// preLocalize("creatureTypes", { keys: ["label", "plural"], sort: true });

/* -------------------------------------------- */

/**
 * Classification types for item action types.
 * @enum {string}
 */
// SENTIUS.itemActionTypes = {
//   mwak: "SENTIUS.ActionMWAK",
//   rwak: "SENTIUS.ActionRWAK",
//   msak: "SENTIUS.ActionMSAK",
//   rsak: "SENTIUS.ActionRSAK",
//   abil: "SENTIUS.ActionAbil",
//   save: "SENTIUS.ActionSave",
//   ench: "SENTIUS.ActionEnch",
//   summ: "SENTIUS.ActionSumm",
//   heal: "SENTIUS.ActionHeal",
//   util: "SENTIUS.ActionUtil",
//   other: "SENTIUS.ActionOther"
// };
// preLocalize("itemActionTypes");

/* -------------------------------------------- */

/**
 * Different ways in which item capacity can be limited.
 * @enum {string}
 */
// SENTIUS.itemCapacityTypes = {
//   items: "SENTIUS.ItemContainerCapacityItems",
//   weight: "SENTIUS.ItemContainerCapacityWeight"
// };
// preLocalize("itemCapacityTypes", { sort: true });

/* -------------------------------------------- */

/**
 * List of various item rarities.
 * @enum {string}
 */
// SENTIUS.itemRarity = {
//   common: "SENTIUS.ItemRarityCommon",
//   uncommon: "SENTIUS.ItemRarityUncommon",
//   rare: "SENTIUS.ItemRarityRare",
//   veryRare: "SENTIUS.ItemRarityVeryRare",
//   legendary: "SENTIUS.ItemRarityLegendary",
//   artifact: "SENTIUS.ItemRarityArtifact"
// };
// preLocalize("itemRarity");

/* -------------------------------------------- */

/**
 * Configuration data for limited use periods.
 *
 * @typedef {object} LimitedUsePeriodConfiguration
 * @property {string} label           Localized label.
 * @property {string} abbreviation    Shorthand form of the label.
 * @property {boolean} [formula]      Whether this limited use period restores charges via formula.
 */

/**
 * Enumerate the lengths of time over which an item can have limited use ability.
 * @enum {LimitedUsePeriodConfiguration}
 */
// SENTIUS.limitedUsePeriods = {
//   lr: {
//     label: "SENTIUS.UsesPeriods.Lr",
//     abbreviation: "SENTIUS.UsesPeriods.LrAbbreviation"
//   },
//   sr: {
//     label: "SENTIUS.UsesPeriods.Sr",
//     abbreviation: "SENTIUS.UsesPeriods.SrAbbreviation"
//   },
//   day: {
//     label: "SENTIUS.UsesPeriods.Day",
//     abbreviation: "SENTIUS.UsesPeriods.DayAbbreviation"
//   },
//   charges: {
//     label: "SENTIUS.UsesPeriods.Charges",
//     abbreviation: "SENTIUS.UsesPeriods.ChargesAbbreviation",
//     formula: true,
//     deprecated: true
//   },
//   dawn: {
//     label: "SENTIUS.UsesPeriods.Dawn",
//     abbreviation: "SENTIUS.UsesPeriods.DawnAbbreviation",
//     formula: true
//   },
//   dusk: {
//     label: "SENTIUS.UsesPeriods.Dusk",
//     abbreviation: "SENTIUS.UsesPeriods.DuskAbbreviation",
//     formula: true
//   }
// };
// preLocalize("limitedUsePeriods", { keys: ["label", "abbreviation"] });

/* -------------------------------------------- */

/**
 * Periods at which enchantments can be re-bound to new items.
 * @enum {{ label: string }}
 */
// SENTIUS.enchantmentPeriods = {
//   sr: {
//     label: "SENTIUS.UsesPeriods.Sr"
//   },
//   lr: {
//     label: "SENTIUS.UsesPeriods.Lr"
//   },
//   atwill: {
//     label: "SENTIUS.UsesPeriods.AtWill"
//   }
// };
// preLocalize("enchantmentPeriods", { key: "label" });

/* -------------------------------------------- */

/**
 * Specific equipment types that modify base AC.
 * @enum {string}
 */
// SENTIUS.armorTypes = {
//   light: "SENTIUS.EquipmentLight",
//   medium: "SENTIUS.EquipmentMedium",
//   heavy: "SENTIUS.EquipmentHeavy",
//   natural: "SENTIUS.EquipmentNatural",
//   shield: "SENTIUS.EquipmentShield"
// };
// preLocalize("armorTypes");

/* -------------------------------------------- */

/**
 * Equipment types that aren't armor.
 * @enum {string}
 */
// SENTIUS.miscEquipmentTypes = {
//   clothing: "SENTIUS.EQUIPMENT.Type.Clothing.Label",
//   ring: "SENTIUS.EQUIPMENT.Type.Ring.Label",
//   rod: "SENTIUS.EQUIPMENT.Type.Rod.Label",
//   trinket: "SENTIUS.EQUIPMENT.Type.Trinket.Label",
//   vehicle: "SENTIUS.EQUIPMENT.Type.Vehicle.Label",
//   wand: "SENTIUS.EQUIPMENT.Type.Wand.Label",
//   wondrous: "SENTIUS.EQUIPMENT.Type.Wondrous.Label"
// };
// preLocalize("miscEquipmentTypes", { sort: true });

/* -------------------------------------------- */

/**
 * The set of equipment types for armor, clothing, and other objects which can be worn by the character.
 * @enum {string}
 */
// SENTIUS.equipmentTypes = {
//   ...SENTIUS.miscEquipmentTypes,
//   ...SENTIUS.armorTypes
// };
// preLocalize("equipmentTypes", { sort: true });

/* -------------------------------------------- */

/**
 * The various types of vehicles in which characters can be proficient.
 * @enum {string}
 */
// SENTIUS.vehicleTypes = {
//   air: "SENTIUS.VehicleTypeAir",
//   land: "SENTIUS.VehicleTypeLand",
//   space: "SENTIUS.VehicleTypeSpace",
//   water: "SENTIUS.VehicleTypeWater"
// };
// preLocalize("vehicleTypes", { sort: true });

/* -------------------------------------------- */

/**
 * The set of Armor Proficiencies which a character may have.
 * @type {object}
 */
// SENTIUS.armorProficiencies = {
//   lgt: "SENTIUS.ArmorLightProficiency",
//   med: "SENTIUS.ArmorMediumProficiency",
//   hvy: "SENTIUS.ArmorHeavyProficiency",
//   shl: "SENTIUS.EquipmentShieldProficiency"
// };
// preLocalize("armorProficiencies");

/**
 * A mapping between `SENTIUS.equipmentTypes` and `SENTIUS.armorProficiencies` that
 * is used to determine if character has proficiency when adding an item.
 * @enum {(boolean|string)}
 */
// SENTIUS.armorProficienciesMap = {
//   natural: true,
//   clothing: true,
//   light: "lgt",
//   medium: "med",
//   heavy: "hvy",
//   shield: "shl"
// };

/**
 * The basic armor types in 5e. This enables specific armor proficiencies,
 * automated AC calculation in NPCs, and starting equipment.
 * @enum {string}
 */
// SENTIUS.armorIds = {
//   breastplate: "SK2HATQ4abKUlV8i",
//   chainmail: "rLMflzmxpe8JGTOA",
//   chainshirt: "p2zChy24ZJdVqMSH",
//   halfplate: "vsgmACFYINloIdPm",
//   hide: "n1V07puo0RQxPGuF",
//   leather: "WwdpHLXGX5r8uZu5",
//   padded: "GtKV1b5uqFQqpEni",
//   plate: "OjkIqlW2UpgFcjZa",
//   ringmail: "nsXZejlmgalj4he9",
//   scalemail: "XmnlF5fgIO3tg6TG",
//   splint: "cKpJmsJmU8YaiuqG",
//   studded: "TIV3B1vbrVHIhQAm"
// };

/**
 * The basic shield in 5e.
 * @enum {string}
 */
// SENTIUS.shieldIds = {
//   shield: "sSs3hSzkKBMNBgTs"
// };

/**
 * Common armor class calculations.
 * @enum {{ label: string, [formula]: string }}
 */
// SENTIUS.armorClasses = {
//   flat: {
//     label: "SENTIUS.ArmorClassFlat",
//     formula: "@attributes.ac.flat"
//   },
//   natural: {
//     label: "SENTIUS.ArmorClassNatural",
//     formula: "@attributes.ac.flat"
//   },
//   default: {
//     label: "SENTIUS.ArmorClassEquipment",
//     formula: "@attributes.ac.armor + @attributes.ac.dex"
//   },
//   mage: {
//     label: "SENTIUS.ArmorClassMage",
//     formula: "13 + @abilities.dex.mod"
//   },
//   draconic: {
//     label: "SENTIUS.ArmorClassDraconic",
//     formula: "13 + @abilities.dex.mod"
//   },
//   unarmoredMonk: {
//     label: "SENTIUS.ArmorClassUnarmoredMonk",
//     formula: "10 + @abilities.dex.mod + @abilities.wis.mod"
//   },
//   unarmoredBarb: {
//     label: "SENTIUS.ArmorClassUnarmoredBarbarian",
//     formula: "10 + @abilities.dex.mod + @abilities.con.mod"
//   },
//   unarmoredBard: {
//     label: "SENTIUS.ArmorClassUnarmoredBard",
//     formula: "10 + @abilities.dex.mod + @abilities.cha.mod"
//   },
//   custom: {
//     label: "SENTIUS.ArmorClassCustom"
//   }
// };
// preLocalize("armorClasses", { key: "label" });

/* -------------------------------------------- */

/**
 * Configuration data for an items that have sub-types.
 *
 * @typedef {object} SubtypeTypeConfiguration
 * @property {string} label                       Localized label for this type.
 * @property {Record<string, string>} [subtypes]  Enum containing localized labels for subtypes.
 */

/**
 * Enumerate the valid consumable types which are recognized by the system.
 * @enum {SubtypeTypeConfiguration}
 */
// SENTIUS.consumableTypes = {
//   ammo: {
//     label: "SENTIUS.CONSUMABLE.Type.Ammunition.Label",
//     subtypes: {
//       arrow: "SENTIUS.CONSUMABLE.Type.Ammunition.Arrow",
//       crossbowBolt: "SENTIUS.CONSUMABLE.Type.Ammunition.Bolt",
//       energyCell: "SENTIUS.CONSUMABLE.Type.Ammunition.EnergyCell",
//       firearmBullet: "SENTIUS.CONSUMABLE.Type.Ammunition.BulletFirearm",
//       slingBullet: "SENTIUS.CONSUMABLE.Type.Ammunition.BulletSling",
//       blowgunNeedle: "SENTIUS.CONSUMABLE.Type.Ammunition.Needle"
//     }
//   },
//   potion: {
//     label: "SENTIUS.CONSUMABLE.Type.Potion.Label"
//   },
//   poison: {
//     label: "SENTIUS.CONSUMABLE.Type.Poison.Label",
//     subtypes: {
//       contact: "SENTIUS.CONSUMABLE.Type.Poison.Contact",
//       ingested: "SENTIUS.CONSUMABLE.Type.Poison.Ingested",
//       inhaled: "SENTIUS.CONSUMABLE.Type.Poison.Inhaled",
//       injury: "SENTIUS.CONSUMABLE.Type.Poison.Injury"
//     }
//   },
//   food: {
//     label: "SENTIUS.CONSUMABLE.Type.Food.Label"
//   },
//   scroll: {
//     label: "SENTIUS.CONSUMABLE.Type.Scroll.Label"
//   },
//   wand: {
//     label: "SENTIUS.CONSUMABLE.Type.Wand.Label"
//   },
//   rod: {
//     label: "SENTIUS.CONSUMABLE.Type.Rod.Label"
//   },
//   trinket: {
//     label: "SENTIUS.CONSUMABLE.Type.Trinket.Label"
//   }
// };
// preLocalize("consumableTypes", { key: "label", sort: true });
// preLocalize("consumableTypes.ammo.subtypes", { sort: true });
// preLocalize("consumableTypes.poison.subtypes", { sort: true });

/* -------------------------------------------- */

/**
 * Types of containers.
 * @enum {string}
 */
// SENTIUS.containerTypes = {
//   backpack: "H8YCd689ezlD26aT",
//   barrel: "7Yqbqg5EtVW16wfT",
//   basket: "Wv7HzD6dv1P0q78N",
//   boltcase: "eJtPBiZtr2pp6ynt",
//   bottle: "HZp69hhyNZUUCipF",
//   bucket: "mQVYcHmMSoCUnBnM",
//   case: "5mIeX824uMklU3xq",
//   chest: "2YbuclKfhDL0bU4u",
//   flask: "lHS63sC6bypENNlR",
//   jug: "0ZBWwjFz3nIAXMLW",
//   pot: "M8xM8BLK4tpUayEE",
//   pitcher: "nXWdGtzi8DXDLLsL",
//   pouch: "9bWTRRDym06PzSAf",
//   quiver: "4MtQKPn9qMWCFjDA",
//   sack: "CNdDj8dsXVpRVpXt",
//   saddlebags: "TmfaFUSZJAotndn9",
//   tankard: "uw6fINSmZ2j2o57A",
//   vial: "meJEfX3gZgtMX4x2"
// };

/* -------------------------------------------- */

/**
 * Configuration data for spellcasting foci.
 *
 * @typedef {object} SpellcastingFocusConfiguration
 * @property {string} label                    Localized label for this category.
 * @property {Object<string, string>} itemIds  Item IDs or UUIDs.
 */

/**
 * Type of spellcasting foci.
 * @enum {SpellcastingFocusConfiguration}
 */
// SENTIUS.focusTypes = {
//   arcane: {
//     label: "SENTIUS.Focus.Arcane",
//     itemIds: {
//       crystal: "uXOT4fYbgPY8DGdd",
//       orb: "tH5Rn0JVRG1zdmPa",
//       rod: "OojyyGfh91iViuMF",
//       staff: "BeKIrNIvNHRPQ4t5",
//       wand: "KA2P6I48iOWlnboO"
//     }
//   },
//   druidic: {
//     label: "SENTIUS.Focus.Druidic",
//     itemIds: {
//       mistletoe: "xDK9GQd2iqOGH8Sd",
//       totem: "PGL6aaM0wE5h0VN5",
//       woodenstaff: "FF1ktpb2YSiyv896",
//       yewwand: "t5yP0d7YaKwuKKiH"
//     }
//   },
//   holy: {
//     label: "SENTIUS.Focus.Holy",
//     itemIds: {
//       amulet: "paqlMjggWkBIAeCe",
//       emblem: "laVqttkGMW4B9654",
//       reliquary: "gP1URGq3kVIIFHJ7"
//     }
//   }
// };
// preLocalize("focusTypes", { key: "label" });

/* -------------------------------------------- */

/**
 * Types of "features" items.
 * @enum {SubtypeTypeConfiguration}
 */
// SENTIUS.featureTypes = {
//   background: {
//     label: "SENTIUS.Feature.Background"
//   },
//   class: {
//     label: "SENTIUS.Feature.Class.Label",
//     subtypes: {
//       arcaneShot: "SENTIUS.Feature.Class.ArcaneShot",
//       artificerInfusion: "SENTIUS.Feature.Class.ArtificerInfusion",
//       channelDivinity: "SENTIUS.Feature.Class.ChannelDivinity",
//       defensiveTactic: "SENTIUS.Feature.Class.DefensiveTactic",
//       eldritchInvocation: "SENTIUS.Feature.Class.EldritchInvocation",
//       elementalDiscipline: "SENTIUS.Feature.Class.ElementalDiscipline",
//       fightingStyle: "SENTIUS.Feature.Class.FightingStyle",
//       huntersPrey: "SENTIUS.Feature.Class.HuntersPrey",
//       ki: "SENTIUS.Feature.Class.Ki",
//       maneuver: "SENTIUS.Feature.Class.Maneuver",
//       metamagic: "SENTIUS.Feature.Class.Metamagic",
//       multiattack: "SENTIUS.Feature.Class.Multiattack",
//       pact: "SENTIUS.Feature.Class.PactBoon",
//       psionicPower: "SENTIUS.Feature.Class.PsionicPower",
//       rune: "SENTIUS.Feature.Class.Rune",
//       superiorHuntersDefense: "SENTIUS.Feature.Class.SuperiorHuntersDefense"
//     }
//   },
//   monster: {
//     label: "SENTIUS.Feature.Monster"
//   },
//   race: {
//     label: "SENTIUS.Feature.Species"
//   },
//   enchantment: {
//     label: "SENTIUS.ENCHANTMENT.Label",
//     subtypes: {
//       artificerInfusion: "SENTIUS.Feature.Class.ArtificerInfusion",
//       rune: "SENTIUS.Feature.Class.Rune"
//     }
//   },
//   feat: {
//     label: "SENTIUS.Feature.Feat.Label",
//     subtypes: {
//       general: "SENTIUS.Feature.Feat.General",
//       origin: "SENTIUS.Feature.Feat.Origin",
//       fightingStyle: "SENTIUS.Feature.Feat.FightingStyle",
//       epicBoon: "SENTIUS.Feature.Feat.EpicBoon"
//     }
//   },
//   supernaturalGift: {
//     label: "SENTIUS.Feature.SupernaturalGift.Label",
//     subtypes: {
//       blessing: "SENTIUS.Feature.SupernaturalGift.Blessing",
//       charm: "SENTIUS.Feature.SupernaturalGift.Charm",
//       epicBoon: "SENTIUS.Feature.SupernaturalGift.EpicBoon"
//     }
//   }
// };
// preLocalize("featureTypes", { key: "label" });
// preLocalize("featureTypes.class.subtypes", { sort: true });
// preLocalize("featureTypes.enchantment.subtypes", { sort: true });
// preLocalize("featureTypes.feat.subtypes", { sort: true });
// preLocalize("featureTypes.supernaturalGift.subtypes", { sort: true });

/* -------------------------------------------- */

/**
 * Configuration data for item properties.
 *
 * @typedef {object} ItemPropertyConfiguration
 * @property {string} label           Localized label.
 * @property {string} [abbreviation]  Localized abbreviation.
 * @property {string} [icon]          Icon that can be used in certain places to represent this property.
 * @property {string} [reference]     Reference to a rule page describing this property.
 * @property {boolean} [isPhysical]   Is this property one that can cause damage resistance bypasses?
 * @property {boolean} [isTag]        Is this spell property a tag, rather than a component?
 */

/**
 * The various properties of all item types.
 * @enum {ItemPropertyConfiguration}
 */
// SENTIUS.itemProperties = {
//   ada: {
//     label: "SENTIUS.Item.Property.Adamantine",
//     isPhysical: true
//   },
//   amm: {
//     label: "SENTIUS.Item.Property.Ammunition"
//   },
//   concentration: {
//     label: "SENTIUS.Item.Property.Concentration",
//     abbreviation: "SENTIUS.ConcentrationAbbr",
//     icon: "systems/sentius/icons/svg/statuses/concentrating.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.ow58p27ctAnr4VPH",
//     isTag: true
//   },
//   fin: {
//     label: "SENTIUS.Item.Property.Finesse"
//   },
//   fir: {
//     label: "SENTIUS.Item.Property.Firearm"
//   },
//   foc: {
//     label: "SENTIUS.Item.Property.Focus"
//   },
//   hvy: {
//     label: "SENTIUS.Item.Property.Heavy"
//   },
//   lgt: {
//     label: "SENTIUS.Item.Property.Light"
//   },
//   lod: {
//     label: "SENTIUS.Item.Property.Loading"
//   },
//   material: {
//     label: "SENTIUS.Item.Property.Material",
//     abbreviation: "SENTIUS.ComponentMaterialAbbr",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.AeH5eDS4YeM9RETC"
//   },
//   mgc: {
//     label: "SENTIUS.Item.Property.Magical",
//     icon: "systems/sentius/icons/svg/properties/magical.svg",
//     isPhysical: true
//   },
//   rch: {
//     label: "SENTIUS.Item.Property.Reach"
//   },
//   rel: {
//     label: "SENTIUS.Item.Property.Reload"
//   },
//   ret: {
//     label: "SENTIUS.Item.Property.Returning"
//   },
//   ritual: {
//     label: "SENTIUS.Item.Property.Ritual",
//     abbreviation: "SENTIUS.RitualAbbr",
//     icon: "systems/sentius/icons/svg/items/spell.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.FjWqT5iyJ89kohdA",
//     isTag: true
//   },
//   sil: {
//     label: "SENTIUS.Item.Property.Silvered",
//     isPhysical: true
//   },
//   somatic: {
//     label: "SENTIUS.Item.Property.Somatic",
//     abbreviation: "SENTIUS.ComponentSomaticAbbr",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.qwUNgUNilEmZkSC9"
//   },
//   spc: {
//     label: "SENTIUS.Item.Property.Special"
//   },
//   stealthDisadvantage: {
//     label: "SENTIUS.Item.Property.StealthDisadvantage"
//   },
//   thr: {
//     label: "SENTIUS.Item.Property.Thrown"
//   },
//   trait: {
//     label: "SENTIUS.Item.Property.Trait"
//   },
//   two: {
//     label: "SENTIUS.Item.Property.TwoHanded"
//   },
//   ver: {
//     label: "SENTIUS.Item.Property.Versatile"
//   },
//   vocal: {
//     label: "SENTIUS.Item.Property.Verbal",
//     abbreviation: "SENTIUS.ComponentVerbalAbbr",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.6UXTNWMCQ0nSlwwx"
//   },
//   weightlessContents: {
//     label: "SENTIUS.Item.Property.WeightlessContents"
//   }
// };
// preLocalize("itemProperties", { keys: ["label", "abbreviation"], sort: true });

/* -------------------------------------------- */

/**
 * The various properties of an item per item type.
 * @enum {object}
 */
// SENTIUS.validProperties = {
//   consumable: new Set([
//     "mgc"
//   ]),
//   container: new Set([
//     "mgc",
//     "weightlessContents"
//   ]),
//   equipment: new Set([
//     "ada",
//     "foc",
//     "mgc",
//     "stealthDisadvantage"
//   ]),
//   feat: new Set([
//     "mgc",
//     "trait"
//   ]),
//   loot: new Set([
//     "mgc"
//   ]),
//   weapon: new Set([
//     "ada",
//     "amm",
//     "fin",
//     "fir",
//     "foc",
//     "hvy",
//     "lgt",
//     "lod",
//     "mgc",
//     "rch",
//     "rel",
//     "ret",
//     "sil",
//     "spc",
//     "thr",
//     "two",
//     "ver"
//   ]),
//   spell: new Set([
//     "vocal",
//     "somatic",
//     "material",
//     "concentration",
//     "ritual"
//   ]),
//   tool: new Set([
//     "mgc"
//   ])
// };

/* -------------------------------------------- */

/**
 * Configuration data for an item with the "loot" type.
 *
 * @typedef {object} LootTypeConfiguration
 * @property {string} label                       Localized label for this type.
 */

/**
 * Types of "loot" items.
 * @enum {LootTypeConfiguration}
 */
// SENTIUS.lootTypes = {
//   art: {
//     label: "SENTIUS.Loot.Art"
//   },
//   gear: {
//     label: "SENTIUS.Loot.Gear"
//   },
//   gem: {
//     label: "SENTIUS.Loot.Gem"
//   },
//   junk: {
//     label: "SENTIUS.Loot.Junk"
//   },
//   material: {
//     label: "SENTIUS.Loot.Material"
//   },
//   resource: {
//     label: "SENTIUS.Loot.Resource"
//   },
//   treasure: {
//     label: "SENTIUS.Loot.Treasure"
//   }
// };
// preLocalize("lootTypes", { key: "label" });

/* -------------------------------------------- */

/**
 * @typedef {object} CurrencyConfiguration
 * @property {string} label         Localized label for the currency.
 * @property {string} abbreviation  Localized abbreviation for the currency.
 * @property {number} conversion    Number by which this currency should be multiplied to arrive at a standard value.
 * @property {string} icon          Icon representing the currency in the interface.
 */

/**
 * The valid currency denominations with localized labels, abbreviations, and conversions.
 * The conversion number defines how many of that currency are equal to one GP.
 * @enum {CurrencyConfiguration}
 */
// SENTIUS.currencies = {
//   pp: {
//     label: "SENTIUS.CurrencyPP",
//     abbreviation: "SENTIUS.CurrencyAbbrPP",
//     conversion: 0.1,
//     icon: "systems/sentius/icons/currency/platinum.webp"
//   },
//   gp: {
//     label: "SENTIUS.CurrencyGP",
//     abbreviation: "SENTIUS.CurrencyAbbrGP",
//     conversion: 1,
//     icon: "systems/sentius/icons/currency/gold.webp"
//   },
//   ep: {
//     label: "SENTIUS.CurrencyEP",
//     abbreviation: "SENTIUS.CurrencyAbbrEP",
//     conversion: 2,
//     icon: "systems/sentius/icons/currency/electrum.webp"
//   },
//   sp: {
//     label: "SENTIUS.CurrencySP",
//     abbreviation: "SENTIUS.CurrencyAbbrSP",
//     conversion: 10,
//     icon: "systems/sentius/icons/currency/silver.webp"
//   },
//   cp: {
//     label: "SENTIUS.CurrencyCP",
//     abbreviation: "SENTIUS.CurrencyAbbrCP",
//     conversion: 100,
//     icon: "systems/sentius/icons/currency/copper.webp"
//   }
// };
// preLocalize("currencies", { keys: ["label", "abbreviation"] });

/* -------------------------------------------- */

/**
 * @typedef CraftingConfiguration
 * @property {CraftingCostsMultiplier} consumable        Discounts for crafting a magical consumable.
 * @property {Record<string, CraftingCosts>} exceptions  Crafting costs for items that are exception to the general
 *                                                       crafting rules, by identifier.
 * @property {Record<string, CraftingCosts>} magic       Magic item crafting costs by rarity.
 * @property {CraftingCostsMultiplier} mundane           Multipliers for crafting mundane items.
 * @property {Record<number, CraftingCosts>} scrolls     Crafting costs for spell scrolls by level.
 */

/**
 * @typedef CraftingCostsMultiplier
 * @property {number} days  The days multiplier.
 * @property {number} gold  The gold multiplier.
 */

/**
 * @typedef CraftingCosts
 * @property {number} days  The number of days required to craft the item, not including its base item.
 * @property {number} gold  The amount of gold required for the raw materials, not including the base item.
 */

/**
 * Configuration data for crafting costs.
 * @type {CraftingConfiguration}
 */
// SENTIUS.crafting = {
//   consumable: {
//     days: .5,
//     gold: .5
//   },
//   exceptions: {
//     "potion-of-healing": {
//       days: 1,
//       gold: 25
//     }
//   },
//   magic: {
//     common: {
//       days: 5,
//       gold: 50
//     },
//     uncommon: {
//       days: 10,
//       gold: 200
//     },
//     rare: {
//       days: 50,
//       gold: 2_000
//     },
//     veryRare: {
//       days: 125,
//       gold: 20_000
//     },
//     legendary: {
//       days: 250,
//       gold: 100_000
//     }
//   },
//   mundane: {
//     days: .1,
//     gold: .5
//   },
//   scrolls: {
//     0: {
//       days: 1,
//       gold: 15
//     },
//     1: {
//       days: 1,
//       gold: 25
//     },
//     2: {
//       days: 3,
//       gold: 100
//     },
//     3: {
//       days: 5,
//       gold: 150
//     },
//     4: {
//       days: 10,
//       gold: 1_000
//     },
//     5: {
//       days: 25,
//       gold: 1_500
//     },
//     6: {
//       days: 40,
//       gold: 10_000
//     },
//     7: {
//       days: 50,
//       gold: 12_500
//     },
//     8: {
//       days: 60,
//       gold: 15_000
//     },
//     9: {
//       days: 120,
//       gold: 50_000
//     }
//   }
// };

/* -------------------------------------------- */
/*  Damage                                      */
/* -------------------------------------------- */

/**
 * Standard dice spread available for things like damage.
 * @type {number[]}
 */
SENTIUS.dieSteps = [4, 6, 8, 10, 12];

/* -------------------------------------------- */

/**
 * Methods by which damage scales relative to the overall scaling increase.
 * @enum {{ label: string }}
 */
// SENTIUS.damageScalingModes = {
//   whole: {
//     label: "SENTIUS.DAMAGE.Scaling.Whole"
//   },
//   half: {
//     label: "SENTIUS.DAMAGE.Scaling.Half"
//   }
// };
// preLocalize("damageScalingModes", { key: "label" });

/* -------------------------------------------- */

/**
 * Configuration data for damage types.
 *
 * @typedef {object} DamageTypeConfiguration
 * @property {string} label          Localized label.
 * @property {string} icon           Icon representing this type.
 * @property {boolean} [isPhysical]  Is this a type that can be bypassed by magical or silvered weapons?
 * @property {string} [reference]    Reference to a rule page describing this damage type.
 * @property {Color} [color]         Visual color of the damage type.
 */

/**
 * Types of damage the can be caused by abilities.
 * @enum {DamageTypeConfiguration}
 */
// SENTIUS.damageTypes = {
//   acid: {
//     label: "SENTIUS.DamageAcid",
//     icon: "systems/sentius/icons/svg/damage/acid.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.IQhbKRPe1vCPdh8v",
//     color: new Color(0x839D50)
//   },
//   bludgeoning: {
//     label: "SENTIUS.DamageBludgeoning",
//     icon: "systems/sentius/icons/svg/damage/bludgeoning.svg",
//     isPhysical: true,
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.39LFrlef94JIYO8m",
//     color: new Color(0x0000A0)
//   },
//   cold: {
//     label: "SENTIUS.DamageCold",
//     icon: "systems/sentius/icons/svg/damage/cold.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.4xsFUooHDEdfhw6g",
//     color: new Color(0xADD8E6)
//   },
//   fire: {
//     label: "SENTIUS.DamageFire",
//     icon: "systems/sentius/icons/svg/damage/fire.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.f1S66aQJi4PmOng6",
//     color: new Color(0xFF4500)
//   },
//   force: {
//     label: "SENTIUS.DamageForce",
//     icon: "systems/sentius/icons/svg/damage/force.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.eFTWzngD8dKWQuUR",
//     color: new Color(0x800080)
//   },
//   lightning: {
//     label: "SENTIUS.DamageLightning",
//     icon: "systems/sentius/icons/svg/damage/lightning.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.9SaxFJ9bM3SutaMC",
//     color: new Color(0x1E90FF)
//   },
//   necrotic: {
//     label: "SENTIUS.DamageNecrotic",
//     icon: "systems/sentius/icons/svg/damage/necrotic.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.klOVUV5G1U7iaKoG",
//     color: new Color(0x006400)
//   },
//   piercing: {
//     label: "SENTIUS.DamagePiercing",
//     icon: "systems/sentius/icons/svg/damage/piercing.svg",
//     isPhysical: true,
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.95agSnEGTdAmKhyC",
//     color: new Color(0xC0C0C0)
//   },
//   poison: {
//     label: "SENTIUS.DamagePoison",
//     icon: "systems/sentius/icons/svg/damage/poison.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.k5wOYXdWPzcWwds1",
//     color: new Color(0x8A2BE2)
//   },
//   psychic: {
//     label: "SENTIUS.DamagePsychic",
//     icon: "systems/sentius/icons/svg/damage/psychic.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.YIKbDv4zYqbE5teJ",
//     color: new Color(0xFF1493)
//   },
//   radiant: {
//     label: "SENTIUS.DamageRadiant",
//     icon: "systems/sentius/icons/svg/damage/radiant.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.5tcK9buXWDOw8yHH",
//     color: new Color(0xFFD700)
//   },
//   slashing: {
//     label: "SENTIUS.DamageSlashing",
//     icon: "systems/sentius/icons/svg/damage/slashing.svg",
//     isPhysical: true,
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.sz2XKQ5lgsdPEJOa",
//     color: new Color(0x8B0000)
//   },
//   thunder: {
//     label: "SENTIUS.DamageThunder",
//     icon: "systems/sentius/icons/svg/damage/thunder.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.iqsmMHk7FSpiNkQy",
//     color: new Color(0x708090)
//   }
// };
// preLocalize("damageTypes", { keys: ["label"], sort: true });

/* -------------------------------------------- */

/**
 * Display aggregated damage in chat cards.
 * @type {boolean}
 */
// SENTIUS.aggregateDamageDisplay = true;

/* -------------------------------------------- */
/*  Movement                                    */
/* -------------------------------------------- */

/**
 * Different types of healing that can be applied using abilities.
 * @enum {string}
 */
// SENTIUS.healingTypes = {
//   healing: {
//     label: "SENTIUS.Healing",
//     icon: "systems/sentius/icons/svg/damage/healing.svg",
//     color: new Color(0x46C252)
//   },
//   temphp: {
//     label: "SENTIUS.HealingTemp",
//     icon: "systems/sentius/icons/svg/damage/temphp.svg",
//     color: new Color(0x4B66DE)
//   }
// };
// preLocalize("healingTypes", { keys: ["label"] });

/* -------------------------------------------- */

/**
 * The valid units of measure for movement distances in the game system.
 * By default this uses the imperial units of feet and miles.
 * @enum {string}
 */
// SENTIUS.movementTypes = {
//   burrow: "SENTIUS.MovementBurrow",
//   climb: "SENTIUS.MovementClimb",
//   fly: "SENTIUS.MovementFly",
//   swim: "SENTIUS.MovementSwim",
//   walk: "SENTIUS.MovementWalk"
// };
// preLocalize("movementTypes", { sort: true });

/* -------------------------------------------- */
/*  Measurement                                 */
/* -------------------------------------------- */

/**
 * Default units used for imperial & metric settings.
 * @enum {{ imperial: string, metric: string }}
 */
SENTIUS.defaultUnits = {
  length: {
    imperial: "ft",
    metric: "m"
  },
  weight: {
    imperial: "lb",
    metric: "kg"
  }
};

/* -------------------------------------------- */

/**
 * @typedef {object} UnitConfiguration
 * @property {string} label              Localized label for the unit.
 * @property {string} abbreviation       Localized abbreviation for the unit.
 * @property {number} conversion         Multiplier used to convert between various units.
 * @property {string} [counted]          Localization path for counted plural forms in various unit display modes.
 *                                       Only necessary if non-supported unit or using a non-standard name for a
 *                                       supported unit.
 * @property {string} [formattingUnit]   Unit formatting value as supported by javascript's internationalization system:
 *                                       https://tc39.es/ecma402/#table-sanctioned-single-unit-identifiers. Only
 *                                       required if the formatting name doesn't match the unit key.
 * @property {"imperial"|"metric"} type  Whether this is an "imperial" or "metric" unit.
 */

/**
 * The valid units of measure for movement distances in the game system.
 * By default this uses the imperial units of feet and miles.
 * @enum {string}
 */
SENTIUS.movementUnits = {
  ft: {
    label: "SENTIUS.UNITS.DISTANCE.Foot.Label",
    abbreviation: "SENTIUS.UNITS.DISTANCE.Foot.Abbreviation",
    conversion: 1,
    formattingUnit: "foot",
    type: "imperial"
  },
  mi: {
    label: "SENTIUS.UNITS.DISTANCE.Mile.Label",
    abbreviation: "SENTIUS.UNITS.DISTANCE.Mile.Abbreviation",
    conversion: 5_280,
    formattingUnit: "mile",
    type: "imperial"
  },
  m: {
    label: "SENTIUS.UNITS.DISTANCE.Meter.Label",
    abbreviation: "SENTIUS.UNITS.DISTANCE.Meter.Abbreviation",
    conversion: 10 / 3,
    formattingUnit: "meter",
    type: "metric"
  },
  km: {
    label: "SENTIUS.UNITS.DISTANCE.Kilometer.Label",
    abbreviation: "SENTIUS.UNITS.DISTANCE.Kilometer.Abbreviation",
    conversion: 10_000 / 3, // Matching simplified conversion
    formattingUnit: "kilometer",
    type: "metric"
  }
};
patchConfig("movementUnits", "label", { since: "SENTIUS", until: "SENTIUS" });
preLocalize("movementUnits", { keys: ["label", "abbreviation"] });

/* -------------------------------------------- */

/**
 * The types of range that are used for measuring actions and effects.
 * @enum {string}
 */
// SENTIUS.rangeTypes = {
//   self: "SENTIUS.DistSelf",
//   touch: "SENTIUS.DistTouch",
//   spec: "SENTIUS.Special",
//   any: "SENTIUS.DistAny"
// };
// preLocalize("rangeTypes");

/* -------------------------------------------- */

/**
 * The valid units of measure for the range of an action or effect. A combination of `SENTIUS.movementUnits` and
 * `SENTIUS.rangeUnits`.
 * @enum {string}
 */
// SENTIUS.distanceUnits = {
//   ...Object.fromEntries(Object.entries(SENTIUS.movementUnits).map(([k, { label }]) => [k, label])),
//   ...SENTIUS.rangeTypes
// };
// preLocalize("distanceUnits");

/* -------------------------------------------- */

/**
 * The valid units for measurement of weight.
 * @enum {UnitConfiguration}
 */
SENTIUS.weightUnits = {
  lb: {
    label: "SENTIUS.UNITS.WEIGHT.Pound.Label",
    abbreviation: "SENTIUS.UNITS.WEIGHT.Pound.Abbreviation",
    conversion: 1,
    formattingUnit: "pound",
    type: "imperial"
  },
  tn: {
    label: "SENTIUS.UNITS.WEIGHT.Ton.Label",
    abbreviation: "SENTIUS.UNITS.WEIGHT.Ton.Abbreviation",
    counted: "SENTIUS.UNITS.WEIGHT.Ton.Counted",
    conversion: 2000,
    type: "imperial"
  },
  kg: {
    label: "SENTIUS.UNITS.WEIGHT.Kilogram.Label",
    abbreviation: "SENTIUS.UNITS.WEIGHT.Kilogram.Abbreviation",
    conversion: 2.5,
    formattingUnit: "kilogram",
    type: "metric"
  },
  Mg: {
    label: "SENTIUS.UNITS.WEIGHT.Megagram.Label",
    abbreviation: "SENTIUS.UNITS.WEIGHT.Megagram.Abbreviation",
    counted: "SENTIUS.UNITS.WEIGHT.Megagram.Counted",
    conversion: 2500,
    type: "metric"
  }
};
preLocalize("weightUnits", { keys: ["label", "abbreviation"] });

/* -------------------------------------------- */

/**
 * Encumbrance configuration data.
 *
 * @typedef {object} EncumbranceConfiguration
 * @property {Record<string, number>} currencyPerWeight  Pieces of currency that equal a base weight (lbs or kgs).
 * @property {Record<string, object>} effects            Data used to create encumbrance-related Active Effects.
 * @property {object} threshold                          Amount to multiply strength to get given capacity threshold.
 * @property {Record<string, number>} threshold.encumbered
 * @property {Record<string, number>} threshold.heavilyEncumbered
 * @property {Record<string, number>} threshold.maximum
 * @property {Record<string, {ft: number, m: number}>} speedReduction  Speed reduction caused by encumbered status.
 * @property {Record<string, number>} vehicleWeightMultiplier  Multiplier used to determine vehicle carrying capacity.
 * @property {Record<string, Record<string, string>>} baseUnits  Base units used to calculate carrying weight.
 */

/**
 * Configure aspects of encumbrance calculation so that it could be configured by modules.
 * @type {EncumbranceConfiguration}
 */
// SENTIUS.encumbrance = {
//   currencyPerWeight: {
//     imperial: 50,
//     metric: 110
//   },
//   effects: {
//     encumbered: {
//       name: "EFFECT.SENTIUS.StatusEncumbered",
//       icon: "systems/sentius/icons/svg/statuses/encumbered.svg"
//     },
//     heavilyEncumbered: {
//       name: "EFFECT.SENTIUS.StatusHeavilyEncumbered",
//       icon: "systems/sentius/icons/svg/statuses/heavily-encumbered.svg"
//     },
//     exceedingCarryingCapacity: {
//       name: "EFFECT.SENTIUS.StatusExceedingCarryingCapacity",
//       icon: "systems/sentius/icons/svg/statuses/exceeding-carrying-capacity.svg"
//     }
//   },
//   threshold: {
//     encumbered: {
//       imperial: 5,
//       metric: 2.5
//     },
//     heavilyEncumbered: {
//       imperial: 10,
//       metric: 5
//     },
//     maximum: {
//       imperial: 15,
//       metric: 7.5
//     }
//   },
//   speedReduction: {
//     encumbered: {
//       ft: 10,
//       m: 3
//     },
//     heavilyEncumbered: {
//       ft: 20,
//       m: 6
//     },
//     exceedingCarryingCapacity: {
//       ft: 5,
//       m: 1.5
//     }
//   },
//   baseUnits: {
//     default: {
//       imperial: "lb",
//       metric: "kg"
//     },
//     vehicle: {
//       imperial: "tn",
//       metric: "Mg"
//     }
//   }
// };
// preLocalize("encumbrance.effects", { key: "name" });

/* -------------------------------------------- */
/*  Targeting                                   */
/* -------------------------------------------- */

/**
 * @typedef {object} IndividualTargetDefinition
 * @property {string} label           Localized label for this type.
 * @property {string} [counted]       Localization path for counted plural forms. Only necessary for scalar types.
 * @property {boolean} [scalar=true]  Can this target take an associated numeric value?
 */

/**
 * Targeting types that apply to one or more distinct targets.
 * @enum {IndividualTargetDefinition}
 */
// SENTIUS.individualTargetTypes = {
//   self: {
//     label: "SENTIUS.TARGET.Type.Self.Label",
//     scalar: false
//   },
//   ally: {
//     label: "SENTIUS.TARGET.Type.Ally.Label",
//     counted: "SENTIUS.TARGET.Type.Ally.Counted"
//   },
//   enemy: {
//     label: "SENTIUS.TARGET.Type.Enemy.Label",
//     counted: "SENTIUS.TARGET.Type.Enemy.Counted"
//   },
//   creature: {
//     label: "SENTIUS.TARGET.Type.Creature.Label",
//     counted: "SENTIUS.TARGET.Type.Creature.Counted"
//   },
//   object: {
//     label: "SENTIUS.TARGET.Type.Object.Label",
//     counted: "SENTIUS.TARGET.Type.Object.Counted"
//   },
//   space: {
//     label: "SENTIUS.TARGET.Type.Space.Label",
//     counted: "SENTIUS.TARGET.Type.Space.Counted"
//   },
//   creatureOrObject: {
//     label: "SENTIUS.TARGET.Type.CreatureOrObject.Label",
//     counted: "SENTIUS.TARGET.Type.CreatureOrObject.Counted"
//   },
//   any: {
//     label: "SENTIUS.TARGET.Type.Any.Label",
//     counted: "SENTIUS.TARGET.Type.Target.Counted"
//   },
//   willing: {
//     label: "SENTIUS.TARGET.Type.WillingCreature.Label",
//     counted: "SENTIUS.TARGET.Type.WillingCreature.Counted"
//   }
// };
// patchConfig("individualTargetTypes", "label", { from: "SENTIUS", until: "SENTIUS" });
// preLocalize("individualTargetTypes", { key: "label" });

/* -------------------------------------------- */

/**
 * Information needed to represent different area of effect target types.
 *
 * @typedef {object} AreaTargetDefinition
 * @property {string} label        Localized label for this type.
 * @property {string} counted      Localization path for counted plural forms.
 * @property {string} template     Type of `MeasuredTemplate` create for this target type.
 * @property {string} [reference]  Reference to a rule page describing this area of effect.
 * @property {string[]} [sizes]    List of available sizes for this template. Options are chosen from the list:
 *                                 "radius", "width", "height", "length", "thickness". No more than 3 dimensions may
 *                                 be specified.
 * @property {boolean} [standard]  Is this a standard area of effect as defined explicitly by the rules?
 */

/**
 * Targeting types that cover an area.
 * @enum {AreaTargetDefinition}
 */
// SENTIUS.areaTargetTypes = {
//   circle: {
//     label: "SENTIUS.TARGET.Type.Circle.Label",
//     counted: "SENTIUS.TARGET.Type.Circle.Counted",
//     template: "circle",
//     sizes: ["radius"]
//   },
//   cone: {
//     label: "SENTIUS.TARGET.Type.Cone.Label",
//     counted: "SENTIUS.TARGET.Type.Cone.Counted",
//     template: "cone",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.DqqAOr5JnX71OCOw",
//     sizes: ["length"],
//     standard: true
//   },
//   cube: {
//     label: "SENTIUS.TARGET.Type.Cube.Label",
//     counted: "SENTIUS.TARGET.Type.Cube.Counted",
//     template: "rect",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.dRfDIwuaHmUQ06uA",
//     sizes: ["width"],
//     standard: true
//   },
//   cylinder: {
//     label: "SENTIUS.TARGET.Type.Cylinder.Label",
//     counted: "SENTIUS.TARGET.Type.Cylinder.Counted",
//     template: "circle",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.jZFp4R7tXsIqkiG3",
//     sizes: ["radius", "height"],
//     standard: true
//   },
//   line: {
//     label: "SENTIUS.TARGET.Type.Line.Label",
//     counted: "SENTIUS.TARGET.Type.Line.Counted",
//     template: "ray",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.6DOoBgg7okm9gBc6",
//     sizes: ["length", "width"],
//     standard: true
//   },
//   radius: {
//     label: "SENTIUS.TARGET.Type.Emanation.Label",
//     counted: "SENTIUS.TARGET.Type.Emanation.Counted",
//     template: "circle",
//     standard: true
//   },
//   sphere: {
//     label: "SENTIUS.TARGET.Type.Sphere.Label",
//     counted: "SENTIUS.TARGET.Type.Sphere.Counted",
//     template: "circle",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.npdEWb2egUPnB5Fa",
//     sizes: ["radius"],
//     standard: true
//   },
//   square: {
//     label: "SENTIUS.TARGET.Type.Square.Label",
//     counted: "SENTIUS.TARGET.Type.Square.Counted",
//     template: "rect",
//     sizes: ["width"]
//   },
//   wall: {
//     label: "SENTIUS.TARGET.Type.Wall.Label",
//     counted: "SENTIUS.TARGET.Type.Wall.Counted",
//     template: "ray",
//     sizes: ["length", "thickness", "height"]
//   }
// };
// preLocalize("areaTargetTypes", { key: "label", sort: true });

// Object.defineProperty(SENTIUS, "areaTargetOptions", {
//   get() {
//     const { primary, secondary } = Object.entries(this.areaTargetTypes).reduce((obj, [value, data]) => {
//       const entry = { value, label: data.label };
//       if ( data.standard ) obj.primary.push(entry);
//       else obj.secondary.push(entry);
//       return obj;
//     }, { primary: [], secondary: [] });
//     return [{ value: "", label: "" }, ...primary, { rule: true }, ...secondary];
//   }
// });

/* -------------------------------------------- */

/**
 * The types of single or area targets which can be applied to abilities.
 * @enum {string}
 */
// SENTIUS.targetTypes = {
//   ...Object.fromEntries(Object.entries(SENTIUS.individualTargetTypes).map(([k, v]) => [k, v.label])),
//   ...Object.fromEntries(Object.entries(SENTIUS.areaTargetTypes).map(([k, v]) => [k, v.label]))
// };
// preLocalize("targetTypes", { sort: true });

/* -------------------------------------------- */

/**
 * Denominations of hit dice which can apply to classes.
 * @type {string[]}
 */
// SENTIUS.hitDieTypes = ["d4", "d6", "d8", "d10", "d12"];

/* -------------------------------------------- */

/**
 * Configuration data for rest types.
 *
 * @typedef {object} RestConfiguration
 * @property {Record<string, number>} duration    Duration of different rest variants in minutes.
 * @property {boolean} recoverHitDice             Should hit dice be recovered during this rest?
 * @property {boolean} recoverHitPoints           Should hit points be recovered during this rest?
 * @property {string[]} recoverPeriods            What recovery periods should be applied when this rest is taken. The
 *                                                ordering of the periods determines which is applied if more than one
 *                                                recovery profile is found.
 * @property {Set<string>} recoverSpellSlotTypes  Types of spellcasting slots to recover during this rest.
 */

/**
 * Types of rests.
 * @enum {RestConfiguration}
 */
// SENTIUS.restTypes = {
//   short: {
//     duration: {
//       normal: 60,
//       gritty: 480,
//       epic: 1
//     },
//     recoverPeriods: ["sr"],
//     recoverSpellSlotTypes: new Set(["pact"])
//   },
//   long: {
//     duration: {
//       normal: 480,
//       gritty: 10080,
//       epic: 60
//     },
//     recoverHitDice: true,
//     recoverHitPoints: true,
//     recoverPeriods: ["lr", "sr"],
//     recoverSpellSlotTypes: new Set(["leveled", "pact"])
//   }
// };

/* -------------------------------------------- */

/**
 * The set of possible sensory perception types which an Actor may have.
 * @enum {string}
 */
// SENTIUS.senses = {
//   blindsight: "SENTIUS.SenseBlindsight",
//   darkvision: "SENTIUS.SenseDarkvision",
//   tremorsense: "SENTIUS.SenseTremorsense",
//   truesight: "SENTIUS.SenseTruesight"
// };
// preLocalize("senses", { sort: true });

/* -------------------------------------------- */
/*  Attacks                                     */
/* -------------------------------------------- */

/**
 * Classifications of attacks based on what is performing them.
 * @enum {{ label: string }}
 */
// SENTIUS.attackClassifications = {
//   weapon: {
//     label: "SENTIUS.ATTACK.Classification.Weapon"
//   },
//   spell: {
//     label: "SENTIUS.ATTACK.Classification.Spell"
//   },
//   unarmed: {
//     label: "SENTIUS.ATTACK.Classification.Unarmed"
//   }
// };
// preLocalize("attackClassifications", { key: "label" });

/* -------------------------------------------- */

/**
 * Attack modes available for weapons.
 * @enum {string}
 */
// SENTIUS.attackModes = Object.seal({
//   oneHanded: {
//     label: "SENTIUS.ATTACK.Mode.OneHanded"
//   },
//   twoHanded: {
//     label: "SENTIUS.ATTACK.Mode.TwoHanded"
//   },
//   offhand: {
//     label: "SENTIUS.ATTACK.Mode.Offhand"
//   },
//   thrown: {
//     label: "SENTIUS.ATTACK.Mode.Thrown"
//   },
//   "thrown-offhand": {
//     label: "SENTIUS.ATTACK.Mode.ThrownOffhand"
//   }
// });
// preLocalize("attackModes", { key: "label" });

/* -------------------------------------------- */

/**
 * Types of attacks based on range.
 * @enum {{ label: string }}
 */
// SENTIUS.attackTypes = Object.seal({
//   melee: {
//     label: "SENTIUS.ATTACK.Type.Melee"
//   },
//   ranged: {
//     label: "SENTIUS.ATTACK.Type.Ranged"
//   }
// });
// preLocalize("attackTypes", { key: "label" });

/* -------------------------------------------- */
/*  Spellcasting                                */
/* -------------------------------------------- */

/**
 * Define the standard slot progression by character level.
 * The entries of this array represent the spell slot progression for a full spell-caster.
 * @type {number[][]}
 */
// SENTIUS.SPELL_SLOT_TABLE = [
//   [2],
//   [3],
//   [4, 2],
//   [4, 3],
//   [4, 3, 2],
//   [4, 3, 3],
//   [4, 3, 3, 1],
//   [4, 3, 3, 2],
//   [4, 3, 3, 3, 1],
//   [4, 3, 3, 3, 2],
//   [4, 3, 3, 3, 2, 1],
//   [4, 3, 3, 3, 2, 1],
//   [4, 3, 3, 3, 2, 1, 1],
//   [4, 3, 3, 3, 2, 1, 1],
//   [4, 3, 3, 3, 2, 1, 1, 1],
//   [4, 3, 3, 3, 2, 1, 1, 1],
//   [4, 3, 3, 3, 2, 1, 1, 1, 1],
//   [4, 3, 3, 3, 3, 1, 1, 1, 1],
//   [4, 3, 3, 3, 3, 2, 1, 1, 1],
//   [4, 3, 3, 3, 3, 2, 2, 1, 1]
// ];

/* -------------------------------------------- */

/**
 * Configuration data for pact casting progression.
 *
 * @typedef {object} PactProgressionConfig
 * @property {number} slots  Number of spell slots granted.
 * @property {number} level  Level of spells that can be cast.
 */

/**
 * Define the pact slot & level progression by pact caster level.
 * @enum {PactProgressionConfig}
 */
// SENTIUS.pactCastingProgression = {
//   1: { slots: 1, level: 1 },
//   2: { slots: 2, level: 1 },
//   3: { slots: 2, level: 2 },
//   5: { slots: 2, level: 3 },
//   7: { slots: 2, level: 4 },
//   9: { slots: 2, level: 5 },
//   11: { slots: 3, level: 5 },
//   17: { slots: 4, level: 5 }
// };

/* -------------------------------------------- */

/**
 * Configuration data for spell preparation modes.
 *
 * @typedef {object} SpellPreparationModeConfiguration
 * @property {string} label           Localized name of this spell preparation type.
 * @property {boolean} [upcast]       Whether this preparation mode allows for upcasting.
 * @property {boolean} [cantrips]     Whether this mode allows for cantrips in a spellbook.
 * @property {number} [order]         The sort order of this mode in a spellbook.
 * @property {boolean} [prepares]     Whether this preparation mode prepares spells.
 */

/**
 * Various different ways a spell can be prepared.
 * @enum {SpellPreparationModeConfiguration}
 */
// SENTIUS.spellPreparationModes = {
//   prepared: {
//     label: "SENTIUS.SpellPrepPrepared",
//     upcast: true,
//     prepares: true
//   },
//   pact: {
//     label: "SENTIUS.PactMagic",
//     upcast: true,
//     cantrips: true,
//     order: 0.5
//   },
//   always: {
//     label: "SENTIUS.SpellPrepAlways",
//     upcast: true,
//     prepares: true
//   },
//   atwill: {
//     label: "SENTIUS.SpellPrepAtWill",
//     order: -30
//   },
//   innate: {
//     label: "SENTIUS.SpellPrepInnate",
//     order: -20
//   },
//   ritual: {
//     label: "SENTIUS.SpellPrepRitual",
//     order: -10
//   }
// };
// preLocalize("spellPreparationModes", { key: "label" });

/* -------------------------------------------- */

/**
 * Configuration data for different types of spellcasting supported.
 *
 * @typedef {object} SpellcastingTypeConfiguration
 * @property {string} label                               Localized label.
 * @property {string} img                                 Image used when rendered as a favorite on the sheet.
 * @property {boolean} [shortRest]                        Are these spell slots additionally restored on a short rest?
 * @property {Object<string, SpellcastingProgressionConfiguration>} [progression]  Any progression modes for this type.
 */

/**
 * Configuration data for a spellcasting progression mode.
 *
 * @typedef {object} SpellcastingProgressionConfiguration
 * @property {string} label             Localized label.
 * @property {number} [divisor=1]       Value by which the class levels are divided to determine spellcasting level.
 * @property {boolean} [roundUp=false]  Should fractional values should be rounded up by default?
 */

/**
 * Different spellcasting types and their progression.
 * @type {SpellcastingTypeConfiguration}
 */
// SENTIUS.spellcastingTypes = {
//   leveled: {
//     label: "SENTIUS.SpellProgLeveled",
//     img: "systems/sentius/icons/spell-tiers/{id}.webp",
//     progression: {
//       full: {
//         label: "SENTIUS.SpellProgFull",
//         divisor: 1
//       },
//       half: {
//         label: "SENTIUS.SpellProgHalf",
//         divisor: 2,
//         roundUp: true
//       },
//       third: {
//         label: "SENTIUS.SpellProgThird",
//         divisor: 3
//       },
//       artificer: {
//         label: "SENTIUS.SpellProgArt",
//         divisor: 2,
//         roundUp: true
//       }
//     }
//   },
//   pact: {
//     label: "SENTIUS.SpellProgPact",
//     img: "icons/magic/unholy/silhouette-robe-evil-power.webp",
//     shortRest: true
//   }
// };
// preLocalize("spellcastingTypes", { key: "label", sort: true });
// preLocalize("spellcastingTypes.leveled.progression", { key: "label" });

/* -------------------------------------------- */

/**
 * Ways in which a class can contribute to spellcasting levels.
 * @enum {string}
 */
// SENTIUS.spellProgression = {
//   none: "SENTIUS.SpellNone",
//   full: "SENTIUS.SpellProgFull",
//   half: "SENTIUS.SpellProgHalf",
//   third: "SENTIUS.SpellProgThird",
//   pact: "SENTIUS.SpellProgPact",
//   artificer: "SENTIUS.SpellProgArt"
// };
// preLocalize("spellProgression", { key: "label" });

/* -------------------------------------------- */

/**
 * Valid spell levels.
 * @enum {string}
 */
// SENTIUS.spellLevels = {
//   0: "SENTIUS.SpellLevel0",
//   1: "SENTIUS.SpellLevel1",
//   2: "SENTIUS.SpellLevel2",
//   3: "SENTIUS.SpellLevel3",
//   4: "SENTIUS.SpellLevel4",
//   5: "SENTIUS.SpellLevel5",
//   6: "SENTIUS.SpellLevel6",
//   7: "SENTIUS.SpellLevel7",
//   8: "SENTIUS.SpellLevel8",
//   9: "SENTIUS.SpellLevel9"
// };
// preLocalize("spellLevels");

/* -------------------------------------------- */

/**
 * The available choices for how spell damage scaling may be computed.
 * @enum {string}
 */
// SENTIUS.spellScalingModes = {
//   none: "SENTIUS.SpellNone",
//   cantrip: "SENTIUS.SpellCantrip",
//   level: "SENTIUS.SpellLevel"
// };
// preLocalize("spellScalingModes", { sort: true });

/* -------------------------------------------- */

/**
 * Configuration data for spell schools.
 *
 * @typedef {object} SpellSchoolConfiguration
 * @property {string} label        Localized label.
 * @property {string} icon         Spell school icon.
 * @property {string} fullKey      Fully written key used as alternate for enrichers.
 * @property {string} [reference]  Reference to a rule page describing this school.
 */

/**
 * Schools to which a spell can belong.
 * @enum {SpellSchoolConfiguration}
 */
// SENTIUS.spellSchools = {
//   abj: {
//     label: "SENTIUS.SchoolAbj",
//     icon: "systems/sentius/icons/svg/schools/abjuration.svg",
//     fullKey: "abjuration",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.849AYEWw9FHD6JNz"
//   },
//   con: {
//     label: "SENTIUS.SchoolCon",
//     icon: "systems/sentius/icons/svg/schools/conjuration.svg",
//     fullKey: "conjuration",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.TWyKMhZJZGqQ6uls"
//   },
//   div: {
//     label: "SENTIUS.SchoolDiv",
//     icon: "systems/sentius/icons/svg/schools/divination.svg",
//     fullKey: "divination",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.HoD2MwzmVbMqj9se"
//   },
//   enc: {
//     label: "SENTIUS.SchoolEnc",
//     icon: "systems/sentius/icons/svg/schools/enchantment.svg",
//     fullKey: "enchantment",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.SehPXk24ySBVOwCZ"
//   },
//   evo: {
//     label: "SENTIUS.SchoolEvo",
//     icon: "systems/sentius/icons/svg/schools/evocation.svg",
//     fullKey: "evocation",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.kGp1RNuxL2SELLRC"
//   },
//   ill: {
//     label: "SENTIUS.SchoolIll",
//     icon: "systems/sentius/icons/svg/schools/illusion.svg",
//     fullKey: "illusion",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.smEk7kvVyslFozrB"
//   },
//   nec: {
//     label: "SENTIUS.SchoolNec",
//     icon: "systems/sentius/icons/svg/schools/necromancy.svg",
//     fullKey: "necromancy",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.W0eyiV1FBmngb6Qh"
//   },
//   trs: {
//     label: "SENTIUS.SchoolTrs",
//     icon: "systems/sentius/icons/svg/schools/transmutation.svg",
//     fullKey: "transmutation",
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.IYWewSailtmv6qEb"
//   }
// };
// preLocalize("spellSchools", { key: "label", sort: true });

/* -------------------------------------------- */

/**
 * Types of spell lists.
 * @enum {string}
 */
// SENTIUS.spellListTypes = {
//   class: "TYPES.Item.class",
//   subclass: "TYPES.Item.subclass",
//   background: "TYPES.Item.background",
//   race: "TYPES.Item.race",
//   other: "JOURNALENTRYPAGE.SENTIUS.SpellList.Type.Other"
// };
// preLocalize("spellListTypes");

/* -------------------------------------------- */

/**
 * Spell scroll item ID within the `SENTIUS.sourcePacks` compendium or a full UUID for each spell level.
 * @enum {string}
 */
// SENTIUS.spellScrollIds = {
//   0: "rQ6sO7HDWzqMhSI3",
//   1: "9GSfMg0VOA2b4uFN",
//   2: "XdDp6CKh9qEvPTuS",
//   3: "hqVKZie7x9w3Kqds",
//   4: "DM7hzgL836ZyUFB1",
//   5: "wa1VF8TXHmkrrR35",
//   6: "tI3rWx4bxefNCexS",
//   7: "mtyw4NS1s7j2EJaD",
//   8: "aOrinPg7yuDZEuWr",
//   9: "O4YbkJkLlnsgUszZ"
// };

/* -------------------------------------------- */

/**
 * @typedef {object} SpellScrollValues
 * @property {number} bonus  Attack to hit bonus.
 * @property {number} dc     Saving throw DC.
 */

/**
 * Spell scroll save DCs and attack bonus values based on spell level. If matching level isn't found,
 * then the nearest level lower than it will be selected.
 * @enum {SpellScrollValues}
 */
// SENTIUS.spellScrollValues = {
//   0: { dc: 13, bonus: 5 },
//   3: { dc: 15, bonus: 7 },
//   5: { dc: 17, bonus: 9 },
//   7: { dc: 18, bonus: 10 },
//   9: { dc: 19, bonus: 11 }
// };

/* -------------------------------------------- */

/**
 * Compendium packs used for localized items.
 * @enum {string}
 */
// SENTIUS.sourcePacks = {
//   BACKGROUNDS: "sentius.backgrounds",
//   CLASSES: "sentius.classes",
//   ITEMS: "sentius.items",
//   RACES: "sentius.races"
// };

/* -------------------------------------------- */

/**
 * Settings to configure how actors are merged when polymorphing is applied.
 * @enum {string}
 */
// SENTIUS.polymorphSettings = {
//   keepPhysical: "SENTIUS.PolymorphKeepPhysical",
//   keepMental: "SENTIUS.PolymorphKeepMental",
//   keepSaves: "SENTIUS.PolymorphKeepSaves",
//   keepSkills: "SENTIUS.PolymorphKeepSkills",
//   mergeSaves: "SENTIUS.PolymorphMergeSaves",
//   mergeSkills: "SENTIUS.PolymorphMergeSkills",
//   keepClass: "SENTIUS.PolymorphKeepClass",
//   keepFeats: "SENTIUS.PolymorphKeepFeats",
//   keepSpells: "SENTIUS.PolymorphKeepSpells",
//   keepItems: "SENTIUS.PolymorphKeepItems",
//   keepBio: "SENTIUS.PolymorphKeepBio",
//   keepVision: "SENTIUS.PolymorphKeepVision",
//   keepSelf: "SENTIUS.PolymorphKeepSelf",
//   keepType: "SENTIUS.PolymorphKeepType",
//   keepHP: "SENTIUS.PolymorphKeepHP",
//   addTemp: "SENTIUS.PolymorphAddTemp"
// };
// preLocalize("polymorphSettings", { sort: true });

/**
 * Settings to configure how actors are effects are merged when polymorphing is applied.
 * @enum {string}
 */
// SENTIUS.polymorphEffectSettings = {
//   keepAE: "SENTIUS.PolymorphKeepAE",
//   keepOtherOriginAE: "SENTIUS.PolymorphKeepOtherOriginAE",
//   keepOriginAE: "SENTIUS.PolymorphKeepOriginAE",
//   keepEquipmentAE: "SENTIUS.PolymorphKeepEquipmentAE",
//   keepFeatAE: "SENTIUS.PolymorphKeepFeatureAE",
//   keepSpellAE: "SENTIUS.PolymorphKeepSpellAE",
//   keepClassAE: "SENTIUS.PolymorphKeepClassAE",
//   keepBackgroundAE: "SENTIUS.PolymorphKeepBackgroundAE"
// };
// preLocalize("polymorphEffectSettings", { sort: true });

/**
 * Settings to configure how actors are merged when preset polymorphing is applied.
 * @enum {object}
 */
// SENTIUS.transformationPresets = {
//   wildshape: {
//     icon: '<i class="fas fa-paw"></i>',
//     label: "SENTIUS.PolymorphWildShape",
//     options: {
//       keepBio: true,
//       keepClass: true,
//       keepFeats: true,
//       keepHP: true,
//       keepMental: true,
//       keepType: true,
//       mergeSaves: true,
//       mergeSkills: true,
//       keepEquipmentAE: false,
//       preset: "wildshape"
//     }
//   },
//   polymorph: {
//     icon: '<i class="fas fa-pastafarianism"></i>',
//     label: "SENTIUS.Polymorph",
//     options: {
//       addTemp: true,
//       keepHP: true,
//       keepType: true,
//       keepEquipmentAE: false,
//       keepClassAE: false,
//       keepFeatAE: false,
//       keepBackgroundAE: false,
//       preset: "polymorph"
//     }
//   },
//   polymorphSelf: {
//     icon: '<i class="fas fa-eye"></i>',
//     label: "SENTIUS.PolymorphSelf",
//     options: {
//       keepSelf: true,
//       preset: "polymorphSelf"
//     }
//   }
// };
// preLocalize("transformationPresets", { sort: true, keys: ["label"] });

/* -------------------------------------------- */

/**
 * Skill, ability, and tool proficiency levels.
 * The key for each level represents its proficiency multiplier.
 * @enum {string}
 */
// SENTIUS.proficiencyLevels = {
//   0: "SENTIUS.NotProficient",
//   1: "SENTIUS.Proficient",
//   0.5: "SENTIUS.HalfProficient",
//   2: "SENTIUS.Expertise"
// };
// preLocalize("proficiencyLevels");

/* -------------------------------------------- */

/**
 * Weapon and armor item proficiency levels.
 * @enum {string}
 */
// SENTIUS.weaponAndArmorProficiencyLevels = {
//   0: "SENTIUS.NotProficient",
//   1: "SENTIUS.Proficient"
// };
// preLocalize("weaponAndArmorProficiencyLevels");

/* -------------------------------------------- */

/**
 * The amount of cover provided by an object. In cases where multiple pieces
 * of cover are in play, we take the highest value.
 * @enum {string}
 */
// SENTIUS.cover = {
//   0: "SENTIUS.None",
//   .5: "SENTIUS.CoverHalf",
//   .75: "SENTIUS.CoverThreeQuarters",
//   1: "SENTIUS.CoverTotal"
// };
// preLocalize("cover");

/* -------------------------------------------- */

/**
 * A selection of actor attributes that can be tracked on token resource bars.
 * @type {string[]}
 * @deprecated since v10
 */
// SENTIUS.trackableAttributes = [
//   "attributes.ac.value", "attributes.init.bonus", "attributes.movement", "attributes.senses", "attributes.spelldc",
//   "attributes.spellLevel", "details.cr", "details.spellLevel", "details.xp.value", "skills.*.passive",
//   "abilities.*.value"
// ];

/* -------------------------------------------- */

/**
 * A selection of actor and item attributes that are valid targets for item resource consumption.
 * @type {string[]}
 */
// SENTIUS.consumableResources = [
//   // Configured during init.
// ];

/* -------------------------------------------- */

/**
 * @typedef {object} _StatusEffectConfig5e
 * @property {string} icon              Icon used to represent the condition on the token.
 * @property {number} [order]           Order status to the start of the token HUD, rather than alphabetically.
 * @property {string} [reference]       UUID of a journal entry with details on this condition.
 * @property {string} [special]         Set this condition as a special status effect under this name.
 * @property {string[]} [riders]        Additional conditions, by id, to apply as part of this condition.
 * @property {string} [exclusiveGroup]  Any status effects with the same group will not be able to be applied at the
 *                                      same time through the token HUD (multiple statuses applied through other
 *                                      effects can still coexist).
 * @property {number} [coverBonus]      A bonus this condition provides to AC and dexterity saving throws.
 */

/**
 * Configuration data for system status effects.
 * @typedef {Omit<StatusEffectConfig, "img"> & _StatusEffectConfig5e} StatusEffectConfig5e
 */

/**
 * @typedef {object} _ConditionConfiguration
 * @property {string} label        Localized label for the condition.
 * @property {boolean} [pseudo]    Is this a pseudo-condition, i.e. one that does not appear in the conditions appendix
 *                                 but acts as a status effect?
 * @property {number} [levels]     The number of levels of exhaustion an actor can obtain.
 * @property {{ rolls: number, speed: number }} [reduction]  Amount D20 Tests & Speed are reduced per exhaustion level
 *                                                           when using the modern rules.
 */

/**
 * Configuration data for system conditions.
 * @typedef {Omit<StatusEffectConfig5e, "name"> & _ConditionConfiguration} ConditionConfiguration
 */

/**
 * Conditions that can affect an actor.
 * @enum {ConditionConfiguration}
 */
// SENTIUS.conditionTypes = {
//   bleeding: {
//     label: "EFFECT.SENTIUS.StatusBleeding",
//     icon: "systems/sentius/icons/svg/statuses/bleeding.svg",
//     pseudo: true
//   },
//   blinded: {
//     label: "SENTIUS.ConBlinded",
//     icon: "systems/sentius/icons/svg/statuses/blinded.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.0b8N4FymGGfbZGpJ",
//     special: "BLIND"
//   },
//   burning: {
//     label: "EFFECT.SENTIUS.StatusBurning",
//     icon: "systems/sentius/icons/svg/statuses/burning.svg",
//     pseudo: true
//   },
//   charmed: {
//     label: "SENTIUS.ConCharmed",
//     icon: "systems/sentius/icons/svg/statuses/charmed.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.zZaEBrKkr66OWJvD"
//   },
//   cursed: {
//     label: "EFFECT.SENTIUS.StatusCursed",
//     icon: "systems/sentius/icons/svg/statuses/cursed.svg",
//     pseudo: true
//   },
//   dehydration: {
//     label: "EFFECT.SENTIUS.StatusDehydration",
//     icon: "systems/sentius/icons/svg/statuses/dehydration.svg",
//     pseudo: true
//   },
//   deafened: {
//     label: "SENTIUS.ConDeafened",
//     icon: "systems/sentius/icons/svg/statuses/deafened.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.6G8JSjhn701cBITY"
//   },
//   diseased: {
//     label: "SENTIUS.ConDiseased",
//     icon: "systems/sentius/icons/svg/statuses/diseased.svg",
//     pseudo: true,
//     reference: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.oNQWvyRZkTOJ8PBq"
//   },
//   exhaustion: {
//     label: "SENTIUS.ConExhaustion",
//     icon: "systems/sentius/icons/svg/statuses/exhaustion.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.cspWveykstnu3Zcv",
//     levels: 6,
//     reduction: { rolls: 2, speed: 5 }
//   },
//   falling: {
//     label: "EFFECT.SENTIUS.StatusFalling",
//     icon: "systems/sentius/icons/svg/statuses/falling.svg",
//     pseudo: true
//   },
//   frightened: {
//     label: "SENTIUS.ConFrightened",
//     icon: "systems/sentius/icons/svg/statuses/frightened.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.oreoyaFKnvZCrgij"
//   },
//   grappled: {
//     label: "SENTIUS.ConGrappled",
//     icon: "systems/sentius/icons/svg/statuses/grappled.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.gYDAhd02ryUmtwZn"
//   },
//   incapacitated: {
//     label: "SENTIUS.ConIncapacitated",
//     icon: "systems/sentius/icons/svg/statuses/incapacitated.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.TpkZgLfxCmSndmpb"
//   },
//   invisible: {
//     label: "SENTIUS.ConInvisible",
//     icon: "systems/sentius/icons/svg/statuses/invisible.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.3UU5GCTVeRDbZy9u"
//   },
//   malnutrition: {
//     label: "EFFECT.SENTIUS.StatusMalnutrition",
//     icon: "systems/sentius/icons/svg/statuses/malnutrition.svg",
//     pseudo: true
//   },
//   paralyzed: {
//     label: "SENTIUS.ConParalyzed",
//     icon: "systems/sentius/icons/svg/statuses/paralyzed.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.xnSV5hLJIMaTABXP",
//     statuses: ["incapacitated"]
//   },
//   petrified: {
//     label: "SENTIUS.ConPetrified",
//     icon: "systems/sentius/icons/svg/statuses/petrified.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.xaNDaW6NwQTgHSmi",
//     statuses: ["incapacitated"]
//   },
//   poisoned: {
//     label: "SENTIUS.ConPoisoned",
//     icon: "systems/sentius/icons/svg/statuses/poisoned.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.lq3TRI6ZlED8ABMx"
//   },
//   prone: {
//     label: "SENTIUS.ConProne",
//     icon: "systems/sentius/icons/svg/statuses/prone.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.y0TkcdyoZlOTmAFT"
//   },
//   restrained: {
//     label: "SENTIUS.ConRestrained",
//     icon: "systems/sentius/icons/svg/statuses/restrained.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.cSVcyZyNe2iG1fIc"
//   },
//   silenced: {
//     label: "EFFECT.SENTIUS.StatusSilenced",
//     icon: "systems/sentius/icons/svg/statuses/silenced.svg",
//     pseudo: true
//   },
//   stunned: {
//     label: "SENTIUS.ConStunned",
//     icon: "systems/sentius/icons/svg/statuses/stunned.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.ZyZMUwA2rboh4ObS",
//     statuses: ["incapacitated"]
//   },
//   suffocation: {
//     label: "EFFECT.SENTIUS.StatusSuffocation",
//     icon: "systems/sentius/icons/svg/statuses/suffocation.svg",
//     pseudo: true
//   },
//   surprised: {
//     label: "EFFECT.SENTIUS.StatusSurprised",
//     icon: "systems/sentius/icons/svg/statuses/surprised.svg",
//     pseudo: true
//   },
//   transformed: {
//     label: "EFFECT.SENTIUS.StatusTransformed",
//     icon: "systems/sentius/icons/svg/statuses/transformed.svg",
//     pseudo: true
//   },
//   unconscious: {
//     label: "SENTIUS.ConUnconscious",
//     icon: "systems/sentius/icons/svg/statuses/unconscious.svg",
//     reference: "Compendium.sentius.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.UWw13ISmMxDzmwbd",
//     statuses: ["incapacitated"],
//     riders: ["prone"]
//   }
// };
// preLocalize("conditionTypes", { key: "label", sort: true });

/* -------------------------------------------- */

/**
 * Various effects of conditions and which conditions apply it. Either keys for the conditions,
 * and with a number appended for a level of exhaustion.
 * @enum {object}
 */
// SENTIUS.conditionEffects = {
//   noMovement: new Set(["exhaustion-5", "grappled", "paralyzed", "petrified", "restrained", "unconscious"]),
//   halfMovement: new Set(["exhaustion-2"]),
//   crawl: new Set(["prone", "exceedingCarryingCapacity"]),
//   petrification: new Set(["petrified"]),
//   halfHealth: new Set(["exhaustion-4"])
// };

/* -------------------------------------------- */

/**
 * Extra status effects not specified in `conditionTypes`. If the ID matches a core-provided effect, then this
 * data will be merged into the core data.
 * @enum {Omit<StatusEffectConfig5e, "img"> & { icon: string }}
 */
// SENTIUS.statusEffects = {
//   burrowing: {
//     name: "EFFECT.SENTIUS.StatusBurrowing",
//     icon: "systems/sentius/icons/svg/statuses/burrowing.svg",
//     special: "BURROW"
//   },
//   concentrating: {
//     name: "EFFECT.SENTIUS.StatusConcentrating",
//     icon: "systems/sentius/icons/svg/statuses/concentrating.svg",
//     special: "CONCENTRATING"
//   },
//   coverHalf: {
//     name: "EFFECT.SENTIUS.StatusHalfCover",
//     icon: "systems/sentius/icons/svg/statuses/cover-half.svg",
//     order: 2,
//     exclusiveGroup: "cover",
//     coverBonus: 2
//   },
//   coverThreeQuarters: {
//     name: "EFFECT.SENTIUS.StatusThreeQuartersCover",
//     icon: "systems/sentius/icons/svg/statuses/cover-three-quarters.svg",
//     order: 3,
//     exclusiveGroup: "cover",
//     coverBonus: 5
//   },
//   coverTotal: {
//     name: "EFFECT.SENTIUS.StatusTotalCover",
//     icon: "systems/sentius/icons/svg/statuses/cover-total.svg",
//     order: 4,
//     exclusiveGroup: "cover"
//   },
//   dead: {
//     name: "EFFECT.SENTIUS.StatusDead",
//     icon: "systems/sentius/icons/svg/statuses/dead.svg",
//     special: "DEFEATED",
//     order: 1
//   },
//   dodging: {
//     name: "EFFECT.SENTIUS.StatusDodging",
//     icon: "systems/sentius/icons/svg/statuses/dodging.svg"
//   },
//   ethereal: {
//     name: "EFFECT.SENTIUS.StatusEthereal",
//     icon: "systems/sentius/icons/svg/statuses/ethereal.svg"
//   },
//   flying: {
//     name: "EFFECT.SENTIUS.StatusFlying",
//     icon: "systems/sentius/icons/svg/statuses/flying.svg",
//     special: "FLY"
//   },
//   hiding: {
//     name: "EFFECT.SENTIUS.StatusHiding",
//     icon: "systems/sentius/icons/svg/statuses/hiding.svg"
//   },
//   hovering: {
//     name: "EFFECT.SENTIUS.StatusHovering",
//     icon: "systems/sentius/icons/svg/statuses/hovering.svg",
//     special: "HOVER"
//   },
//   marked: {
//     name: "EFFECT.SENTIUS.StatusMarked",
//     icon: "systems/sentius/icons/svg/statuses/marked.svg"
//   },
//   sleeping: {
//     name: "EFFECT.SENTIUS.StatusSleeping",
//     icon: "systems/sentius/icons/svg/statuses/sleeping.svg",
//     statuses: ["incapacitated", "unconscious"]
//   },
//   stable: {
//     name: "EFFECT.SENTIUS.StatusStable",
//     icon: "systems/sentius/icons/svg/statuses/stable.svg"
//   }
// };

/* -------------------------------------------- */

/**
 * Configuration for the special bloodied status effect.
 * @type {{ name: string, icon: string, threshold: number }}
 */
// SENTIUS.bloodied = {
//   name: "EFFECT.SENTIUS.StatusBloodied",
//   icon: "systems/sentius/icons/svg/statuses/bloodied.svg",
//   threshold: .5
// };

/* -------------------------------------------- */
/*  Languages                                   */
/* -------------------------------------------- */

/**
 * Languages a character can learn.
 * @enum {string}
 */
// SENTIUS.languages = {
//   standard: {
//     label: "SENTIUS.LanguagesStandard",
//     children: {
//       common: "SENTIUS.LanguagesCommon",
//       draconic: "SENTIUS.LanguagesDraconic",
//       dwarvish: "SENTIUS.LanguagesDwarvish",
//       elvish: "SENTIUS.LanguagesElvish",
//       giant: "SENTIUS.LanguagesGiant",
//       gnomish: "SENTIUS.LanguagesGnomish",
//       goblin: "SENTIUS.LanguagesGoblin",
//       halfling: "SENTIUS.LanguagesHalfling",
//       orc: "SENTIUS.LanguagesOrc",
//       sign: "SENTIUS.LanguagesCommonSign"
//     }
//   },
//   exotic: {
//     label: "SENTIUS.LanguagesExotic",
//     children: {
//       aarakocra: "SENTIUS.LanguagesAarakocra",
//       abyssal: "SENTIUS.LanguagesAbyssal",
//       cant: "SENTIUS.LanguagesThievesCant",
//       celestial: "SENTIUS.LanguagesCelestial",
//       deep: "SENTIUS.LanguagesDeepSpeech",
//       druidic: "SENTIUS.LanguagesDruidic",
//       gith: "SENTIUS.LanguagesGith",
//       gnoll: "SENTIUS.LanguagesGnoll",
//       infernal: "SENTIUS.LanguagesInfernal",
//       primordial: {
//         label: "SENTIUS.LanguagesPrimordial",
//         children: {
//           aquan: "SENTIUS.LanguagesAquan",
//           auran: "SENTIUS.LanguagesAuran",
//           ignan: "SENTIUS.LanguagesIgnan",
//           terran: "SENTIUS.LanguagesTerran"
//         }
//       },
//       sylvan: "SENTIUS.LanguagesSylvan",
//       undercommon: "SENTIUS.LanguagesUndercommon"
//     }
//   }
// };
// preLocalize("languages", { key: "label" });
// preLocalize("languages.standard.children", { key: "label", sort: true });
// preLocalize("languages.exotic.children", { key: "label", sort: true });
// preLocalize("languages.exotic.children.primordial.children", { sort: true });

/* -------------------------------------------- */

/**
 * Maximum allowed character level.
 * @type {number}
 */
// SENTIUS.maxLevel = 20;

/**
 * Maximum ability score value allowed by default.
 * @type {number}
 */
// SENTIUS.maxAbilityScore = 20;

/**
 * XP required to achieve each character level.
 * @type {number[]}
 */
// SENTIUS.CHARACTER_EXP_LEVELS = [
//   0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000,
//   120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
// ];

/**
 * XP granted for each challenge rating.
 * @type {number[]}
 */
// SENTIUS.CR_EXP_LEVELS = [
//   10, 200, 450, 700, 1100, 1800, 2300, 2900, 3900, 5000, 5900, 7200, 8400, 10000, 11500, 13000, 15000, 18000,
//   20000, 22000, 25000, 33000, 41000, 50000, 62000, 75000, 90000, 105000, 120000, 135000, 155000
// ];

/**
 * Intervals above the maximum XP that result in an epic boon.
 * @type {number}
 */
// SENTIUS.epicBoonInterval = 30000;

/* -------------------------------------------- */

/**
 * Trait configuration information.
 *
 * @typedef {object} TraitConfiguration
 * @property {object} labels
 * @property {string} labels.title         Localization key for the trait name.
 * @property {string} labels.localization  Prefix for a localization key that can be used to generate various
 *                                         plural variants of the trait type.
 * @property {string} icon                 Path to the icon used to represent this trait.
 * @property {string} [actorKeyPath]       If the trait doesn't directly map to an entry as `traits.[key]`, where is
 *                                         this trait's data stored on the actor?
 * @property {string} [configKey]          If the list of trait options doesn't match the name of the trait, where can
 *                                         the options be found within `CONFIG.SENTIUS`?
 * @property {boolean|number} [dataType]   Type of data represented.
 * @property {string} [labelKeyPath]       If config is an enum of objects, where can the label be found?
 * @property {object} [subtypes]           Configuration for traits that take some sort of base item.
 * @property {string} [subtypes.keyPath]   Path to subtype value on base items, should match a category key.
 *                                         Deprecated in favor of the standardized `system.type.value`.
 * @property {string[]} [subtypes.ids]     Key for base item ID objects within `CONFIG.SENTIUS`.
 * @property {object} [children]           Mapping of category key to an object defining its children.
 * @property {boolean} [sortCategories]    Whether top-level categories should be sorted.
 * @property {boolean} [expertise]         Can an actor receive expertise in this trait?
 * @property {boolean} [mastery]           Can an actor receive mastery in this trait?
 */

/**
 * Configurable traits on actors.
 * @enum {TraitConfiguration}
 */
// SENTIUS.traits = {
//   saves: {
//     labels: {
//       title: "SENTIUS.ClassSaves",
//       localization: "SENTIUS.TraitSavesPlural"
//     },
//     icon: "icons/magic/life/ankh-gold-blue.webp",
//     actorKeyPath: "system.abilities",
//     configKey: "abilities",
//     labelKeyPath: "label"
//   },
//   skills: {
//     labels: {
//       title: "SENTIUS.Skills",
//       localization: "SENTIUS.TraitSkillsPlural"
//     },
//     icon: "icons/tools/instruments/harp-yellow-teal.webp",
//     actorKeyPath: "system.skills",
//     labelKeyPath: "label",
//     expertise: true
//   },
//   languages: {
//     labels: {
//       title: "SENTIUS.Languages",
//       localization: "SENTIUS.TraitLanguagesPlural"
//     },
//     icon: "icons/skills/social/diplomacy-peace-alliance.webp"
//   },
//   armor: {
//     labels: {
//       title: "SENTIUS.TraitArmorProf",
//       localization: "SENTIUS.TraitArmorPlural"
//     },
//     icon: "icons/equipment/chest/breastplate-helmet-metal.webp",
//     actorKeyPath: "system.traits.armorProf",
//     configKey: "armorProficiencies",
//     subtypes: { keyPath: "armor.type", ids: ["armorIds", "shieldIds"] }
//   },
//   weapon: {
//     labels: {
//       title: "SENTIUS.TraitWeaponProf",
//       localization: "SENTIUS.TraitWeaponPlural"
//     },
//     icon: "icons/skills/melee/weapons-crossed-swords-purple.webp",
//     actorKeyPath: "system.traits.weaponProf",
//     configKey: "weaponProficiencies",
//     subtypes: { keyPath: "weaponType", ids: ["weaponIds"] },
//     mastery: true
//   },
//   tool: {
//     labels: {
//       title: "SENTIUS.TraitToolProf",
//       localization: "SENTIUS.TraitToolPlural"
//     },
//     icon: "icons/skills/trades/smithing-anvil-silver-red.webp",
//     actorKeyPath: "system.tools",
//     configKey: "toolProficiencies",
//     subtypes: { keyPath: "toolType", ids: ["toolIds"] },
//     children: { vehicle: "vehicleTypes" },
//     sortCategories: true,
//     expertise: true
//   },
//   di: {
//     labels: {
//       title: "SENTIUS.DamImm",
//       localization: "SENTIUS.TraitDIPlural"
//     },
//     icon: "systems/sentius/icons/svg/trait-damage-immunities.svg",
//     configKey: "damageTypes"
//   },
//   dr: {
//     labels: {
//       title: "SENTIUS.DamRes",
//       localization: "SENTIUS.TraitDRPlural"
//     },
//     icon: "systems/sentius/icons/svg/trait-damage-resistances.svg",
//     configKey: "damageTypes"
//   },
//   dv: {
//     labels: {
//       title: "SENTIUS.DamVuln",
//       localization: "SENTIUS.TraitDVPlural"
//     },
//     icon: "systems/sentius/icons/svg/trait-damage-vulnerabilities.svg",
//     configKey: "damageTypes"
//   },
//   dm: {
//     labels: {
//       title: "SENTIUS.DamMod",
//       localization: "SENTIUS.TraitDMPlural"
//     },
//     configKey: "damageTypes",
//     dataType: Number
//   },
//   ci: {
//     labels: {
//       title: "SENTIUS.ConImm",
//       localization: "SENTIUS.TraitCIPlural"
//     },
//     icon: "systems/sentius/icons/svg/trait-condition-immunities.svg",
//     configKey: "conditionTypes"
//   }
// };
// preLocalize("traits", { key: "labels.title" });

/* -------------------------------------------- */

/**
 * Modes used within a trait advancement.
 * @enum {object}
 */
// SENTIUS.traitModes = {
//   default: {
//     label: "SENTIUS.AdvancementTraitModeDefaultLabel",
//     hint: "SENTIUS.AdvancementTraitModeDefaultHint"
//   },
//   expertise: {
//     label: "SENTIUS.AdvancementTraitModeExpertiseLabel",
//     hint: "SENTIUS.AdvancementTraitModeExpertiseHint"
//   },
//   forcedExpertise: {
//     label: "SENTIUS.AdvancementTraitModeForceLabel",
//     hint: "SENTIUS.AdvancementTraitModeForceHint"
//   },
//   upgrade: {
//     label: "SENTIUS.AdvancementTraitModeUpgradeLabel",
//     hint: "SENTIUS.AdvancementTraitModeUpgradeHint"
//   },
//   mastery: {
//     label: "SENTIUS.AdvancementTraitModeMasteryLabel",
//     hint: "SENTIUS.AdvancementTraitModeMasteryHint"
//   }
// };
// preLocalize("traitModes", { keys: ["label", "hint"] });

/* -------------------------------------------- */

/**
 * @typedef {object} CharacterFlagConfig
 * @property {string} name
 * @property {string} hint
 * @property {string} section
 * @property {typeof boolean|string|number} type
 * @property {string} placeholder
 * @property {string[]} [abilities]
 * @property {Object<string, string>} [choices]
 * @property {string[]} [skills]
 */

/**
 * Special character flags.
 * @enum {CharacterFlagConfig}
 */
// SENTIUS.characterFlags = {
//   diamondSoul: {
//     name: "SENTIUS.FlagsDiamondSoul",
//     hint: "SENTIUS.FlagsDiamondSoulHint",
//     section: "SENTIUS.Feats",
//     type: Boolean
//   },
//   enhancedDualWielding: {
//     name: "SENTIUS.FLAGS.EnhancedDualWielding.Name",
//     hint: "SENTIUS.FLAGS.EnhancedDualWielding.Hint",
//     section: "SENTIUS.Feats",
//     type: Boolean
//   },
//   elvenAccuracy: {
//     name: "SENTIUS.FlagsElvenAccuracy",
//     hint: "SENTIUS.FlagsElvenAccuracyHint",
//     section: "SENTIUS.RacialTraits",
//     abilities: ["dex", "int", "wis", "cha"],
//     type: Boolean
//   },
//   halflingLucky: {
//     name: "SENTIUS.FlagsHalflingLucky",
//     hint: "SENTIUS.FlagsHalflingLuckyHint",
//     section: "SENTIUS.RacialTraits",
//     type: Boolean
//   },
//   initiativeAdv: {
//     name: "SENTIUS.FlagsInitiativeAdv",
//     hint: "SENTIUS.FlagsInitiativeAdvHint",
//     section: "SENTIUS.Feats",
//     type: Boolean
//   },
//   initiativeAlert: {
//     name: "SENTIUS.FlagsAlert",
//     hint: "SENTIUS.FlagsAlertHint",
//     section: "SENTIUS.Feats",
//     type: Boolean
//   },
//   jackOfAllTrades: {
//     name: "SENTIUS.FlagsJOAT",
//     hint: "SENTIUS.FlagsJOATHint",
//     section: "SENTIUS.Feats",
//     type: Boolean
//   },
//   observantFeat: {
//     name: "SENTIUS.FlagsObservant",
//     hint: "SENTIUS.FlagsObservantHint",
//     skills: ["prc", "inv"],
//     section: "SENTIUS.Feats",
//     type: Boolean
//   },
//   tavernBrawlerFeat: {
//     name: "SENTIUS.FlagsTavernBrawler",
//     hint: "SENTIUS.FlagsTavernBrawlerHint",
//     section: "SENTIUS.Feats",
//     type: Boolean
//   },
//   powerfulBuild: {
//     name: "SENTIUS.FlagsPowerfulBuild",
//     hint: "SENTIUS.FlagsPowerfulBuildHint",
//     section: "SENTIUS.RacialTraits",
//     type: Boolean
//   },
//   reliableTalent: {
//     name: "SENTIUS.FlagsReliableTalent",
//     hint: "SENTIUS.FlagsReliableTalentHint",
//     section: "SENTIUS.Feats",
//     type: Boolean
//   },
//   remarkableAthlete: {
//     name: "SENTIUS.FlagsRemarkableAthlete",
//     hint: "SENTIUS.FlagsRemarkableAthleteHint",
//     abilities: ["str", "dex", "con"],
//     section: "SENTIUS.Feats",
//     type: Boolean
//   },
//   weaponCriticalThreshold: {
//     name: "SENTIUS.FlagsWeaponCritThreshold",
//     hint: "SENTIUS.FlagsWeaponCritThresholdHint",
//     section: "SENTIUS.Feats",
//     type: Number,
//     placeholder: 20
//   },
//   spellCriticalThreshold: {
//     name: "SENTIUS.FlagsSpellCritThreshold",
//     hint: "SENTIUS.FlagsSpellCritThresholdHint",
//     section: "SENTIUS.Feats",
//     type: Number,
//     placeholder: 20
//   },
//   meleeCriticalDamageDice: {
//     name: "SENTIUS.FlagsMeleeCriticalDice",
//     hint: "SENTIUS.FlagsMeleeCriticalDiceHint",
//     section: "SENTIUS.Feats",
//     type: Number,
//     placeholder: 0
//   }
// };
// preLocalize("characterFlags", { keys: ["name", "hint", "section"] });

/**
 * Flags allowed on actors. Any flags not in the list may be deleted during a migration.
 * @type {string[]}
 */
// SENTIUS.allowedActorFlags = ["isPolymorphed", "originalActor"].concat(Object.keys(SENTIUS.characterFlags));

/* -------------------------------------------- */

/**
 * Different types of actor structures that groups can represent.
 * @enum {object}
 */
// SENTIUS.groupTypes = {
//   party: "SENTIUS.Group.TypeParty",
//   encounter: "SENTIUS.Group.TypeEncounter"
// };
// preLocalize("groupTypes");

/* -------------------------------------------- */

/**
 * Configuration information for activity types.
 *
 * @typedef {object} ActivityTypeConfiguration
 * @property {typeof Activity} documentClass  The activity's document class.
 * @property {boolean} [configurable=true]    Whether the activity is editable via the UI.
 * @property {boolean} [hidden]               Should this activity type be hidden in the selection dialog?
 */
// SENTIUS.activityTypes = {
//   attack: {
//     documentClass: activities.AttackActivity
//   },
//   cast: {
//     documentClass: activities.CastActivity
//   },
//   check: {
//     documentClass: activities.CheckActivity
//   },
//   damage: {
//     documentClass: activities.DamageActivity
//   },
//   enchant: {
//     documentClass: activities.EnchantActivity
//   },
//   forward: {
//     documentClass: activities.ForwardActivity
//   },
//   heal: {
//     documentClass: activities.HealActivity
//   },
//   order: {
//     documentClass: activities.OrderActivity,
//     configurable: false
//   },
//   save: {
//     documentClass: activities.SaveActivity
//   },
//   summon: {
//     documentClass: activities.SummonActivity
//   },
//   utility: {
//     documentClass: activities.UtilityActivity
//   }
// };

/* -------------------------------------------- */

/**
 * Configuration information for advancement types.
 *
 * @typedef {object} AdvancementTypeConfiguration
 * @property {typeof Advancement} documentClass  The advancement's document class.
 * @property {Set<string>} validItemTypes        What item types this advancement can be used with.
 * @property {boolean} [hidden]                  Should this advancement type be hidden in the selection dialog?
 */

// const _ALL_ITEM_TYPES = ["background", "class", "race", "subclass"];

/**
 * Advancement types that can be added to items.
 * @enum {AdvancementTypeConfiguration}
 */
// SENTIUS.advancementTypes = {
//   AbilityScoreImprovement: {
//     documentClass: advancement.AbilityScoreImprovementAdvancement,
//     validItemTypes: new Set(["background", "class", "race"])
//   },
//   HitPoints: {
//     documentClass: advancement.HitPointsAdvancement,
//     validItemTypes: new Set(["class"])
//   },
//   ItemChoice: {
//     documentClass: advancement.ItemChoiceAdvancement,
//     validItemTypes: new Set(_ALL_ITEM_TYPES)
//   },
//   ItemGrant: {
//     documentClass: advancement.ItemGrantAdvancement,
//     validItemTypes: new Set(_ALL_ITEM_TYPES)
//   },
//   ScaleValue: {
//     documentClass: advancement.ScaleValueAdvancement,
//     validItemTypes: new Set(_ALL_ITEM_TYPES)
//   },
//   Size: {
//     documentClass: advancement.SizeAdvancement,
//     validItemTypes: new Set(["race"])
//   },
//   Subclass: {
//     documentClass: advancement.SubclassAdvancement,
//     validItemTypes: new Set(["class"])
//   },
//   Trait: {
//     documentClass: advancement.TraitAdvancement,
//     validItemTypes: new Set(_ALL_ITEM_TYPES)
//   }
// };

/* -------------------------------------------- */

/**
 * Default artwork configuration for each Document type and sub-type.
 * @type {Record<string, Record<string, string>>}
 */
// SENTIUS.defaultArtwork = {
//   Item: {
//     background: "systems/sentius/icons/svg/items/background.svg",
//     class: "systems/sentius/icons/svg/items/class.svg",
//     consumable: "systems/sentius/icons/svg/items/consumable.svg",
//     container: "systems/sentius/icons/svg/items/container.svg",
//     equipment: "systems/sentius/icons/svg/items/equipment.svg",
//     facility: "systems/sentius/icons/svg/items/facility.svg",
//     feat: "systems/sentius/icons/svg/items/feature.svg",
//     loot: "systems/sentius/icons/svg/items/loot.svg",
//     race: "systems/sentius/icons/svg/items/race.svg",
//     spell: "systems/sentius/icons/svg/items/spell.svg",
//     subclass: "systems/sentius/icons/svg/items/subclass.svg",
//     tool: "systems/sentius/icons/svg/items/tool.svg",
//     weapon: "systems/sentius/icons/svg/items/weapon.svg"
//   }
// };

/* -------------------------------------------- */
/*  Rules                                       */
/* -------------------------------------------- */

/**
 * Configuration information for rule types.
 *
 * @typedef {object} RuleTypeConfiguration
 * @property {string} label         Localized label for the rule type.
 * @property {string} [references]  Key path for a configuration object that contains reference data.
 */

/**
 * Types of rules that can be used in rule pages and the &Reference enricher.
 * @enum {RuleTypeConfiguration}
 */
// SENTIUS.ruleTypes = {
//   rule: {
//     label: "SENTIUS.Rule.Type.Rule",
//     references: "rules"
//   },
//   ability: {
//     label: "SENTIUS.Ability",
//     references: "enrichmentLookup.abilities"
//   },
//   areaOfEffect: {
//     label: "SENTIUS.AreaOfEffect.Label",
//     references: "areaTargetTypes"
//   },
//   condition: {
//     label: "SENTIUS.Rule.Type.Condition",
//     references: "conditionTypes"
//   },
//   creatureType: {
//     label: "SENTIUS.CreatureType",
//     references: "creatureTypes"
//   },
//   damage: {
//     label: "SENTIUS.DamageType",
//     references: "damageTypes"
//   },
//   skill: {
//     label: "SENTIUS.Skill",
//     references: "enrichmentLookup.skills"
//   },
//   spellComponent: {
//     label: "SENTIUS.SpellComponent",
//     references: "itemProperties"
//   },
//   spellSchool: {
//     label: "SENTIUS.SpellSchool",
//     references: "enrichmentLookup.spellSchools"
//   },
//   spellTag: {
//     label: "SENTIUS.SpellTag",
//     references: "itemProperties"
//   },
//   weaponMastery: {
//     label: "SENTIUS.WEAPON.Mastery.Label",
//     references: "weaponMasteries"
//   }
// };
// preLocalize("ruleTypes", { key: "label" });

/* -------------------------------------------- */

/**
 * List of rules that can be referenced from enrichers.
 * @enum {string}
 */
// SENTIUS.rules = {
//   inspiration: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.nkEPI89CiQnOaLYh",
//   carryingcapacity: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.1PnjDBKbQJIVyc2t",
//   push: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.Hni8DjqLzoqsVjb6",
//   lift: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.Hni8DjqLzoqsVjb6",
//   drag: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.Hni8DjqLzoqsVjb6",
//   encumbrance: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.JwqYf9qb6gJAWZKs",
//   hiding: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.plHuoNdS0j3umPNS",
//   passiveperception: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.988C2hQNyvqkdbND",
//   time: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.eihqNjwpZ3HM4IqY",
//   speed: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.HhqeIiSj8sE1v1qZ",
//   travelpace: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.eFAISahBloR2X8MX",
//   forcedmarch: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.uQWQpRKQ1kWhuvjZ",
//   difficultterrainpace: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.hFW5BR2yHHwwgurD",
//   climbing: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.KxUXbMrUCIAhv4AF",
//   swimming: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.KxUXbMrUCIAhv4AF",
//   longjump: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.1U0myNrOvIVBUdJV",
//   highjump: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.raPwIkqKSv60ELmy",
//   falling: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.kREHL5pgNUOhay9f",
//   suffocating: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.BIlnr0xYhqt4TGsi",
//   vision: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.O6hamUbI9kVASN8b",
//   light: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.O6hamUbI9kVASN8b",
//   lightlyobscured: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.MAxtfJyvJV7EpzWN",
//   heavilyobscured: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.wPFjfRruboxhtL4b",
//   brightlight: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.RnMokVPyKGbbL8vi",
//   dimlight: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.n1Ocpbyhr6HhgbCG",
//   darkness: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.4dfREIDjG5N4fvxd",
//   blindsight: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.sacjsfm9ZXnw4Tqc",
//   darkvision: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.ldmA1PbnEGVkmE11",
//   tremorsense: "Compendium.sentius.rules.JournalEntry.eVtpEGXjA2tamEIJ.JournalEntryPage.8AIlZ95v54mL531X",
//   truesight: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.kNa8rJFbtaTM3Rmk",
//   food: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.jayo7XVgGnRCpTW0",
//   water: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.iIEI87J7lr2sqtb5",
//   resting: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.dpHJXYLigIdEseIb",
//   shortrest: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.1s2swI3UsjUUgbt2",
//   longrest: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.6cLtjbHn4KV2R7G9",
//   surprise: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.YmOt8HderKveA19K",
//   initiative: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.RcwElV4GAcVXKWxo",
//   bonusaction: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.2fu2CXsDg8gQmGGw",
//   reaction: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.2VqLyxMyMxgXe2wC",
//   difficultterrain: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.6tqz947qO8vPyxvD",
//   beingprone: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.bV8akkBdVUUG21CO",
//   droppingprone: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.hwTLpAtSS5OqQsI1",
//   standingup: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.hwTLpAtSS5OqQsI1",
//   crawling: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.VWG9qe8PUNtS28Pw",
//   movingaroundothercreatures: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.9ZWCknaXCOdhyOrX",
//   flying: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.0B1fxfmw0a48tPsc",
//   size: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.HWHRQVBVG7K0RVVW",
//   space: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.WIA5bs3P45PmO3OS",
//   squeezing: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.wKtOwagDAiNfVoPS",
//   attack: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.u4GQCzoBig20yRLj",
//   castaspell: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.GLwN36E4WXn3Cp4Z",
//   dash: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.Jqn0MEvq6fduYNo6",
//   disengage: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.ZOPRfI48NyjoloEF",
//   dodge: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.V1BkwK2HQrtEfa4d",
//   help: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.KnrD3u2AnQfmtOWj",
//   hide: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.BXlHhE4ZoiFwiXLK",
//   ready: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.8xJzZVelP2AmQGfU",
//   search: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.5cn1ZTLgQq95vfZx",
//   useanobject: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.ljqhJx8Qxu2ivo69",
//   attackrolls: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.5wkqEqhbBD5kDeE7",
//   unseenattackers: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.5ZJNwEPlsGurecg5",
//   unseentargets: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.5ZJNwEPlsGurecg5",
//   rangedattacks: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.S9aclVOCbusLE3kC",
//   range: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.HjKXuB8ndjcqOds7",
//   rangedattacksinclosecombat: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.qEZvxW0NM7ixSQP5",
//   meleeattacks: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.GTk6emvzNxl8Oosl",
//   reach: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.hgZ5ZN4B3y7tmFlt",
//   unarmedstrike: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.xJjJ4lhymAYXAOvO",
//   opportunityattacks: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.zeU0NyCyP10lkLg3",
//   twoweaponfighting: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.FQTS08uH74A6psL2",
//   grappling: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.Sl4bniSPSbyrakM2",
//   escapingagrapple: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.2TZKy9YbMN3ZY3h8",
//   movingagrappledcreature: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.x5bUdhAD7u5Bt2rg",
//   shoving: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.hrdqMF8hRXJdNzJx",
//   cover: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.W7f7PcRubNUMIq2S",
//   halfcover: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.hv0J61IAfofuhy3Q",
//   threequarterscover: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.zAMStUjUrPV10dFm",
//   totalcover: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.BKUAxXuPEzxiEOeL",
//   hitpoints: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.PFbzoMBviI2DD9QP",
//   damagerolls: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.hd26AqKrCqtcQBWy",
//   criticalhits: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.gFL1VhSEljL1zvje",
//   damagetypes: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.jVOgf7DNEhkzYNIe",
//   damageresistance: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.v0WE18nT5SJO8Ft7",
//   damagevulnerability: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.v0WE18nT5SJO8Ft7",
//   healing: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.ICketFqbFslqKiX9",
//   instantdeath: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.8BG05mA0mEzwmrHU",
//   deathsavingthrows: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.JL8LePEJQYFdNuLL",
//   deathsaves: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.JL8LePEJQYFdNuLL",
//   stabilizing: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.r1CgZXLcqFop6Dlx",
//   knockingacreatureout: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.uEwjgKGuCRTNADYv",
//   temporaryhitpoints: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.AW6HpJZHqxfESXaq",
//   temphp: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.AW6HpJZHqxfESXaq",
//   mounting: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.MFpyvUIdcBpC9kIE",
//   dismounting: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.MFpyvUIdcBpC9kIE",
//   controllingamount: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.khmR2xFk1NxoQUgZ",
//   underwatercombat: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.6zVOeLyq4iMnrQT4",
//   spelllevel: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.A6k5fS0kFqPXTW3v",
//   knownspells: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.oezg742GlxmEwT85",
//   preparedspells: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.oezg742GlxmEwT85",
//   spellslots: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.Su6wbb0O9UN4ZDIH",
//   castingatahigherlevel: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.4H9SLM95OCLfFizz",
//   upcasting: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.4H9SLM95OCLfFizz",
//   castinginarmor: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.z4A8vHSK2pb8YA9X",
//   cantrips: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.jZD5mCTnMPJ9jW67",
//   rituals: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.FjWqT5iyJ89kohdA",
//   castingtime: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.zRVW8Tvyk6BECjZD",
//   bonusactioncasting: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.RP1WL9FXI3aknlxZ",
//   reactioncasting: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.t62lCfinwU9H7Lji",
//   longercastingtimes: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.gOAIRFCyPUx42axn",
//   spellrange: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.RBYPyE5z5hAZSbH6",
//   components: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.xeHthAF9lxfn2tII",
//   verbal: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.6UXTNWMCQ0nSlwwx",
//   spellduration: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.9mp0SRsptjvJcq1e",
//   instantaneous: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.kdlgZOpRMB6bGCod",
//   concentrating: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.ow58p27ctAnr4VPH",
//   spelltargets: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.G80AIQr04sxdVpw4",
//   areaofeffect: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.wvtCeGHgnUmh0cuj",
//   pointoforigin: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.8HxbRceQQUAhyWRt",
//   spellsavingthrows: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.8DajfNll90eeKcmB",
//   spellattackrolls: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.qAFzmGZKhVvAEUF3",
//   combiningmagicaleffects: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.TMIN963hG773yZzO",
//   schoolsofmagic: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.TeF6CKMDRpYpsLd4",
//   detectingtraps: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.DZ7AhdQ94xggG4bj",
//   disablingtraps: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.DZ7AhdQ94xggG4bj",
//   curingmadness: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.6Icem7G3CICdNOkM",
//   damagethreshold: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.9LJZhqvCburpags3",
//   poisontypes: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.I6OMMWUaYCWR9xip",
//   contactpoison: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.kXnCEqqGUWRZeZDj",
//   ingestedpoison: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.Y0vsJYSWeQcFpJ27",
//   inhaledpoison: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.KUyN4eK1xTBzXsjP",
//   injurypoison: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.LUL48OUq6SJeMGc7",
//   attunement: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.UQ65OwIyGK65eiOK",
//   wearingitems: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.iPB8mGKuQx3X0Z2J",
//   wieldingitems: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.iPB8mGKuQx3X0Z2J",
//   multipleitemsofthesamekind: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.rLJdvz4Mde8GkEYQ",
//   paireditems: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.rd9pCH8yFraSGN34",
//   commandword: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.HiXixxLYesv6Ff3t",
//   consumables: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.UEPAcZFzQ5x196zE",
//   itemspells: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.DABoaeeF6w31UCsj",
//   charges: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.NLRXcgrpRCfsA5mO",
//   spellscroll: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.gi8IKhtOlBVhMJrN",
//   creaturetags: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.9jV1fFF163dr68vd",
//   telepathy: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.geTidcFIYWuUvD2L",
//   legendaryactions: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.C1awOyZh78pq1xmY",
//   lairactions: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.07PtjpMxiRIhkBEp",
//   regionaleffects: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.uj8W27NKFyzygPUd",
//   disease: "Compendium.sentius.rules.JournalEntry.NizgRXLNUqtdlC1s.JournalEntryPage.oNQWvyRZkTOJ8PBq"
// };

/* -------------------------------------------- */
/*  Token Rings Framework                       */
/* -------------------------------------------- */

/**
 * Token Rings configuration data
 *
 * @typedef {object} TokenRingsConfiguration
 * @property {Record<string, string>} effects        Localized names of the configurable ring effects.
 * @property {string} spriteSheet                    The sprite sheet json source.
 * @property {typeof BaseSamplerShader} shaderClass  The shader class definition associated with the token ring.
 */

/**
 * @type {TokenRingsConfiguration}
 */
// SENTIUS.tokenRings = {
//   effects: {
//     RING_PULSE: "SENTIUS.TokenRings.Effects.RingPulse",
//     RING_GRADIENT: "SENTIUS.TokenRings.Effects.RingGradient",
//     BKG_WAVE: "SENTIUS.TokenRings.Effects.BackgroundWave"
//   },
//   spriteSheet: "systems/sentius/tokens/composite/token-rings.json",
//   shaderClass: null
// };
// preLocalize("tokenRings.effects");

/* -------------------------------------------- */
/*  Sources                                     */
/* -------------------------------------------- */

/**
 * List of books available as sources.
 * @enum {string}
 */
// SENTIUS.sourceBooks = {};
// preLocalize("sourceBooks", { sort: true });

/* -------------------------------------------- */
/*  Themes                                      */
/* -------------------------------------------- */

/**
 * Themes that can be set for the system or on sheets.
 * @enum {string}
 */
// SENTIUS.themes = {
//   light: "SHEETS.SENTIUS.THEME.Light",
//   dark: "SHEETS.SENTIUS.THEME.Dark"
// };
// preLocalize("themes");

/* -------------------------------------------- */
/*  Enrichment                                  */
/* -------------------------------------------- */

// let _enrichmentLookup;
// Object.defineProperty(SENTIUS, "enrichmentLookup", {
//   get() {
//     const slugify = value => value?.slugify().replaceAll("-", "");
//     if ( !_enrichmentLookup ) {
//       _enrichmentLookup = {
//         abilities: foundry.utils.deepClone(SENTIUS.abilities),
//         skills: foundry.utils.deepClone(SENTIUS.skills),
//         spellSchools: foundry.utils.deepClone(SENTIUS.spellSchools),
//         tools: foundry.utils.deepClone(SENTIUS.toolIds)
//       };
//       const addFullKeys = key => Object.entries(SENTIUS[key]).forEach(([k, v]) =>
//         _enrichmentLookup[key][slugify(v.fullKey)] = { ...v, key: k }
//       );
//       addFullKeys("abilities");
//       addFullKeys("skills");
//       addFullKeys("spellSchools");
//     }
//     return _enrichmentLookup;
//   },
//   enumerable: true
// });

/* -------------------------------------------- */

/**
 * Patch an existing config enum to allow conversion from string values to object values without
 * breaking existing modules that are expecting strings.
 * @param {string} key          Key within SENTIUS that has been replaced with an enum of objects.
 * @param {string} fallbackKey  Key within the new config object from which to get the fallback value.
 * @param {object} [options]    Additional options passed through to logCompatibilityWarning.
 */
// function patchConfig(key, fallbackKey, options) {
//   /** @override */
//   function toString() {
//     const message = `The value of CONFIG.SENTIUS.${key} has been changed to an object.`
//       +` The former value can be acccessed from .${fallbackKey}.`;
//     foundry.utils.logCompatibilityWarning(message, options);
//     return this[fallbackKey];
//   }

//   Object.values(SENTIUS[key]).forEach(o => {
//     if ( foundry.utils.getType(o) !== "Object" ) return;
//     Object.defineProperty(o, "toString", {value: toString});
//   });
// }

/* -------------------------------------------- */

export default SENTIUS;
