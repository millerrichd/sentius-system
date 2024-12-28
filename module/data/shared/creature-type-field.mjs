const { StringField } = foundry.data.fields;

/**
 * Field for storing creature type data.
 */
export default class CreatureTypeField extends foundry.data.fields.SchemaField {
  constructor(fields={}, options={}) {
    fields = {
      value: new StringField({ blank: true, label: "SENTIUS.CreatureType" }),
      subtype: new StringField({ label: "SENTIUS.CreatureTypeSelectorSubtype" }),
      swarm: new StringField({ blank: true, label: "SENTIUS.CreatureSwarmSize" }),
      custom: new StringField({ label: "SENTIUS.CreatureTypeSelectorCustom" }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, { label: "SENTIUS.CreatureType", ...options });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  initialize(value, model, options={}) {
    const obj = super.initialize(value, model, options);

    Object.defineProperty(obj, "label", {
      get() {
        return sentius.documents.Actor5e.formatCreatureType(this);
      },
      enumerable: false
    });
    Object.defineProperty(obj, "config", {
      get() {
        return CONFIG.SENTIUS.creatureTypes[this.value];
      },
      enumerable: false
    });

    return obj;
  }
}
