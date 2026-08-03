// Généré par generate-register.js — voir src/converters/*.js pour la logique.
import * as Crucible from './scripts/converters-crucible.js';
import * as Ember from './scripts/converters-ember-core.js';

Hooks.once("babele.init", (babele) => {
  if (!game.modules.get("babele")?.active) return;

  babele.register({
    module: "crucible-fr",
    lang: "fr",
    dir: "compendium/fr"
  });

  babele.registerConverters({
    crucibleDescription: Crucible.crucibleDescription,
    crucibleActions: Crucible.crucibleActions,
    crucibleDetailReference: Crucible.crucibleDetailReference,
    categories_converter: Ember.categories,
    pages_converter: Ember.emberPages,
    ember_journals_converter: Ember.emberJournals,
    ember_tables_converter: Ember.emberTables,
    ember_table_results_converter: Ember.emberTableResults,
    ember_scene_levels_converter: Ember.emberSceneLevels,
    ember_folders_converter: Ember.emberFolders,
    ember_macros_converter: Ember.emberMacros,
    cards_converter: Ember.cards,
    sounds_converter: Ember.sounds,
    notes_converter: Ember.notes,
  });
});
