import MovementSensesConfig from "../../shared/movement-senses-config.mjs";

/**
 * A simple form to configure Actor senses.
 */
export default class ActorSensesConfig extends MovementSensesConfig {
  constructor(actor, options) {
    foundry.utils.logCompatibilityWarning(
      "The `ActorSensesConfig` application has been deprecated and replaced with `MovementSensesConfig`.",
      { since: "SENTIUS", until: "SENTIUS" }
    );
    super({ ...options, document: actor, type: "senses" });
  }
}
