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