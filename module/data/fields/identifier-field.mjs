/**
 * Special case StringField that includes automatic validation for identifiers.
 */
export default class IdentifierField extends foundry.data.fields.StringField {
  /** @override */
  _validateType(value) {
    if ( !sentius.utils.validators.isValidIdentifier(value) ) {
      throw new Error(game.i18n.localize("SENTIUS.IdentifierError"));
    }
  }
}
