import Advancement from "./advancement.mjs";
import SubclassFlow from "../../applications/advancement/subclass-flow.mjs";

/**
 * Advancement that indicates when a class takes a subclass. Only allowed on class items and can only be taken once.
 */
export default class SubclassAdvancement extends Advancement {

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      order: 70,
      icon: "icons/skills/trades/mining-pickaxe-yellow-blue.webp",
      typeIcon: "systems/sentius/icons/svg/subclass.svg",
      title: game.i18n.localize("SENTIUS.ADVANCEMENT.Subclass.Title"),
      hint: game.i18n.localize("SENTIUS.ADVANCEMENT.Subclass.Hint"),
      apps: {
        flow: SubclassFlow
      }
    });
  }

  /* -------------------------------------------- */
  /*  Display Methods                             */
  /* -------------------------------------------- */

  /** @inheritDoc */
  summaryforLevel(level, { configMode=false }={}) {
    const subclass = this.item.subclass;
    if ( configMode || !subclass ) return "";
    return subclass.toAnchor().outerHTML;
  }

  /* -------------------------------------------- */
  /*  Editing Methods                             */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static availableForItem(item) {
    return !item.advancement.byType.Subclass?.length;
  }
}
