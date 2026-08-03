/**
 * converters/crucible.js
 *
 * Converters Babele custom pour le ruleset Crucible — fonctions JS directes,
 * pas de classe OO ni de moteur générique. Style calqué sur le vrai
 * babele-register.js de production dnd5e_fr-FR (S:\Padhiver\Downloads) :
 * `translations[x._id] ?? translations[x.name]` puis `foundry.utils.mergeObject`.
 *
 * Seuls les champs qui DIVERGENT des mappings intégrés de Babele
 * (babele/script/mapping/default-mappings.js) ont besoin d'un converter ici.
 * Tout le reste (biography en objet {public,private} → converter natif
 * "structured", Item.effects/Actor.items embarqués → converter natif
 * "document") est déclaré directement dans mappings/crucible.js sans passer
 * par ce fichier.
 */

/**
 * `system.description` d'un Item Crucible : chaîne simple OU objet
 * {public, private} selon le record (les deux coexistent dans les mêmes
 * packs, ex: "talent"). Le converter natif "structured" de Babele ne peut
 * traduire QUE la forme objet (il ne fait rien pour une traduction en
 * chaîne simple — vérifié dans structured-data-converter.js#_translateValue) :
 * d'où ce converter custom qui gère les deux formes explicitement.
 */
export function crucibleDescription(value, translation) {
  if (typeof translation === 'undefined' || translation === null) return value;

  if (typeof value === 'string') {
    return typeof translation === 'string' ? translation : value;
  }

  if (value && typeof value === 'object' && typeof translation === 'object') {
    return foundry.utils.mergeObject(value, translation, { inplace: false });
  }

  return value;
}

/**
 * `system.actions[]` — mécanique de jeu propre à Crucible, absente des
 * mappings par défaut de Babele. Chaque action a un `id` stable (jamais
 * `_id, ce n'est pas un Document Foundry) ; les effets imbriqués n'ont
 * souvent ni `_id` ni `id` ni `name` propre (convention Crucible : l'effet
 * "est" l'action) — d'où le repli sur le nom de l'action.
 */
export function crucibleActions(actions, translations) {
  if (!Array.isArray(actions) || !translations) return actions;

  return actions.map(action => {
    const translation = translations[action.id] ?? translations[action.name];
    if (!translation) return action;

    const merged = foundry.utils.mergeObject(action, {
      name: translation.name ?? action.name,
      condition: translation.condition ?? action.condition,
      description: translation.description ?? action.description,
    }, { inplace: false });

    if (translation.effects && Array.isArray(action.effects)) {
      merged.effects = action.effects.map(effect => {
        const key = (effect.name && effect.name.trim()) || action.name;
        const effectTranslation = translation.effects?.[key];
        if (!effectTranslation) return effect;
        return foundry.utils.mergeObject(effect, { name: effectTranslation.name ?? effect.name }, { inplace: false });
      });
    }

    return merged;
  });
}

/**
 * `system.details.ancestry`/`background`/`archetype`/`taxonomy` — référence
 * à un Item résolue par Foundry AVANT que Babele ne traduise l'Actor (donc
 * `value` est déjà l'objet Item inline, pas une chaîne d'id). Comportement
 * repris tel quel de l'ancien crucible-exporter (fonctionne déjà en
 * production) : jamais vérifié autrement qu'en jeu, ne pas modifier sans
 * test réel.
 */
export function crucibleDetailReference(value, translation) {
  if (!value || !translation || typeof translation !== 'object') return value;

  const merged = foundry.utils.mergeObject(value, {
    name: translation.name ?? value.name,
  }, { inplace: false });

  if (translation.description !== undefined) {
    merged.system = { ...(merged.system ?? {}), description: translation.description };
  }

  if (translation.actions !== undefined) {
    const actionsSource = merged.system?.actions ?? merged.actions;
    if (Array.isArray(actionsSource)) {
      const translatedActions = crucibleActions(actionsSource, translation.actions);
      if (merged.system?.actions) merged.system.actions = translatedActions;
      if (merged.actions) merged.actions = translatedActions;
    }
  }

  return merged;
}
