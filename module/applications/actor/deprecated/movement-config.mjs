import MovementSensesConfig from "../../shared/movement-senses-config.mjs";

/**
 * A simple form to set actor movement speeds.
 */
export default class ActorMovementConfig extends MovementSensesConfig {
  constructor(actor, options) {
    foundry.utils.logCompatibilityWarning(
      "The `ActorMovementConfig` application has been deprecated and replaced with `MovementSensesConfig`.",
      { since: "SENTIUS", until: "SENTIUS" }
    );
    super({ ...options, document: actor, type: "movement" });
  }
}
