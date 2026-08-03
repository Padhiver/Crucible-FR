/**
 * converters/ember-core.js
 *
 * Converters JS "core Foundry" partagés par les deux cibles Ember
 * (crucible et dnd5e) — journaux/pages, scènes, tables, dossiers, macros,
 * cartes, sons, notes. Système-agnostique : ni Crucible ni D&D5e n'ont de
 * schéma particulier pour ces types, c'est le contenu Ember lui-même
 * (pages custom : pronunciation/subtitle/exposition/summary/overview/
 * gamemaster — voir core/page-fields.js) qui diverge des mappings par
 * défaut de Babele (JournalEntryPage par défaut n'a que
 * caption/src/text/width/height).
 *
 * Copié tel quel dans le dossier de sortie de l'export Ember (voir
 * register/generate-register.js) — porté depuis l'ancien
 * register/generate-register.js (code généré), jamais réécrit depuis, donc
 * pas re-testé en jeu dans cette passe : ne pas modifier la logique sans
 * vérification réelle.
 */

function asArray(collection) {
  if (!collection) return [];
  if (Array.isArray(collection)) return collection;
  if (collection instanceof Map) return Array.from(collection.values());
  if (Array.isArray(collection.contents)) return collection.contents;
  if (typeof collection[Symbol.iterator] === 'function' && typeof collection !== 'string') {
    return Array.from(collection);
  }
  if (typeof collection === 'object') return Object.values(collection);
  return [];
}

/** Priorité : name > label > id > _id > repli par index. */
function findTranslation(source, translations, index = -1) {
  if (!source || !translations) return null;

  const keys = [source.name, source.label, source.id, source._id].filter(Boolean);

  if (typeof translations === 'object' && !Array.isArray(translations)) {
    for (const key of keys) {
      if (translations[key]) return translations[key];
    }
  }

  if (Array.isArray(translations)) {
    for (const key of keys) {
      const found = translations.find((entry) =>
        entry && typeof entry === 'object'
        && (entry.name === key || entry.label === key || entry.id === key || entry._id === key)
      );
      if (found) return found;
    }
    return translations[index] ?? null;
  }

  return null;
}

/**
 * Pages de journaux Ember — champs standards (name, text) + champs
 * spécifiques Ember écrits dans page.system ou page.system.content selon
 * le type de page.
 */
export function emberPages(pages, translations) {
  if (!pages || !translations) return pages;

  const SYSTEM_FIELDS = ['pronunciation', 'subtitle', 'exposition', 'summary', 'overview', 'gamemaster'];
  const SYSTEM_CONTENT_FIELDS = ['overview', 'gamemaster'];

  return asArray(pages).map(page => {
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
      if (typeof value === 'string' && value.trim()) sys[field] = value;
    }

    const content = {};
    for (const field of SYSTEM_CONTENT_FIELDS) {
      const value = translation[field];
      if (typeof value === 'string' && value.trim()) content[field] = value;
    }
    if (Object.keys(content).length > 0) sys.content = content;

    if (translation.outcomes && Array.isArray(page.system?.outcomes)) {
      sys.outcomes = page.system.outcomes.map(outcome => {
        if (!outcome?.id) return outcome;
        const t = translation.outcomes[outcome.id];
        if (!t || typeof t !== 'object') return outcome;
        return {
          ...outcome,
          ...(typeof t.label === 'string' && t.label.trim() ? { label: t.label } : {}),
          ...(typeof t.summary === 'string' && t.summary.trim() ? { summary: t.summary } : {}),
        };
      });
    }

    if (Object.keys(sys).length > 0) update.system = sys;

    return foundry.utils.mergeObject(page, update);
  });
}

export function emberJournals(journals, translations) {
  if (!journals || !translations) return journals;

  for (const journal of asArray(journals)) {
    if (!journal) continue;

    const translation = translations[journal._id] ?? translations[journal.name];
    if (!translation || typeof translation !== 'object') continue;

    if (translation.name !== undefined) journal.name = translation.name;

    if (translation.categories && journal.categories) {
      for (const cat of asArray(journal.categories)) {
        if (!cat) continue;
        const t = translation.categories[cat._id] ?? translation.categories[cat.name];
        if (t?.name !== undefined) cat.name = t.name;
      }
    }

    if (translation.pages && journal.pages) {
      journal.pages = emberPages(asArray(journal.pages), translation.pages);
    }
  }

  return journals;
}

export function emberTables(tables, translations) {
  if (!tables || !translations) return tables;

  for (const table of asArray(tables)) {
    if (!table) continue;
    const translation = translations[table._id] ?? translations[table.name];
    if (!translation || typeof translation !== 'object') continue;

    if (translation.name !== undefined) table.name = translation.name;
    if (translation.description !== undefined) table.description = translation.description;

    if (translation.results && table.results) {
      for (const result of asArray(table.results)) {
        if (!result) continue;
        const range = result.range;
        const rangeKey = Array.isArray(range) && range.length >= 2 ? `${range[0]}-${range[1]}` : null;
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
}

export function emberFolders(folders, translations) {
  if (!folders || !translations) return folders;

  for (const folder of asArray(folders)) {
    if (!folder?.name) continue;
    const translated = translations[folder.name];
    if (typeof translated === 'string' && translated.trim()) folder.name = translated;
  }

  return folders;
}

export function emberMacros(macros, translations) {
  if (!macros || !translations) return macros;

  for (const macro of asArray(macros)) {
    if (!macro) continue;
    const translation = translations[macro._id] ?? translations[macro.name];
    if (!translation || typeof translation !== 'object') continue;
    if (translation.name !== undefined) macro.name = translation.name;
  }

  return macros;
}

export function emberSceneLevels(scenes, translations) {
  if (!scenes || !translations) return scenes;

  for (const scene of asArray(scenes)) {
    if (!scene) continue;
    const sceneTranslation = translations[scene._id] ?? translations[scene.name];
    if (!sceneTranslation) continue;

    if (sceneTranslation.name !== undefined) scene.name = sceneTranslation.name;
    if (sceneTranslation.navName !== undefined) scene.navName = sceneTranslation.navName;

    if (sceneTranslation.levels) {
      for (const level of asArray(scene.levels)) {
        if (!level) continue;
        const translatedName = sceneTranslation.levels[level._id] ?? sceneTranslation.levels[level.name];
        if (typeof translatedName === 'string' && translatedName.trim()) level.name = translatedName;
      }
    }

    if (sceneTranslation.notes) {
      for (const note of asArray(scene.notes)) {
        if (!note) continue;
        const t = sceneTranslation.notes[note._id] ?? sceneTranslation.notes[note.text];
        if (t?.text !== undefined) note.text = t.text;
      }
    }

    if (sceneTranslation.regions) {
      for (const region of asArray(scene.regions)) {
        if (!region) continue;
        const regionTranslation = sceneTranslation.regions[region._id] ?? sceneTranslation.regions[region.name];
        if (!regionTranslation || typeof regionTranslation !== 'object') continue;

        if (regionTranslation.name !== undefined) region.name = regionTranslation.name;

        if (regionTranslation.behaviors) {
          for (const behavior of asArray(region.behaviors)) {
            if (!behavior) continue;
            const t = regionTranslation.behaviors[behavior._id] ?? regionTranslation.behaviors[behavior.name];
            if (t?.name !== undefined) behavior.name = t.name;
          }
        }
      }
    }

    if (sceneTranslation.deltaTokens) {
      for (const token of asArray(scene.tokens)) {
        if (!token) continue;
        const t = sceneTranslation.deltaTokens[token._id] ?? sceneTranslation.deltaTokens[token.name];
        if (t?.name !== undefined) token.name = t.name;
      }
    }
  }

  return scenes;
}

export function emberTableResults(results, translations) {
  if (!results || !translations) return results;

  for (const result of asArray(results)) {
    if (!result) continue;
    let translation = findTranslation(result, translations);
    if (!translation && Array.isArray(result.range) && result.range.length >= 2) {
      translation = translations[`${result.range[0]}-${result.range[1]}`];
    }
    if (!translation) translation = translations.unknown;
    if (!translation || typeof translation !== 'object') continue;

    if (translation.name !== undefined) {
      if (result.name !== undefined) result.name = translation.name;
      if (result.text !== undefined) result.text = translation.name;
    }
    if (translation.description !== undefined) result.description = translation.description;
  }

  return results;
}

export function categories(items, translations) {
  if (!items || !translations) return items;

  asArray(items).forEach((item, index) => {
    if (!item) return;
    const translation = findTranslation(item, translations, index);
    if (translation?.name !== undefined) item.name = translation.name;
  });

  return items;
}

export function cards(cardsValue, translations) {
  if (!cardsValue || !translations) return cardsValue;

  asArray(cardsValue).forEach((card, index) => {
    if (!card) return;
    const translation = findTranslation(card, translations, index);
    if (!translation || typeof translation !== 'object') return;

    if (translation.name !== undefined) card.name = translation.name;
    if (translation.description !== undefined) card.description = translation.description;

    if (translation.faces && typeof translation.faces === 'object' && Array.isArray(card.faces)) {
      card.faces.forEach((face, faceIndex) => {
        if (!face) return;
        const faceKeys = [face.name, face.id, face._id].filter(Boolean);
        let faceTranslation;
        for (const key of faceKeys) {
          if (translation.faces[key] !== undefined) { faceTranslation = translation.faces[key]; break; }
        }
        if (faceTranslation === undefined) faceTranslation = Object.values(translation.faces)[faceIndex];
        if (typeof faceTranslation === 'string' && faceTranslation) face.text = faceTranslation;
      });
    }
  });

  return cardsValue;
}

export function sounds(soundsValue, translations) {
  if (!soundsValue || !translations) return soundsValue;

  asArray(soundsValue).forEach((sound, index) => {
    if (!sound) return;
    const translation = findTranslation(sound, translations, index);
    if (!translation || typeof translation !== 'object') return;
    if (translation.name !== undefined) sound.name = translation.name;
    if (translation.description !== undefined) sound.description = translation.description;
  });

  return soundsValue;
}

export function notes(notesValue, translations) {
  if (!notesValue || !translations) return notesValue;

  for (const note of asArray(notesValue)) {
    if (!note) continue;
    const key = note._id ?? note.text;
    const translation = key !== undefined ? translations[key] : undefined;
    if (typeof translation === 'string' && translation.trim()) note.text = translation;
  }

  return notesValue;
}
