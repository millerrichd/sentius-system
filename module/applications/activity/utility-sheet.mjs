import ActivitySheet from "./activity-sheet.mjs";

/**
 * Sheet for the utility activity.
 */
export default class UtilitySheet extends ActivitySheet {

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["utility-activity"]
  };

  /* -------------------------------------------- */

  /** @inheritDoc */
  static PARTS = {
    ...super.PARTS,
    identity: {
      template: "systems/sentius/templates/activity/utility-identity.hbs",
      templates: super.PARTS.identity.templates
    },
    effect: {
      template: "systems/sentius/templates/activity/utility-effect.hbs",
      templates: super.PARTS.effect.templates
    }
  };
}
