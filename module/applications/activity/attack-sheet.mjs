import { safePropertyExists } from "../../utils.mjs";
import ActivitySheet from "./activity-sheet.mjs";

/**
 * Sheet for the attack activity.
 */
export default class AttackSheet extends ActivitySheet {

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["attack-activity"]
  };

  /* -------------------------------------------- */

  /** @inheritDoc */
  static PARTS = {
    ...super.PARTS,
    identity: {
      template: "systems/sentius/templates/activity/attack-identity.hbs",
      templates: [
        ...super.PARTS.identity.templates,
        "systems/sentius/templates/activity/parts/attack-identity.hbs"
      ]
    },
    effect: {
      template: "systems/sentius/templates/activity/attack-effect.hbs",
      templates: [
        ...super.PARTS.effect.templates,
        "systems/sentius/templates/activity/parts/attack-damage.hbs",
        "systems/sentius/templates/activity/parts/attack-details.hbs",
        "systems/sentius/templates/activity/parts/damage-part.hbs",
        "systems/sentius/templates/activity/parts/damage-parts.hbs"
      ]
    }
  };

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _prepareEffectContext(context) {
    context = await super._prepareEffectContext(context);

    const availableAbilities = this.activity.availableAbilities;
    context.abilityOptions = [
      {
        value: "", label: game.i18n.format("SENTIUS.DefaultSpecific", {
          default: this.activity.attack.type.classification === "spell"
            ? game.i18n.localize("SENTIUS.Spellcasting").toLowerCase()
            : availableAbilities.size
              ? game.i18n.getListFormatter({ style: "short", type: "disjunction" }).format(
                Array.from(availableAbilities).map(a => CONFIG.SENTIUS.abilities[a].label.toLowerCase())
              )
              : game.i18n.localize("SENTIUS.None").toLowerCase()
        })
      },
      { rule: true },
      { value: "none", label: game.i18n.localize("SENTIUS.None") },
      { value: "spellcasting", label: game.i18n.localize("SENTIUS.Spellcasting") },
      ...Object.entries(CONFIG.SENTIUS.abilities).map(([value, config]) => ({
        value, label: config.label, group: game.i18n.localize("SENTIUS.Abilities")
      }))
    ];

    context.hasBaseDamage = this.item.system.offersBaseDamage;

    return context;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _prepareIdentityContext(context) {
    context = await super._prepareIdentityContext(context);

    context.attackTypeOptions = Object.entries(CONFIG.SENTIUS.attackTypes)
      .map(([value, config]) => ({ value, label: config.label }));
    if ( this.item.system.attackType ) context.attackTypeOptions.unshift({
      value: "",
      label: game.i18n.format("SENTIUS.DefaultSpecific", {
        default: CONFIG.SENTIUS.attackTypes[this.item.system.attackType].label.toLowerCase()
      })
    });

    context.attackClassificationOptions = Object.entries(CONFIG.SENTIUS.attackClassifications)
      .map(([value, config]) => ({ value, label: config.label }));
    if ( this.item.system.attackClassification ) context.attackClassificationOptions.unshift({
      value: "",
      label: game.i18n.format("SENTIUS.DefaultSpecific", {
        default: CONFIG.SENTIUS.attackClassifications[this.item.system.attackClassification].label.toLowerCase()
      })
    });

    return context;
  }
}
