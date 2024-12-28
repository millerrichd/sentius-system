/**
 * Scan module manifests for any data that should be integrated into the system configuration.
 */
export default function registerModuleData() {
  console.groupCollapsed("D&D 5e | Registering Module Data");
  for ( const manifest of [game.system, ...game.modules.filter(m => m.active), game.world] ) {
    try {
      const complete = methods.map(m => m(manifest)).filter(r => r);
      if ( complete.length ) {
        console.log(`D&D 5e | Registered ${manifest.title} data: ${complete.join(", ")}`);
      }
    } catch(err) {
      console.error(`D&D 5e | Error registering ${manifest.title}\n`, err.message);
    }
  }
  console.groupEnd();
}

const methods = [registerSourceBooks, registerSpellLists];

/* -------------------------------------------- */

/**
 * Register package source books from `flags.sentius.sourceBooks`.
 * @param {Module|System|World} manifest  Manifest from which to register data.
 * @returns {string|void}                 Description of the data registered.
 */
function registerSourceBooks(manifest) {
  if ( !manifest.flags.sentius?.sourceBooks ) return;
  Object.assign(CONFIG.SENTIUS.sourceBooks, manifest.flags.sentius.sourceBooks);
  return "source books";
}

/* -------------------------------------------- */

/**
 * Register package spell lists from `flags.sentius.spellLists`.
 * @param {Module|System|World} manifest  Manifest from which to register data.
 * @returns {string|void}                 Description of the data registered.
 */
function registerSpellLists(manifest) {
  if ( foundry.utils.getType(manifest.flags.sentius?.spellLists) !== "Array" ) return;
  manifest.flags.sentius.spellLists.forEach(uuid => sentius.registry.spellLists.register(uuid));
  return "spell lists";
}
