import CreatureTypeConfig from "../../shared/creature-type-config.mjs";

/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 */
export default class ActorTypeConfig extends CreatureTypeConfig {
  constructor(actor, options={}) {
    foundry.utils.logCompatibilityWarning(
      "The `ActorTypeConfig` application has been deprecated and replaced with `CreatureTypeConfig`.",
      { since: "SENTIUS", until: "SENTIUS" }
    );
    if ( options.keyPath ) options.keyPath = options.keyPath?.replace("system.", "");
    super({ ...options, document: actor });
  }
}
