import SkillsConfig from "../config/skills-config.mjs";

export default class ActorSkillsConfig extends SkillsConfig {
  constructor(document, options={}) {
    foundry.utils.logCompatibilityWarning(
      "The `ActorSkillsConfig` application has been deprecated and replaced with `SkillsConfig`.",
      { since: "SENTIUS", until: "SENTIUS" }
    );
    super({ ...options, document });
  }
}
