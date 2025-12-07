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

                return actions.map(action => {
                    const translation = translations[action.id];

                    if (translation) {
                        if (translation.name) action.name = translation.name;
                        if (translation.description) action.description = translation.description;
                        if (translation.condition) action.condition = translation.condition;

                        // Traduire les effets de l'action
                        if (translation.effects && Array.isArray(action.effects)) {
                            action.effects = action.effects.map((effect, index) => {
                                const effectTranslation = translation.effects[index];
                                if (effectTranslation && effectTranslation.name) {
                                    effect.name = effectTranslation.name;
                                }
                                return effect;
                            });
                        }
                    }
                    return action;
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
            },

            // Converter pour les items des actors dans les Adventures
            "adventure_items_converter": (items, translations) => {
                if (!items || !translations) return items;

                return items.map(item => {
                    const itemTranslation = translations[item.name];
                    
                    if (itemTranslation) {
                        if (itemTranslation.name) {
                            item.name = itemTranslation.name;
                        }
                        
                        if (itemTranslation.description) {
                            if (typeof itemTranslation.description === 'object') {
                                if (!item.system) item.system = {};
                                if (!item.system.description) item.system.description = {};
                                if (itemTranslation.description.public) {
                                    item.system.description.public = itemTranslation.description.public;
                                }
                                if (itemTranslation.description.private) {
                                    item.system.description.private = itemTranslation.description.private;
                                }
                            } else if (typeof itemTranslation.description === 'string') {
                                if (!item.system) item.system = {};
                                item.system.description = itemTranslation.description;
                            }
                        }
                        
                        if (itemTranslation.actions && Array.isArray(item.system?.actions)) {
                            item.system.actions = item.system.actions.map(action => {
                                const actionTranslation = itemTranslation.actions[action.id];
                                
                                if (actionTranslation) {
                                    if (actionTranslation.name) action.name = actionTranslation.name;
                                    if (actionTranslation.description) action.description = actionTranslation.description;
                                    if (actionTranslation.condition) action.condition = actionTranslation.condition;
                                    
                                    if (actionTranslation.effects && Array.isArray(action.effects)) {
                                        action.effects = action.effects.map((effect, index) => {
                                            const effectTranslation = actionTranslation.effects[index];
                                            if (effectTranslation?.name) {
                                                effect.name = effectTranslation.name;
                                            }
                                            return effect;
                                        });
                                    }
                                }
                                
                                return action;
                            });
                        }
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
    Hooks.on("renderDocumentSheetV2", (actor) => patchDefaultActions(actor));
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