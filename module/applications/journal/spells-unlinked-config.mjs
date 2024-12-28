/**
 * Application for configuring a single unlinked spell in a spell list.
 */
export default class SpellsUnlinkedConfig extends DocumentSheet {
  constructor(unlinkedId, object, options={}) {
    super(object, options);
    this.unlinkedId = unlinkedId;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sentius", "unlinked-spell-config"],
      template: "systems/sentius/templates/journal/page-spell-list-unlinked-config.hbs",
      width: 400,
      height: "auto",
      sheetConfig: false
    });
  }

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /**
   * ID of the unlinked spell entry being edited.
   * @type {string}
   */
  unlinkedId;

  /* -------------------------------------------- */

  /** @inheritDoc */
  get title() {
    return `${game.i18n.localize(
      "JOURNALENTRYPAGE.SENTIUS.SpellList.UnlinkedSpells.Configuration")}: ${this.document.name}`;
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  getData() {
    const context = {
      ...super.getData(),
      ...this.document.system.unlinkedSpells.find(u => u._id === this.unlinkedId),
      appId: this.id,
      CONFIG: CONFIG.SENTIUS
    };
    return context;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _updateObject(event, formData) {
    const unlinkedSpells = this.document.toObject().system.unlinkedSpells;
    const editing = unlinkedSpells.find(s => s._id === this.unlinkedId);
    foundry.utils.mergeObject(editing, formData);
    this.document.update({"system.unlinkedSpells": unlinkedSpells});
  }
}
