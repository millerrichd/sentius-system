import ActivitySheet from "./activity-sheet.mjs";

/**
 * Sheet for the forward activity.
 */
export default class ForwardSheet extends ActivitySheet {

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["forward-activity"]
  };

  /* -------------------------------------------- */

  /** @inheritDoc */
  static PARTS = {
    ...super.PARTS,
    identity: {
      template: "systems/sentius/templates/activity/forward-identity.hbs",
      templates: super.PARTS.identity.templates
    },
    activation: {
      template: "systems/sentius/templates/activity/forward-activation.hbs",
      templates: [
        "systems/sentius/templates/activity/parts/activity-consumption.hbs"
      ]
    },
    effect: {
      template: "systems/sentius/templates/activity/forward-effect.hbs"
    }
  };

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _prepareActivationContext(context) {
    context = await super._prepareActivationContext(context);
    context.showConsumeSpellSlot = false;
    context.showScaling = true;
    return context;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _prepareEffectContext(context) {
    context = await super._prepareEffectContext(context);
    context.activityOptions = [
      { value: "", label: "" },
      ...this.item.system.activities.contents
        .filter(a => (a.type !== "forward") && (CONFIG.SENTIUS.activityTypes[a.type] !== false))
        .map(activity => ({ value: activity.id, label: activity.name }))
    ];
    return context;
  }

  /* -------------------------------------------- */

  /**
   * Prepare the tab information for the sheet.
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs() {
    return this._markTabs({
      identity: {
        id: "identity", group: "sheet", icon: "fa-solid fa-tag",
        label: "SENTIUS.ACTIVITY.SECTIONS.Identity"
      },
      activation: {
        id: "activation", group: "sheet", icon: "fa-solid fa-boxes-stacked",
        label: "SENTIUS.CONSUMPTION.FIELDS.consumption.label"
      },
      effect: {
        id: "effect", group: "sheet", icon: "fa-solid fa-sun",
        label: "SENTIUS.ACTIVITY.SECTIONS.Effect"
      }
    });
  }
}
