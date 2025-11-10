Hooks.once('init', async function() {
  if (typeof Babele !== 'undefined') {
    game.babele.register({
      module: 'crucible-fr',
      lang: 'fr',
      dir: 'compendium/fr'
    });

    console.log('Crucible FR | Module de traduction chargé');
  }
});