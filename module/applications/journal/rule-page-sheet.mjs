/**
 * Journal entry page that displays a controls for editing rule page tooltip & type.
 */
export default class JournalRulePageSheet extends JournalTextPageSheet {

  /** @inheritDoc */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.classes.push("rule");
    return options;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  get template() {
    return this.isEditable
      ? "systems/sentius/templates/journal/page-rule-edit.hbs"
      : "templates/journal/page-text-view.html";
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async getData(options) {
    const context = await super.getData(options);
    context.CONFIG = CONFIG.SENTIUS;
    context.enrichedTooltip = await TextEditor.enrichHTML(this.object.system.tooltip, {
      relativeTo: this.object,
      secrets: this.object.isOwner
    });
    return context;
  }
}
