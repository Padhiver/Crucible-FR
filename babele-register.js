/**
 * Fonctions utilitaires pour sécuriser les données et correspondances
 */
const asArray = (collection) => {
    if (!collection) return [];
    if (Array.isArray(collection)) return collection;
    if (collection instanceof Map) return Array.from(collection.values());
    if (Array.isArray(collection.contents)) return collection.contents;
    if (typeof collection[Symbol.iterator] === "function" && typeof collection !== "string") {
        return Array.from(collection);
    }
    if (typeof collection === "object") return Object.values(collection);
    return [];
};

const findTranslation = (source, translations, index = -1) => {
    if (!source || !translations) return null;
    const keys = [source.id, source._id, source.name, source.label].filter(Boolean);

    if (Array.isArray(translations)) {
        for (const key of keys) {
            const found = translations.find((entry) =>
                entry && typeof entry === "object" &&
                (entry.id === key || entry._id === key || entry.name === key || entry.label === key)
            );
            if (found) return found;
        }
        return translations[index] ?? null;
    }

    if (typeof translations === "object") {
        for (const key of keys) {
            if (translations[key]) return translations[key];
        }
    }
    return null;
};

/**
 * Logique des convertisseurs isolée (plus de dépendance à game.babele.converters)
 */
const actionsConverter = (actions, translations) => {
    if (!actions || !translations) return actions;

    const arr = asArray(actions);
    for (const [index, action] of arr.entries()) {
        if (!action) continue;

        const translation = findTranslation(action, translations, index);
        if (!translation || typeof translation !== "object") continue;

        if (translation.name !== undefined) action.name = translation.name;
        if (translation.description !== undefined) action.description = translation.description;
        if (translation.condition !== undefined) action.condition = translation.condition;

        // Traduction des effets imbriqués dans l'action
        if (translation.effects && Array.isArray(action.effects)) {
            action.effects = action.effects.map((effect, idx) => {
                const effectTranslation = translation.effects[idx];
                if (effectTranslation?.name) effect.name = effectTranslation.name;
                return effect;
            });
        }
    }
    return actions;
};

const adventureItemsConverter = (items, translations) => {
    if (!items || !translations) return items;

    const arr = asArray(items);
    for (const [index, item] of arr.entries()) {
        if (!item) continue;

        const itemTranslation = findTranslation(item, translations, index);
        if (!itemTranslation || typeof itemTranslation !== "object") continue;

        if (itemTranslation.name !== undefined) item.name = itemTranslation.name;

        if (itemTranslation.description !== undefined) {
            item.system ??= {};
            item.system.description = descriptionConverter(
                item.system.description,
                itemTranslation.description
            );
        }

        if (itemTranslation.actions && item.system?.actions) {
            item.system.actions = actionsConverter(item.system.actions, itemTranslation.actions);
        }
    }
    return items;
};

/**
 * Convertisseur universel pour system.description.
 *
 * Gère trois cas :
 *  1. La traduction est une string  → on écrase directement (background, ancestry,
 *     spell, talent, archetype, taxonomy, etc.)
 *  2. La traduction est un objet    → on fusionne clé par clé (items avec {public, private})
 *  3. La traduction est null/undefined → on retourne l'original intact
 */
const descriptionConverter = (original, translation) => {
    if (translation === undefined || translation === null) return original;

    // Cas string : remplacement direct
    if (typeof translation === "string") return translation;

    // Cas objet : fusion clé par clé (on ne touche qu'aux clés présentes dans la trad)
    if (typeof translation === "object" && !Array.isArray(translation)) {
        const result = (original && typeof original === "object") ? { ...original } : {};
        for (const [key, value] of Object.entries(translation)) {
            if (value !== undefined) result[key] = value;
        }
        return result;
    }

    return original;
};

/**
 * Initialisation de Babele via le Hook officiel
 */
Hooks.once("babele.init", (babele) => {
    if (!game.modules.get("babele")?.active) return;

    // 1. Enregistrement du module
    babele.register({
        module: 'crucible-fr',
        lang: 'fr',
        dir: 'compendium/fr'
    });

    // 2. Enregistrement des convertisseurs
    babele.registerConverters({
        "actions_converter": actionsConverter,
        "adventure_items_converter": adventureItemsConverter,

        "description_converter": descriptionConverter,

        "categories_converter": (categories, translations) => {
            if (!categories || !translations) return categories;
            const arr = asArray(categories);
            for (const [index, item] of arr.entries()) {
                if (!item) continue;
                const translation = findTranslation(item, translations, index);
                if (translation?.name !== undefined) item.name = translation.name;
            }
            return categories;
        },

        "nested_object_converter": (obj, translations) => {
            if (!obj || typeof obj !== "object" || Array.isArray(obj) || !translations || typeof translations !== "object") {
                return obj;
            }
            for (const [key, value] of Object.entries(translations)) {
                if (value !== undefined) obj[key] = value;
            }
            return obj;
        }
    });

    console.log('Crucible FR | Module de traduction optimisé et chargé avec succès !');
});

/**
 * Hook Core pour les petits textes système
 */
Hooks.once('i18nInit', () => {
    game.i18n.translations.Sort = "Sort";
    game.i18n.translations.sort = "tri";
});