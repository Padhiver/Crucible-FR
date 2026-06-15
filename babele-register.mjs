// Généré automatiquement par generate-register.js
// Converters actifs : embedded_effects_converter, actions_converter, item_effects_converter, ember_pages_converter, ember_journals_converter, ember_scene_levels_converter, ember_macros_converter, ember_tables_converter, embedded_items_converter, embedded_object_with_actions_converter, embedded_biography_converter, adventure_items_converter, nested_object_converter, categories_converter

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
   */
  const findTranslation = (source, translations, index = -1) => {
    if (!source || !translations) return null;

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
        if (action.effects)         action.effects        = embeddedEffectsConverter(action.effects,        translation.effects);
        if (action.system?.effects) action.system.effects = embeddedEffectsConverter(action.system.effects, translation.effects);
      }
    }

    return actions;
  };

  /**
   * Traduit les effets de type affix embarqués dans un item
   * (name, description, adjective, actions indexées par nom).
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
   * Traduit les pages de journaux Ember.
   * Gère les champs standards (name, text) et les champs spécifiques Ember
   * (overview, gamemaster, exposition, summary, pronunciation, subtitle, outcomes)
   * écrits dans page.system ou page.system.content selon le type de page.
   */
  const emberPagesConverter = (pages, translations) => {
    if (!pages || !translations) return pages;

    const SYSTEM_FIELDS         = ["pronunciation", "subtitle", "exposition", "summary", "overview", "gamemaster"];
    const SYSTEM_CONTENT_FIELDS = ["overview", "gamemaster"];

    const arr = asArray(pages);
    return arr.map(page => {
      if (!page) return page;

      const translation = translations[page._id] ?? translations[page.name];
      if (!translation) return page;

      const update = {
        name: translation.name ?? page.name,
        text: { content: translation.text ?? page.text?.content },
        translated: true,
      };

      const sys = {};
      for (const field of SYSTEM_FIELDS) {
        const value = translation[field];
        if (typeof value === "string" && value.trim()) sys[field] = value;
      }

      const content = {};
      for (const field of SYSTEM_CONTENT_FIELDS) {
        const value = translation[field];
        if (typeof value === "string" && value.trim()) content[field] = value;
      }
      if (Object.keys(content).length > 0) sys.content = content;

      // ── Outcomes (ember.questEvent) ────────────────────────────────────────
      if (translation.outcomes && Array.isArray(page.system?.outcomes)) {
        sys.outcomes = page.system.outcomes.map(outcome => {
          if (!outcome?.id) return outcome;
          const t = translation.outcomes[outcome.id];
          if (!t || typeof t !== "object") return outcome;
          return {
            ...outcome,
            ...(typeof t.label   === "string" && t.label.trim()   ? { label:   t.label   } : {}),
            ...(typeof t.summary === "string" && t.summary.trim() ? { summary: t.summary } : {}),
          };
        });
      }
      // ───────────────────────────────────────────────────────────────────────

      if (Object.keys(sys).length > 0) update.system = sys;

      return foundry.utils.mergeObject(page, update);
    });
  };

  /**
   * Traduit les journaux embarqués dans une Adventure Ember.
   * Descend dans journal.pages via emberPagesConverter.
   * Lookup : _id en priorité, name en fallback.
   */
  const emberJournalsConverter = (journals, translations) => {
    if (!journals || !translations) return journals;

    const arr = asArray(journals);
    for (const journal of arr) {
      if (!journal) continue;

      const translation = translations[journal._id] ?? translations[journal.name];
      if (!translation || typeof translation !== "object") continue;

      if (translation.name !== undefined) journal.name = translation.name;

      if (translation.categories && journal.categories) {
        const catArr = asArray(journal.categories);
        for (const cat of catArr) {
          if (!cat) continue;
          const t = translation.categories[cat._id] ?? translation.categories[cat.name];
          if (t?.name !== undefined) cat.name = t.name;
        }
      }

      if (translation.pages && journal.pages) {
        journal.pages = emberPagesConverter(asArray(journal.pages), translation.pages);
      }
    }

    return journals;
  };

  /**
   * Traduit les scenes, levels et notes embarquées d'une Adventure Ember.
   * Lookup : _id en priorité, name/text en fallback.
   */
const emberSceneLevelsConverter = (scenes, translations) => {
  if (!scenes || !translations) return scenes;

  const arr = asArray(scenes);
  for (const scene of arr) {
    if (!scene) continue;
    const sceneTranslation = translations[scene._id] ?? translations[scene.name];
    if (!sceneTranslation) continue;

    if (sceneTranslation.name    !== undefined) scene.name    = sceneTranslation.name;
    if (sceneTranslation.navName !== undefined) scene.navName = sceneTranslation.navName;

    // Levels
    if (sceneTranslation.levels) {
      const levelArr = asArray(scene.levels);
      for (const level of levelArr) {
        if (!level) continue;
        const translatedName = sceneTranslation.levels[level._id]
                            ?? sceneTranslation.levels[level.name];
        if (typeof translatedName === 'string' && translatedName.trim()) {
          level.name = translatedName;
        }
      }
    }

    // Notes de scène (pins)
    if (sceneTranslation.notes) {
      const noteArr = asArray(scene.notes);
      for (const note of noteArr) {
        if (!note) continue;
        const t = sceneTranslation.notes[note._id]
               ?? sceneTranslation.notes[note.text];
        if (t?.text !== undefined) note.text = t.text;
      }
    }
  }

  return scenes;
  };

  const emberMacrosConverter = (macros, translations) => {
    if (!macros || !translations) return macros;

    const arr = asArray(macros);
    for (const macro of arr) {
      if (!macro) continue;
      const translation = translations[macro._id] ?? translations[macro.name];
      if (!translation || typeof translation !== 'object') continue;
      if (translation.name !== undefined) macro.name = translation.name;
    }

    return macros;
  };

  const emberTablesConverter = (tables, translations) => {
    if (!tables || !translations) return tables;

    const arr = asArray(tables);
    for (const table of arr) {
      if (!table) continue;
      const translation = translations[table._id] ?? translations[table.name];
      if (!translation || typeof translation !== 'object') continue;

      if (translation.name !== undefined) table.name = translation.name;
      if (translation.description !== undefined) table.description = translation.description;

      if (translation.results && table.results) {
        const results = asArray(table.results);
        for (const result of results) {
          if (!result) continue;
          const range = result.range;
          const rangeKey = Array.isArray(range) && range.length >= 2
            ? `${range[0]}-${range[1]}`
            : null;
          const t = translation.results[result._id]
            ?? (rangeKey && translation.results[rangeKey])
            ?? translation.results[result.name];
          if (!t || typeof t !== 'object') continue;
          if (t.name !== undefined) result.name = t.name;
          if (t.description !== undefined) result.description = t.description;
        }
      }
    }

    return tables;
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
      if (itemTranslation.label !== undefined) item.label = itemTranslation.label;

      if (itemTranslation.description !== undefined) {
        item.system ??= {};
        const desc = normalizeDescriptionContainer(itemTranslation.description);
        if (typeof itemTranslation.description === "string") {
          item.system.description = itemTranslation.description;
        } else {
          item.system.description = desc;
        }
      }

      if (itemTranslation.actions !== undefined) {
        if (item.system?.actions) actionsConverter(item.system.actions, itemTranslation.actions);
        if (item.actions)         actionsConverter(item.actions,        itemTranslation.actions);
      }

      if (itemTranslation.effects !== undefined) {
        if (item.effects)         item.effects        = embeddedEffectsConverter(item.effects,        itemTranslation.effects);
        if (item.system?.effects) item.system.effects = embeddedEffectsConverter(item.system.effects, itemTranslation.effects);
      }
    }

    return items;
  };

  /**
   * Traduit un objet embarqué avec ses actions (ancestry, background, archetype…).
   */
  const embeddedObjectWithActionsConverter = (obj, translation) => {
    if (!obj || !translation || typeof translation !== "object") return obj;

    if (translation.name        !== undefined) obj.name        = translation.name;
    if (translation.description !== undefined) {
      obj.system ??= {};
      obj.system.description = translation.description;
    }

    if (translation.actions !== undefined) {
      if (obj.system?.actions) actionsConverter(obj.system.actions, translation.actions);
      if (obj.actions)         actionsConverter(obj.actions,        translation.actions);
    }

    return obj;
  };

  /**
   * Traduit la biographie (champs public / private).
   */
  const embeddedBiographyConverter = (biography, translation) => {
    if (!biography || !translation || typeof translation !== "object") return biography;

    for (const [key, value] of Object.entries(translation)) {
      if (typeof value === "string" && value.trim()) biography[key] = value;
    }

    return biography;
  };

  /**
   * Traduit les items d'une aventure (référencés par nom dans le JSON).
   */
  const adventureItemsConverter = (items, translations) => {
    if (!items || !translations || typeof translations !== "object") return items;

    const arr = asArray(items);
    for (const item of arr) {
      if (!item) continue;

      const t = translations[item.name] ?? translations[item._id];
      if (!t || typeof t !== "object") continue;

      if (t.name        !== undefined) item.name = t.name;
      if (t.description !== undefined) {
        item.system ??= {};
        item.system.description = t.description;
      }

      if (t.actions !== undefined) {
        if (item.system?.actions) actionsConverter(item.system.actions, t.actions);
      }

      if (t.effects !== undefined) {
        if (item.effects)         item.effects        = embeddedEffectsConverter(item.effects,        t.effects);
        if (item.system?.effects) item.system.effects = embeddedEffectsConverter(item.system.effects, t.effects);
      }
    }

    return items;
  };

  /**
   * Traduit un objet imbriqué simple (name, description, actions).
   */
  const nestedObjectConverter = (obj, translation) => {
    if (!obj || !translation || typeof translation !== "object") return obj;

    if (translation.name        !== undefined) obj.name        = translation.name;
    if (translation.description !== undefined) {
      obj.system ??= {};
      obj.system.description = translation.description;
    }

    if (translation.actions !== undefined) {
      if (obj.system?.actions) actionsConverter(obj.system.actions, translation.actions);
      if (obj.actions)         actionsConverter(obj.actions,        translation.actions);
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
    ember_pages_converter: emberPagesConverter,
    ember_journals_converter: emberJournalsConverter,
    ember_scene_levels_converter: emberSceneLevelsConverter,
    ember_macros_converter: emberMacrosConverter,
    ember_tables_converter: emberTablesConverter,
    embedded_items_converter: embeddedItemsConverter,
    embedded_object_with_actions_converter: embeddedObjectWithActionsConverter,
    embedded_biography_converter: embeddedBiographyConverter,
    adventure_items_converter: adventureItemsConverter,
    nested_object_converter: nestedObjectConverter,
    categories_converter: categoriesConverter,
  });
});
