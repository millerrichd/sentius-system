const { NumberField, StringField } = foundry.data.fields;

/**
 * Field for storing senses data.
 */
export default class SensesField extends foundry.data.fields.SchemaField {
  constructor(fields={}, { initialUnits=null, ...options }={}) {
    const numberConfig = { required: true, nullable: true, integer: true, min: 0, initial: null };
    fields = {
      darkvision: new NumberField({ ...numberConfig, label: "SENTIUS.SenseDarkvision" }),
      blindsight: new NumberField({ ...numberConfig, label: "SENTIUS.SenseBlindsight" }),
      tremorsense: new NumberField({ ...numberConfig, label: "SENTIUS.SenseTremorsense" }),
      truesight: new NumberField({ ...numberConfig, label: "SENTIUS.SenseTruesight" }),
      units: new StringField({
        required: true, nullable: true, blank: false, initial: initialUnits, label: "SENTIUS.SenseUnits"
      }),
      special: new StringField({ required: true, label: "SENTIUS.SenseSpecial" }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, { label: "SENTIUS.Senses", ...options });
  }
}
