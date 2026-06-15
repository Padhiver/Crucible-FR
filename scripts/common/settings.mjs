import { MODULE_ID } from "./constants.mjs";

/**
 * Register module settings
 */
export function registerSettings() {
  game.settings.register(MODULE_ID, "enableRulerMeters", {
    name: "Afficher les mètres sur la règle",
    hint: "Affiche la distance en mètres entre parenthèses lors du déplacement d'un token.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
  });
}
