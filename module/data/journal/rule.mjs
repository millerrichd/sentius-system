const { HTMLField, StringField } = foundry.data.fields;

/**
 * Data definition for Rule journal entry pages.
 *
 * @property {string} tooltip  Content to display in tooltip in place of page's text content.
 * @property {string} type     Type of rule represented. Should match an entry defined in `CONFIG.SENTIUS.ruleTypes`.
 */
export default class RuleJournalPageData extends foundry.abstract.TypeDataModel {

  /** @inheritDoc */
  static defineSchema() {
    return {
      tooltip: new HTMLField({textSearch: true, label: "SENTIUS.Rule.Tooltip"}),
      type: new StringField({blank: false, initial: "rule", label: "SENTIUS.Rule.Type.Label"})
    };
  }

  /* -------------------------------------------- */

  /**
   * Render a rich tooltip for this page.
   * @param {EnrichmentOptions} [enrichmentOptions={}]  Options for text enrichment.
   * @returns {{content: string, classes: string[]}}
   */
  async richTooltip(enrichmentOptions={}) {
    const context = {
      page: this.parent,
      type: CONFIG.SENTIUS.ruleTypes[this.type].label,
      content: await TextEditor.enrichHTML(this.tooltip || this.parent.text.content, {
        secrets: false, relativeTo: this.parent, ...enrichmentOptions
      })
    };
    return {
      content: await renderTemplate("systems/sentius/templates/journal/page-rule-tooltip.hbs", context),
      classes: ["sentius-tooltip", "rule-tooltip"]
    };
  }

  /* -------------------------------------------- */

  /** @override */
  async toEmbed(config, options={}) {
    return this.parent._embedTextPage(config, options);
  }
}
