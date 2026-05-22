// Généré automatiquement par generate-register.js
// Converters actifs : embedded_effects_converter, actions_converter, item_effects_converter, embedded_items_converter, embedded_object_with_actions_converter, embedded_biography_converter, adventure_items_converter, nested_object_converter, categories_converter

Hooks.once("babele.init", (babele) => {
  if (!game.modules.get("babele")?.active) return;

  babele.register({
    module: "crucible-fr",
    lang: "fr",
    dir: "compendium/fr"
  });

  // ─── Utilitaires internes ──────────────────────────────────────────────────

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

  /**
   * Recherche une traduction dans un objet (keyed par nom) ou un tableau.
   * Priorité : name > label > id > _id > fallback par index.
   * Les JSON générés par crucible-exporter utilisent le nom comme clé principale,
   * d'où la priorité inversée par rapport à la convention Babele.
   */
  const findTranslation = (source, translations, index = -1) => {
    if (!source || !translations) return null;

    // Priorité : name > label > id > _id (ordre aligné sur les JSON générés)
    const keys = [source.name, source.label, source.id, source._id].filter(Boolean);

    if (typeof translations === "object" && !Array.isArray(translations)) {
      for (const key of keys) {
        if (translations[key]) return translations[key];
      }
    }

    if (Array.isArray(translations)) {
      for (const key of keys) {
        const found = translations.find((entry) =>
          entry && typeof entry === "object" &&
          (entry.name === key || entry.label === key || entry.id === key || entry._id === key)
        );
        if (found) return found;
      }
      return translations[index] ?? null;
    }

    return null;
  };

  const normalizeDescriptionContainer = (value) => {
    if (typeof value === "string") return { public: value, private: "" };
    if (!value || typeof value !== "object" || Array.isArray(value)) return { public: "", private: "" };
    return value;
  };


  /**
   * Traduit les effets embarqués (name, label, description, changes string).
   * Supporte également les actions imbriquées dans chaque effet.
   */
  const embeddedEffectsConverter = (effects, translations) => {
    if (!effects || !translations) return effects;

    const arr = asArray(effects);
    for (const [index, effect] of arr.entries()) {
      if (!effect) continue;

      const translation = findTranslation(effect, translations, index);
      if (!translation || typeof translation !== "object") continue;

      if (translation.name  !== undefined) effect.name  = translation.name;
      if (translation.label !== undefined) effect.label = translation.label;

      if (translation.description !== undefined) {
        effect.description = translation.description;
        effect.system ??= {};
        effect.system.description = translation.description;
      }

      // ↓ Amélioration : changes dont la valeur est une string (ex: labels de rollBonuses)
      if (Array.isArray(translation.changes) && translation.changes.length > 0) {
        const targetChanges = effect.system?.changes ?? effect.changes;
        if (Array.isArray(targetChanges)) {
          for (const change of targetChanges) {
            if (!change || typeof change.key !== "string") continue;
            const translated = translation.changes.find(c => c.key === change.key);
            if (translated && typeof translated.value === "string") {
              change.value = translated.value;
            }
          }
        }
      }

      // ↓ Amélioration : actions imbriquées dans les effets (cohérence avec embedded_affixes_converter)
      if (translation.actions !== undefined) {
        if (effect.system?.actions) actionsConverter(effect.system.actions, translation.actions);
        if (effect.actions)         actionsConverter(effect.actions,        translation.actions);
      }
    }

    return effects;
  };

  /**
   * Traduit les actions (name, label, description, condition, effets imbriqués).
   */
  const actionsConverter = (actions, translations) => {
    if (!actions || !translations) return actions;

    const arr = asArray(actions);
    for (const [index, action] of arr.entries()) {
      if (!action) continue;

      const translation = findTranslation(action, translations, index);
      if (!translation || typeof translation !== "object") continue;

      if (translation.name  !== undefined) action.name  = translation.name;
      // ↓ Amélioration : champ label manquant dans la version précédente
      if (translation.label !== undefined) action.label = translation.label;

      if (translation.description !== undefined) {
        action.description = translation.description;
        action.system ??= {};
        action.system.description = translation.description;
      }

      if (translation.condition !== undefined) {
        action.condition = translation.condition;
        action.system ??= {};
        action.system.condition = translation.condition;
      }

      if (translation.effects !== undefined) {
        if (action.effects)        action.effects        = embeddedEffectsConverter(action.effects,        translation.effects);
        if (action.system?.effects) action.system.effects = embeddedEffectsConverter(action.system.effects, translation.effects);
      }
    }

    return actions;
  };

  /**
   * Traduit les effets de type affix embarqués dans un item
   * (name, description, adjective, actions indexées par id).
   */
  const itemEffectsConverter = (effects, translations) => {
    if (!effects || !translations) return effects;

    const arr = asArray(effects);
    for (const effect of arr) {
      if (!effect?.name) continue;

      const translation = findTranslation(effect, translations);
      if (!translation || typeof translation !== "object") continue;

      if (translation.name        !== undefined) effect.name = translation.name;
      if (translation.description !== undefined) effect.description = translation.description;

      if (translation.adjective !== undefined) {
        effect.system ??= {};
        effect.system.adjective = translation.adjective;
      }

      if (translation.actions !== undefined && effect.system?.actions) {
        actionsConverter(effect.system.actions, translation.actions);
      }
    }

    return effects;
  };

  /**
   * Traduit les items embarqués (name, label, description, actions, effets).
   */
  const embeddedItemsConverter = (items, translations) => {
    if (!items || !translations || typeof translations !== "object") return items;

    const arr = asArray(items);
    for (const [index, item] of arr.entries()) {
      if (!item) continue;

      const itemTranslation = findTranslation(item, translations, index);
      if (!itemTranslation || typeof itemTranslation !== "object") continue;

      if (itemTranslation.name  !== undefined) item.name  = itemTranslation.name;
      // ↓ Amélioration : champ label manquant dans la version précédente
      if (itemTranslation.label !== undefined) item.label = itemTranslation.label;

      if (itemTranslation.description !== undefined) {
        item.system ??= {};

        if (
          typeof itemTranslation.description === "object" &&
          itemTranslation.description !== null &&
          !Array.isArray(itemTranslation.description)
        ) {
          item.system.description = normalizeDescriptionContainer(item.system.description);
          if (itemTranslation.description.public  !== undefined) item.system.description.public  = itemTranslation.description.public;
          if (itemTranslation.description.private !== undefined) item.system.description.private = itemTranslation.description.private;
        } else {
          item.system.description = itemTranslation.description;
        }
      }

      if (itemTranslation.actions && item.system?.actions) {
        item.system.actions = actionsConverter(item.system.actions, itemTranslation.actions);
      }
      if (itemTranslation.effects && item.effects) {
        item.effects = embeddedEffectsConverter(item.effects, itemTranslation.effects);
      }
    }

    return items;
  };

  /**
   * Traduit un objet unique portant des actions (ancestry, background, archetype…).
   */
  const embeddedObjectWithActionsConverter = (obj, translations) => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj) || !translations || typeof translations !== "object") {
      return obj;
    }

    if (translations.name        !== undefined) obj.name        = translations.name;
    if (translations.description !== undefined) obj.description = translations.description;
    if (translations.caption     !== undefined) obj.caption     = translations.caption;

    if (translations.actions) {
      if (obj.actions)         obj.actions        = actionsConverter(obj.actions,        translations.actions);
      if (obj.system?.actions) obj.system.actions = actionsConverter(obj.system.actions, translations.actions);
    }

    return obj;
  };

  /**
   * Traduit un objet biographie { public, private } ou une string.
   * Amélioration : en mode string, on retourne la chaîne traduite disponible
   * (public → private → valeur originale), et en mode objet on copie toutes
   * les clés présentes dans la traduction (pas seulement public/private).
   */
  const embeddedBiographyConverter = (obj, translations) => {
    if (!obj || !translations || typeof translations !== "object") return obj;

    if (typeof obj === "string") {
      // ↓ Amélioration : on explore toutes les clés, pas seulement public/private
      for (const candidate of ["public", "private", ...Object.keys(translations)]) {
        if (typeof translations[candidate] === "string" && translations[candidate].trim()) {
          return translations[candidate];
        }
      }
      return obj;
    }

    if (typeof obj !== "object" || Array.isArray(obj)) return obj;

    for (const [key, value] of Object.entries(translations)) {
      if (value !== undefined) obj[key] = value;
    }

    return obj;
  };

  // adventure_items_converter : alias d'embeddedItemsConverter
  // (les items d'aventure sont indexés par nom dans les JSON générés)
  const adventureItemsConverter = (items, translations) => embeddedItemsConverter(items, translations);

  /**
   * Traduit un objet plat en copiant toutes les clés de la traduction.
   */
  const nestedObjectConverter = (obj, translations) => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj) || !translations || typeof translations !== "object") {
      return obj;
    }

    for (const [key, value] of Object.entries(translations)) {
      if (value !== undefined) obj[key] = value;
    }

    return obj;
  };

  /**
   * Traduit les catégories (name uniquement).
   */
  const categoriesConverter = (categories, translations) => {
    if (!categories || !translations) return categories;

    const arr = asArray(categories);
    for (const [index, item] of arr.entries()) {
      if (!item) continue;
      const translation = findTranslation(item, translations, index);
      if (translation?.name !== undefined) item.name = translation.name;
    }

    return categories;
  };

  // ─── Enregistrement ────────────────────────────────────────────────────────

  babele.registerConverters({
    embedded_effects_converter: embeddedEffectsConverter,
    actions_converter: actionsConverter,
    item_effects_converter: itemEffectsConverter,
    embedded_items_converter: embeddedItemsConverter,
    embedded_object_with_actions_converter: embeddedObjectWithActionsConverter,
    embedded_biography_converter: embeddedBiographyConverter,
    adventure_items_converter: adventureItemsConverter,
    nested_object_converter: nestedObjectConverter,
    categories_converter: categoriesConverter,
  });
});
