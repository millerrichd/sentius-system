import UtilitySheet from "../../applications/activity/utility-sheet.mjs";
import UtilityActivityData from "../../data/activity/utility-data.mjs";
import ActivityMixin from "./mixin.mjs";

/**
 * Generic activity for applying effects and rolling an arbitrary die.
 */
export default class UtilityActivity extends ActivityMixin(UtilityActivityData) {
  /* -------------------------------------------- */
  /*  Model Configuration                         */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "SENTIUS.UTILITY"];

  /* -------------------------------------------- */

  /** @inheritDoc */
  static metadata = Object.freeze(
    foundry.utils.mergeObject(super.metadata, {
      type: "utility",
      img: "systems/sentius/icons/svg/activity/utility.svg",
      title: "SENTIUS.UTILITY.Title",
      sheetClass: UtilitySheet,
      usage: {
        actions: {
          rollFormula: UtilityActivity.#rollFormula
        }
      }
    }, { inplace: false })
  );

  /* -------------------------------------------- */
  /*  Activation                                  */
  /* -------------------------------------------- */

  /** @override */
  _usageChatButtons(message) {
    if ( !this.roll.formula ) return super._usageChatButtons(message);
    return [{
      label: this.roll.name || game.i18n.localize("SENTIUS.Roll"),
      icon: '<i class="fa-solid fa-dice" inert></i>',
      dataset: {
        action: "rollFormula",
        visibility: this.roll.visible ? "all" : undefined
      }
    }].concat(super._usageChatButtons(message));
  }

  /* -------------------------------------------- */
  /*  Rolling                                     */
  /* -------------------------------------------- */

  /**
   * Roll the formula attached to this utility.
   * @param {BasicRollProcessConfiguration} [config]   Configuration information for the roll.
   * @param {BasicRollDialogConfiguration} [dialog]    Configuration for the roll dialog.
   * @param {BasicRollMessageConfiguration} [message]  Configuration for the roll message.
   * @returns {Promise<BasicRoll[]|void>}              The created Roll instances.
   */
  async rollFormula(config={}, dialog={}, message={}) {
    if ( !this.roll.formula ) {
      console.warn(`No formula defined for the activity ${this.name} on ${this.item.name} (${this.uuid}).`);
      return;
    }

    const rollConfig = foundry.utils.deepClone(config);
    rollConfig.hookNames = [...(config.hookNames ?? []), "formula"];
    rollConfig.rolls = [{ parts: [this.roll.formula], data: this.getRollData() }].concat(config.rolls ?? []);
    rollConfig.subject = this;

    const dialogConfig = foundry.utils.mergeObject({
      configure: this.roll.prompt,
      options: {
        window: {
          title: this.item.name,
          subtitle: "SENTIUS.RollConfiguration.Title",
          icon: this.item.img
        }
      }
    }, dialog);

    const messageConfig = foundry.utils.mergeObject({
      create: true,
      data: {
        flavor: `${this.item.name} - ${this.roll.label || game.i18n.localize("SENTIUS.OtherFormula")}`,
        flags: {
          sentius: {
            ...this.messageFlags,
            messageType: "roll",
            roll: { type: "generic" }
          }
        }
      }
    }, message);

    if ( "sentius.preRollFormula" in Hooks.events ) {
      foundry.utils.logCompatibilityWarning(
        "The `sentius.preRollFormula` hook has been deprecated and replaced with `sentius.preRollFormulaV2`.",
        { since: "SENTIUS", until: "SENTIUS"" }
      );
      const hookData = {
        formula: rollConfig.rolls[0].parts[0], data: rollConfig.rolls[0].data, chatMessage: messageConfig.create
      };
      if ( Hooks.call("sentius.preRollFormula", this.item, hookData) === false ) return;
      rollConfig.rolls[0].parts[0] = hookData.formula;
      rollConfig.rolls[0].data = hookData.data;
      messageConfig.create = hookData.chatMessage;
    }

    const rolls = await CONFIG.Dice.BasicRoll.build(rollConfig, dialogConfig, messageConfig);
    if ( !rolls.length ) return;

    /**
     * A hook event that fires after a formula has been rolled for a Utility activity.
     * @function sentius.rollFormulaV2
     * @memberof hookEvents
     * @param {BasicRoll[]} rolls             The resulting rolls.
     * @param {object} data
     * @param {UtilityActivity} data.subject  The Activity that performed the roll.
     */
    Hooks.callAll("sentius.rollFormulaV2", rolls, { subject: this });

    if ( "sentius.rollFormula" in Hooks.events ) {
      foundry.utils.logCompatibilityWarning(
        "The `sentius.rollFormula` hook has been deprecated and replaced with `sentius.rollFormulaV2`.",
        { since: "SENTIUS", until: "SENTIUS"" }
      );
      Hooks.callAll("sentius.rollFormula", this.item, rolls[0]);
    }

    return rolls;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Handle rolling the formula attached to this utility.
   * @this {UtilityActivity}
   * @param {PointerEvent} event     Triggering click event.
   * @param {HTMLElement} target     The capturing HTML element which defined a [data-action].
   * @param {ChatMessage5e} message  Message associated with the activation.
   */
  static #rollFormula(event, target, message) {
    this.rollFormula({ event });
  }
}