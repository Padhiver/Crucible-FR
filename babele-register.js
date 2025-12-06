import { DEFAULT_ACTION_TRANSLATIONS } from './default-actions.js';

Hooks.once('init', async function () {
    if (typeof Babele !== 'undefined') {

        // 1. Enregistrement du module et du dossier de traduction
        game.babele.register({
            module: 'crucible-fr',
            lang: 'fr',
            dir: 'compendium/fr'
        });

        // 2. Converters
        Babele.get().registerConverters({
            // Converter pour les actions (talents, sorts, consommables)
            "actions_converter": (actions, translations) => {
                if (!actions || !translations) return actions;

                return actions.map(item => {
                    const translation = translations[item.id];

                    if (translation) {
                        if (translation.name) item.name = translation.name;
                        if (translation.description) item.description = translation.description;
                        if (translation.condition) item.condition = translation.condition;

                        // Traduire les effets de l'action
                        if (translation.effects && Array.isArray(item.effects)) {
                            item.effects = item.effects.map((effect, index) => {
                                const effectTranslation = translation.effects[index];
                                if (effectTranslation && effectTranslation.name) {
                                    effect.name = effectTranslation.name;
                                }
                                return effect;
                            });
                        }
                    }
                    return item;
                });
            },

            // Converter pour les catégories (JournalEntry)
            "categories_converter": (categories, translations) => {
                if (!categories || !translations) return categories;

                return categories.map(item => {
                    const translation = translations[item._id];

                    if (translation) {
                        if (translation.name) item.name = translation.name;
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