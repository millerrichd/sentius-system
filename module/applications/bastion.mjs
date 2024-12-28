import {default as BastionSettingsConfig} from "./settings/bastion-settings.mjs";

export default class BastionConfig extends BastionSettingsConfig {
  constructor(...args) {
    foundry.utils.logCompatibilityWarning(
      "The `BastionConfig` application has been deprecated and replaced with `BastionSettingsConfig`.",
      { since: "SENTIUS", until: "SENTIUS" }
    );
    super(...args);
  }
}
