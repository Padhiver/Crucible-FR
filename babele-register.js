Hooks.once("init", async function () {
  if (typeof Babele !== "undefined") {
    // Configuration principale du module
    Babele.get().register({
      module: "crucible-fr",
      lang: "fr",
      dir: "compendium/fr",
    });

    game.babele.registerConverters({
      categories: (categories, translations) => {
        if (!translations) return;
        for (const category of categories) {
          registerTranslations(category, translations[category._id], {
            name: "name",
          });
        }
      },
    });

    console.log("Crucible FR | Module de traduction chargé");
  }
});

/* -------------------------------------------- */
/*  Utilities
/* -------------------------------------------- */

/**
 * Assign translations to an object given a translation object and an object of translations keys.
 * @param {Object}                 original  Original object that should be modifed.
 * @param {Object}                 other     Object containing the translations.
 * @param {Record<string, string>} keys      Object container the pair "original:other" keys.
 */
const registerTranslations = (original, other = {}, keys = {}) => {
  if (!original || !other || !keys) return;

  for (const [originalKey, otherKey] of Object.entries(keys)) {
    // Get properties
    const originalValue = getProperty(original, originalKey);
    const otherValue = getProperty(other, otherKey);

    // Keys should exist in both objects (not undefined or null)
    if (originalValue == null || otherValue == null) return;

    // Set the value of original with the value of other
    setProperty(original, originalKey, otherValue);
  }
};
