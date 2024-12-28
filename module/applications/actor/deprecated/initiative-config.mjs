import InitiativeConfig from "../config/initiative-config.mjs";

/**
 * A simple sub-application of the ActorSheet which is used to configure properties related to initiative.
 */
export default class ActorInitiativeConfig extends InitiativeConfig {
  constructor(actor, options, abilityId) {
    foundry.utils.logCompatibilityWarning(
      "The `ActorInitiativeConfig` application has been deprecated and replaced with `InitiativeConfig`.",
      { since: "SENTIUS", until: "SENTIUS" }
    );
    super({ ...options, document: actor });
  }
}
