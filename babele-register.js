Hooks.once('init', async function() {
  if (typeof Babele !== 'undefined') {
    
    // Configuration principale du module
    Babele.get().register({
      module: 'crucible-fr',
      lang: 'fr',
      dir: 'compendium/fr'
    });

    console.log('Crucible FR | Module de traduction chargé');
  }
});