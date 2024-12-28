import SpellSlotsConfig from "../config/spell-slots-config.mjs";

export default class ActorSpellSlotsConfig extends SpellSlotsConfig {
  constructor(actor, options, abilityId) {
    foundry.utils.logCompatibilityWarning(
      "The `ActorSpellSlotsConfig` application has been deprecated and replaced with `SpellSlotsConfig`.",
      { since: "SENTIUS", until: "SENTIUS" }
    );
    super({ ...options, document: actor });
  }
}
