import { DEFAULT_ACTION_TRANSLATIONS } from './default-actions.js';

Hooks.once('init', async function() {
  if (typeof Babele !== 'undefined') {
    
    // 1. Enregistrement du module et du dossier de traduction
    game.babele.register({
      module: 'crucible-fr',
      lang: 'fr',
      dir: 'compendium/fr'
    });

    // 2. Converters
    Babele.get().registerConverters({
        "actions_converter": (actions, translations) => {
            if (!actions || !translations) return actions;
            
            return actions.map(item => {
                const translation = translations[item.id];
                
                if (translation) {
                    if (translation.name) item.name = translation.name;
                    if (translation.description) item.description = translation.description;
                    if (translation.condition) item.condition = translation.condition;
                }
                return item;
            });
        }
    });

    console.log('Crucible FR | Module de traduction chargé');
  }
});


// Patch des actions par défaut sur les acteurs
Hooks.on("ready", () => {
    // Acteurs existants
    game.actors.contents.forEach(patchDefaultActions);

    // Acteurs mis à jour ou créés
    Hooks.on("updateActor", (actor) => patchDefaultActions(actor));
});

function patchDefaultActions(actor) {
    if (!actor.actions) return;

    Object.entries(DEFAULT_ACTION_TRANSLATIONS).forEach(([id, t]) => {
        const action = actor.actions[id];
        if (action && !action.item) {
            if (t.name) action.name = t.name;
            if (t.description) action.description = t.description;
        }
    });
}