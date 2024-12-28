import * as Trait from "../../documents/actor/trait.mjs";
import ActivitySheet from "./activity-sheet.mjs";

/**
 * Sheet for the check activity.
 */
export default class CheckSheet extends ActivitySheet {

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["check-activity"]
  };

  /* -------------------------------------------- */

  /** @inheritDoc */
  static PARTS = {
    ...super.PARTS,
    effect: {
      template: "systems/sentius/templates/activity/check-effect.hbs",
      templates: [
        ...super.PARTS.effect.templates,
        "systems/sentius/templates/activity/parts/check-details.hbs"
      ]
    }
  };

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _prepareEffectContext(context) {
    context = await super._prepareEffectContext(context);

    const group = game.i18n.localize("SENTIUS.Abilities");
    context.abilityOptions = [
      { value: "", label: "" },
      { rule: true },
      { value: "spellcasting", label: game.i18n.localize("SENTIUS.SpellAbility") },
      ...Object.entries(CONFIG.SENTIUS.abilities).map(([value, config]) => ({ value, label: config.label, group }))
    ];
    let ability;
    const associated = this.activity.check.associated;
    if ( (this.item.type === "tool") && !associated.size ) {
      ability = CONFIG.SENTIUS.abilities[this.item.system.ability]?.label?.toLowerCase();
    } else if ( (associated.size === 1) && (associated.first() in CONFIG.SENTIUS.skills) ) {
      ability = CONFIG.SENTIUS.abilities[CONFIG.SENTIUS.skills[associated.first()].ability]?.label?.toLowerCase();
    }
    if ( ability ) context.abilityOptions[0].label = game.i18n.format("SENTIUS.DefaultSpecific", { default: ability });

    context.associatedOptions = [
      ...Object.entries(CONFIG.SENTIUS.skills).map(([value, { label }]) => ({
        value, label, group: game.i18n.localize("SENTIUS.Skills")
      })),
      ...Object.keys(CONFIG.SENTIUS.toolIds).map(value => ({
        value, label: Trait.keyLabel(value, { trait: "tool" }), group: game.i18n.localize("TYPES.Item.toolPl")
      })).sort((lhs, rhs) => lhs.label.localeCompare(rhs.label, game.i18n.lang))
    ];

    context.calculationOptions = [
      { value: "", label: game.i18n.localize("SENTIUS.SAVE.FIELDS.save.dc.CustomFormula") },
      { rule: true },
      { value: "spellcasting", label: game.i18n.localize("SENTIUS.SpellAbility") },
      ...Object.entries(CONFIG.SENTIUS.abilities).map(([value, config]) => ({ value, label: config.label, group }))
    ];

    return context;
  }
}
