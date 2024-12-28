import LocalDocumentField from "../../fields/local-document-field.mjs";
const { HTMLField, SchemaField, StringField } = foundry.data.fields;

/**
 * Shared contents of the details schema between various actor types.
 */
export default class DetailsField {
  /**
   * Fields shared between characters, NPCs, and vehicles.
   *
   * @type {object}
   * @property {object} biography         Actor's biography data.
   * @property {string} biography.value   Full HTML biography information.
   * @property {string} biography.public  Biography that will be displayed to players with observer privileges.
   */
  static get common() {
    return {
      biography: new SchemaField({
        value: new HTMLField({label: "SENTIUS.Biography"}),
        public: new HTMLField({label: "SENTIUS.BiographyPublic"})
      }, {label: "SENTIUS.Biography"})
    };
  }

  /* -------------------------------------------- */

  /**
   * Fields shared between characters and NPCs.
   *
   * @type {object}
   * @property {string} alignment    Creature's alignment.
   * @property {Item5e|string} race  Creature's race item or name.
   */
  static get creature() {
    return {
      alignment: new StringField({required: true, label: "SENTIUS.Alignment"}),
      ideal: new StringField({required: true, label: "SENTIUS.Ideals"}),
      bond: new StringField({required: true, label: "SENTIUS.Bonds"}),
      flaw: new StringField({required: true, label: "SENTIUS.Flaws"}),
      race: new LocalDocumentField(foundry.documents.BaseItem, {
        required: true, fallback: true, label: "SENTIUS.Species"
      })
    };
  }
}
