const { BooleanField, NumberField, StringField } = foundry.data.fields;

/**
 * Field for storing movement data.
 */
export default class MovementField extends foundry.data.fields.SchemaField {
  constructor(fields={}, { initialUnits=null, ...options }={}) {
    const numberConfig = { required: true, nullable: true, min: 0, step: 0.1, initial: null };
    fields = {
      burrow: new NumberField({ ...numberConfig, label: "SENTIUS.MovementBurrow" }),
      climb: new NumberField({ ...numberConfig, label: "SENTIUS.MovementClimb" }),
      fly: new NumberField({ ...numberConfig, label: "SENTIUS.MovementFly" }),
      swim: new NumberField({ ...numberConfig, label: "SENTIUS.MovementSwim" }),
      walk: new NumberField({ ...numberConfig, label: "SENTIUS.MovementWalk" }),
      units: new StringField({
        required: true, nullable: true, blank: false, initial: initialUnits, label: "SENTIUS.MovementUnits"
      }),
      hover: new BooleanField({ required: true, label: "SENTIUS.MovementHover" }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, { label: "SENTIUS.Movement", ...options });
  }
}
