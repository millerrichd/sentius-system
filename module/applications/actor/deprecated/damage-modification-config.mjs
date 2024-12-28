import DamagesConfig from "../config/damages-config.mjs";

/**
 * Configuration app for damage modification.
 */
export default class DamageModificationConfig extends DamagesConfig {
  constructor(actor, trait, options={}) {
    foundry.utils.logCompatibilityWarning(
      "The `DamageModificationConfig` application has been deprecated and replaced with `DamagesConfig`.",
      { since: "SENTIUS", until: "SENTIUS" }
    );
    super({ ...options, document: actor, trait: "dm" });
  }
}
