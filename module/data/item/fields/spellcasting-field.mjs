import { simplifyBonus } from "../../../utils.mjs";
import FormulaField from "../../fields/formula-field.mjs";

const { SchemaField, StringField } = foundry.data.fields;

/**
 * Data field for class & subclass spellcasting information.
 *
 * @property {string} progression          Spellcasting progression (e.g. full, half, pact).
 * @property {string} ability              Ability used for spell attacks and save DCs.
 * @property {object} preparation
 * @property {string} preparation.formula  Formula used to calculate max prepared spells, if a prepared caster.
 */
export default class SpellcastingField extends SchemaField {
  constructor(fields={}, options={}) {
    fields = {
      progression: new StringField({
        initial: "none",
        blank: false,
        label: "SENTIUS.SpellProgression"
      }),
      ability: new StringField({ label: "SENTIUS.SpellAbility" }),
      preparation: new SchemaField({
        formula: new FormulaField({ label: "SENTIUS.SpellPreparation.Formula" })
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, { label: "SENTIUS.Spellcasting", ...options });
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /**
   * Prepare data for this field. Should be called during the `prepareFinalData` stage.
   * @this {ItemDataModel}
   * @param {object} rollData  Roll data used for formula replacements.
   */
  static prepareData(rollData) {
    this.spellcasting.preparation.max = simplifyBonus(this.spellcasting.preparation.formula, rollData);

    // Temp method for determining spellcasting type until this data is available directly using advancement
    if ( CONFIG.SENTIUS.spellcastingTypes[this.spellcasting.progression] ) {
      this.spellcasting.type = this.spellcasting.progression;
    } else this.spellcasting.type = Object.entries(CONFIG.SENTIUS.spellcastingTypes).find(([, { progression }]) =>
      progression?.[this.spellcasting.progression]
    )?.[0];

    const actor = this.parent.actor;
    if ( !actor ) return;
    this.spellcasting.levels = this.levels ?? this.parent.class?.system.levels;

    // Prepare attack bonus and save DC
    const ability = actor.system.abilities?.[this.spellcasting.ability];
    const mod = ability?.mod ?? 0;
    const modProf = mod + (actor.system.attributes?.prof ?? 0);
    const msak = simplifyBonus(actor.system.bonuses?.msak?.attack, rollData);
    const rsak = simplifyBonus(actor.system.bonuses?.rsak?.attack, rollData);
    this.spellcasting.attack = modProf + (msak === rsak ? msak : 0);
    this.spellcasting.save = ability?.dc ?? (8 + modProf);
  }
}