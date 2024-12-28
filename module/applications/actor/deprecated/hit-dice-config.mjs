import HitDiceConfig from "../config/hit-dice-config.mjs";

/**
 * A simple form to set actor hit dice amounts.
 */
export default class ActorHitDiceConfig extends HitDiceConfig {
  constructor(actor, options) {
    foundry.utils.logCompatibilityWarning(
      "The `ActorHitDiceConfig` application has been deprecated and replaced with `HitDiceConfig`.",
      { since: "SENTIUS", until: "SENTIUS" }
    );
    super({ ...options, document: actor });
  }
}
