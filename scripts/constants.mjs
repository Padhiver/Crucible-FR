/**
 * constants.mjs
 * Constantes partagées et utilitaire de conversion pieds → mètres.
 */

export const MODULE_ID = "crucible-fr";

/**
 * Convertit des pieds en mètres, arrondi au multiple de 0,5 le plus proche.
 * Exemples : 30 → "9 m", 5 → "1,5 m", 15 → "4,5 m"
 * @param {number} feet
 * @returns {string}
 */
export function feetToMeters(feet) {
  const raw     = feet * 0.3048;
  const rounded = Math.round(raw * 2) / 2;
  const maximumFractionDigits = rounded % 1 === 0 ? 0 : 1;
  return rounded.toLocaleString("fr-FR", { maximumFractionDigits }) + "\u00a0m";
}
