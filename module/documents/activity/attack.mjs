import AttackSheet from "../../applications/activity/attack-sheet.mjs";
import AttackRollConfigurationDialog from "../../applications/dice/attack-configuration-dialog.mjs";
import AttackActivityData from "../../data/activity/attack-data.mjs";
import { _applyDeprecatedD20Configs, _createDeprecatedD20Config } from "../../dice/d20-roll.mjs";
import { getTargetDescriptors } from "../../utils.mjs";
import ActivityMixin from "./mixin.mjs";

/**
 * Activity for making attacks and rolling damage.
 */
export default class AttackActivity extends ActivityMixin(AttackActivityData) {
  /* -------------------------------------------- */
  /*  Model Configuration                         */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "SENTIUS.ATTACK"];

  /* -------------------------------------------- */

  /** @inheritDoc */
  static metadata = Object.freeze(
    foundry.utils.mergeObject(super.metadata, {
      type: "attack",
      img: "systems/sentius/icons/svg/activity/attack.svg",
      title: "SENTIUS.ATTACK.Title.one",
      sheetClass: AttackSheet,
      usage: {
        actions: {
          rollAttack: AttackActivity.#rollAttack,
          rollDamage: AttackActivity.#rollDamage
        }
      }
    }, { inplace: false })
  );

  /* -------------------------------------------- */
  /*  Activation                                  */
  /* -------------------------------------------- */

  /** @override */
  _usageChatButtons(message) {
    const buttons = [{
      label: game.i18n.localize("SENTIUS.Attack"),
      icon: '<i class="sentius-icon" data-src="systems/sentius/icons/svg/trait-weapon-proficiencies.svg" inert></i>',
      dataset: {
        action: "rollAttack"
      }
    }];
    if ( this.damage.parts.length || this.item.system.properties?.has("amm") ) buttons.push({
      label: game.i18n.localize("SENTIUS.Damage"),
      icon: '<i class="fa-solid fa-burst" inert></i>',
      dataset: {
        action: "rollDamage"
      }
    });
    return buttons.concat(super._usageChatButtons(message));
  }

  /* -------------------------------------------- */

  /** @override */
  async _triggerSubsequentActions(config, results) {
    this.rollAttack({ event: config.event }, {}, { data: { "flags.sentius.originatingMessage": results.message?.id } });
  }

  /* -------------------------------------------- */
  /*  Rolling                                     */
  /* -------------------------------------------- */

  /**
   * @typedef {D20RollProcessConfiguration} AttackRollProcessConfiguration
   * @property {string|boolean} [ammunition]  Specific ammunition to consume, or `false` to prevent any ammo usage.
   * @property {string} [attackMode]          Mode to use for making the attack and rolling damage.
   * @property {string} [mastery]             Weapon mastery option to use.
   */

  /**
   * @typedef {BasicRollDialogConfiguration} AttackRollDialogConfiguration
   * @property {AttackRollConfigurationDialogOptions} [options]  Configuration options.
   */

  /**
   * @typedef {object} AmmunitionUpdate
   * @property {string} id        ID of the ammunition item to update.
   * @property {boolean} destroy  Will the ammunition item be deleted?
   * @property {number} quantity  New quantity after the ammunition is spent.
   */

  /**
   * Perform an attack roll.
   * @param {AttackRollProcessConfiguration} config  Configuration information for the roll.
   * @param {AttackRollDialogConfiguration} dialog   Configuration for the roll dialog.
   * @param {BasicRollMessageConfiguration} message  Configuration for the roll message.
   * @returns {Promise<D20Roll[]|null>}
   */
  async rollAttack(config={}, dialog={}, message={}) {
    const targets = getTargetDescriptors();

    if ( (this.item.type === "weapon") && (this.item.system.quantity === 0) ) {
      ui.notifications.warn("SENTIUS.ATTACK.Warning.NoQuantity", { localize: true });
    }

    const buildConfig = this._buildAttackConfig.bind(this, config.rolls?.shift());

    const rollConfig = foundry.utils.mergeObject({
      ammunition: this.item.getFlag("sentius", `last.${this.id}.ammunition`),
      attackMode: this.item.getFlag("sentius", `last.${this.id}.attackMode`),
      elvenAccuracy: this.actor?.getFlag("sentius", "elvenAccuracy")
        && CONFIG.SENTIUS.characterFlags.elvenAccuracy.abilities.includes(this.ability),
      halflingLucky: this.actor?.getFlag("sentius", "halflingLucky"),
      mastery: this.item.getFlag("sentius", `last.${this.id}.mastery`),
      target: targets.length === 1 ? targets[0].ac : undefined
    }, config);

    const ammunitionOptions = this.item.system.ammunitionOptions ?? [];
    if ( ammunitionOptions.length ) ammunitionOptions.unshift({ value: "", label: "" });
    if ( rollConfig.ammunition === undefined ) rollConfig.ammunition = ammunitionOptions?.[1]?.value;
    else if ( !ammunitionOptions?.find(m => m.value === rollConfig.ammunition) ) {
      rollConfig.ammunition = ammunitionOptions?.[0]?.value;
    }
    const attackModeOptions = this.item.system.attackModes;
    if ( !attackModeOptions?.find(m => m.value === rollConfig.attackMode) ) {
      rollConfig.attackMode = attackModeOptions?.[0]?.value;
    }
    const masteryOptions = this.item.system.masteryOptions;
    if ( !masteryOptions?.find(m => m.value === rollConfig.mastery) ) {
      rollConfig.mastery = masteryOptions?.[0]?.value;
    }

    rollConfig.hookNames = [...(config.hookNames ?? []), "attack", "d20Test"];
    rollConfig.rolls = [{
      options: {
        ammunition: rollConfig.ammunition,
        attackMode: rollConfig.attackMode,
        criticalSuccess: this.criticalThreshold,
        mastery: rollConfig.mastery
      }
    }].concat(config.rolls ?? []);
    rollConfig.subject = this;
    rollConfig.rolls.forEach((r, index) => buildConfig(rollConfig, r, null, index));

    const dialogConfig = foundry.utils.mergeObject({
      applicationClass: AttackRollConfigurationDialog,
      options: {
        ammunitionOptions: rollConfig.ammunition !== false ? ammunitionOptions : [],
        attackModeOptions,
        buildConfig,
        masteryOptions: (masteryOptions?.length > 1) && !config.mastery ? masteryOptions : [],
        position: {
          top: config.event ? config.event.clientY - 80 : null,
          left: window.innerWidth - 710
        }
      }
    }, dialog);

    const messageConfig = foundry.utils.mergeObject({
      create: true,
      data: {
        flavor: `${this.item.name} - ${game.i18n.localize("SENTIUS.AttackRoll")}`,
        flags: {
          sentius: {
            ...this.messageFlags,
            messageType: "roll",
            roll: { type: "attack" }
          }
        },
        speaker: ChatMessage.getSpeaker({ actor: this.actor })
      }
    }, message);

    if ( "sentius.preRollAttack" in Hooks.events ) {
      foundry.utils.logCompatibilityWarning(
        "The `sentius.preRollAttack` hook has been deprecated and replaced with `sentius.preRollAttackV2`.",
        { since: "SENTIUS", until: "SENTIUS"" }
      );
      const oldConfig = _createDeprecatedD20Config(rollConfig, dialogConfig, messageConfig);
      if ( Hooks.call("sentius.preRollAttack", this.item, oldConfig) === false ) return null;
      _applyDeprecatedD20Configs(rollConfig, dialogConfig, messageConfig, oldConfig);
    }

    const rolls = await CONFIG.Dice.D20Roll.buildConfigure(rollConfig, dialogConfig, messageConfig);
    await CONFIG.Dice.D20Roll.buildEvaluate(rolls, rollConfig, messageConfig);
    if ( !rolls.length ) return null;
    for ( const key of ["ammunition", "attackMode", "mastery"] ) {
      if ( !rolls[0].options[key] ) continue;
      foundry.utils.setProperty(messageConfig.data, `flags.sentius.roll.${key}`, rolls[0].options[key]);
    }
    await CONFIG.Dice.D20Roll.buildPost(rolls, rollConfig, messageConfig);

    const flags = {};
    let ammoUpdate = null;

    if ( rolls[0].options.ammunition ) {
      const ammo = this.actor?.items.get(rolls[0].options.ammunition);
      if ( ammo ) {
        if ( !ammo.system.properties?.has("ret") ) {
          ammoUpdate = { id: ammo.id, quantity: Math.max(0, ammo.system.quantity - 1) };
          ammoUpdate.destroy = ammo.system.uses.autoDestroy && (ammoUpdate.quantity === 0);
        }
        flags.ammunition = rolls[0].options.ammunition;
      }
    } else if ( rolls[0].options.attackMode?.startsWith("thrown") && !this.item.system.properties?.has("ret") ) {
      ammoUpdate = { id: this.item.id, quantity: Math.max(0, this.item.system.quantity - 1) };
    } else if ( !rolls[0].options.ammunition && dialogConfig.options?.ammunitionOptions?.length ) {
      flags.ammunition = "";
    }
    if ( rolls[0].options.attackMode ) flags.attackMode = rolls[0].options.attackMode;
    else if ( rollConfig.attackMode ) rolls[0].options.attackMode = rollConfig.attackMode;
    if ( rolls[0].options.mastery ) flags.mastery = rolls[0].options.mastery;
    if ( !foundry.utils.isEmpty(flags) && this.actor.items.has(this.item.id) ) {
      await this.item.setFlag("sentius", `last.${this.id}`, flags);
    }

    /**
     * A hook event that fires after an attack has been rolled but before any ammunition is consumed.
     * @function sentius.rollAttackV2
     * @memberof hookEvents
     * @param {D20Roll[]} rolls                        The resulting rolls.
     * @param {object} data
     * @param {AttackActivity|null} data.subject       The Activity that performed the attack.
     * @param {AmmunitionUpdate|null} data.ammoUpdate  Any updates related to ammo consumption for this attack.
     */
    Hooks.callAll("sentius.rollAttackV2", rolls, { subject: this, ammoUpdate });

    if ( "sentius.rollAttack" in Hooks.events ) {
      foundry.utils.logCompatibilityWarning(
        "The `sentius.rollAttack` hook has been deprecated and replaced with `sentius.rollAttackV2`.",
        { since: "SENTIUS", until: "SENTIUS"" }
      );
      const oldAmmoUpdate = ammoUpdate ? [{ _id: ammoUpdate.id, "system.quantity": ammoUpdate.quantity }] : [];
      Hooks.callAll("sentius.rollAttack", this.item, rolls[0], oldAmmoUpdate);
      if ( oldAmmoUpdate[0] ) {
        ammoUpdate.id = oldAmmoUpdate[0]._id;
        ammoUpdate.quantity = foundry.utils.getProperty(oldAmmoUpdate[0], "system.quantity");
      }
    }

    // Commit ammunition consumption on attack rolls resource consumption if the attack roll was made
    if ( ammoUpdate?.destroy ) {
      // If ammunition was deleted, store a copy of it in the roll message
      const data = this.actor.items.get(ammoUpdate.id).toObject();
      const messageId = messageConfig.data?.flags?.sentius?.originatingMessage
        ?? rollConfig.event?.target.closest("[data-message-id]")?.dataset.messageId;
      const attackMessage = sentius.registry.messages.get(messageId, "attack")?.pop();
      await attackMessage?.setFlag("sentius", "roll.ammunitionData", data);
      await this.actor.deleteEmbeddedDocuments("Item", [ammoUpdate.id]);
    }
    else if ( ammoUpdate ) await this.actor?.updateEmbeddedDocuments("Item", [
      { _id: ammoUpdate.id, "system.quantity": ammoUpdate.quantity }
    ]);

    /**
     * A hook event that fires after an attack has been rolled and ammunition has been consumed.
     * @function sentius.postRollAttack
     * @memberof hookEvents
     * @param {D20Roll[]} rolls                   The resulting rolls.
     * @param {object} data
     * @param {AttackActivity|null} data.subject  The activity that performed the attack.
     */
    Hooks.callAll("sentius.postRollAttack", rolls, { subject: this });

    return rolls;
  }

  /* -------------------------------------------- */

  /**
   * Configure a roll config for each roll performed as part of the attack process. Will be called once per roll
   * in the process each time an option is changed in the roll configuration interface.
   * @param {Partial<D20RollConfiguration>} [initialRoll]  Initial roll passed to the rolling method.
   * @param {D20RollProcessConfiguration} process          Configuration for the entire rolling process.
   * @param {D20RollConfiguration} config                  Configuration for a specific roll.
   * @param {FormDataExtended} [formData]                  Any data entered into the rolling prompt.
   * @param {number} index                                 Index of the roll within all rolls being prepared.
   */
  _buildAttackConfig(initialRoll, process, config, formData, index) {
    const ammunition = formData?.get("ammunition") ?? process.ammunition;
    const attackMode = formData?.get("attackMode") ?? process.attackMode;
    const mastery = formData?.get("mastery") ?? process.mastery;

    let { parts, data } = this.getAttackData({ ammunition, attackMode, situational: config.data?.situational });
    const options = config.options ?? {};
    if ( ammunition !== undefined ) options.ammunition = ammunition;
    if ( attackMode !== undefined ) options.attackMode = attackMode;
    if ( mastery !== undefined ) options.mastery = mastery;

    if ( index === 0 ) {
      if ( initialRoll?.data ) data = { ...data, ...initialRoll.data };
      if ( initialRoll?.parts ) parts.unshift(...initialRoll.parts);
      if ( initialRoll?.options ) foundry.utils.mergeObject(options, initialRoll.options);
    }

    config.parts = parts;
    config.data = data;
    config.options = options;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Handle performing an attack roll.
   * @this {AttackActivity}
   * @param {PointerEvent} event     Triggering click event.
   * @param {HTMLElement} target     The capturing HTML element which defined a [data-action].
   * @param {ChatMessage5e} message  Message associated with the activation.
   */
  static #rollAttack(event, target, message) {
    this.rollAttack({ event });
  }

  /* -------------------------------------------- */

  /**
   * Handle performing a damage roll.
   * @this {AttackActivity}
   * @param {PointerEvent} event     Triggering click event.
   * @param {HTMLElement} target     The capturing HTML element which defined a [data-action].
   * @param {ChatMessage5e} message  Message associated with the activation.
   */
  static #rollDamage(event, target, message) {
    const lastAttack = message.getAssociatedRolls("attack").pop();
    const attackMode = lastAttack?.getFlag("sentius", "roll.attackMode");

    // Fetch the ammunition used with the last attack roll
    let ammunition;
    const actor = lastAttack?.getAssociatedActor();
    if ( actor ) {
      const storedData = lastAttack.getFlag("sentius", "roll.ammunitionData");
      ammunition = storedData
        ? new Item.implementation(storedData, { parent: actor })
        : actor.items.get(lastAttack.getFlag("sentius", "roll.ammunition"));
    }

    this.rollDamage({ event, ammunition, attackMode });
  }

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async getFavoriteData() {
    return foundry.utils.mergeObject(await super.getFavoriteData(), { modifier: this.labels.modifier });
  }
}
