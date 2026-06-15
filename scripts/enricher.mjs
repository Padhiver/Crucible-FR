/**
 * Enrichisseur @[feet N]
 *
 * Syntaxe : @[feet 30]  →  <enriched-content class="condition">30 pieds</enriched-content>
 * Tooltip natif Foundry : affiche la valeur en mètres au survol.
 *
 * [NOTE]
 * Le style "condition" (bordure pointillée, sans fond) est utilisé tel quel,
 * mais l'icône ::before est masquée via CSS pour un rendu épuré.
 */

import { feetToMeters } from "./common/utils.mjs";

/**
 * Transforme @[feet N] en élément DOM enrichi avec tooltip mètres.
 * @param {RegExpMatchArray} match
 * @returns {HTMLElement|Text}
 */
function enrichFeet([fullMatch, valueString]) {
  const feet = parseFloat(valueString);
  if (isNaN(feet)) return new Text(fullMatch);

  const metersLabel = feetToMeters(feet);
  const feetLabel = feet === 1 ? "pied" : "pieds";

  const tag = document.createElement("enriched-content");
  tag.classList.add("condition", "cfr-no-icon");
  tag.textContent = `${feet}\u00a0${feetLabel}`;

  const tooltipHTML = `<h3 class="tooltip-title divider">${feet}\u00a0${feetLabel}</h3><p>≈\u00a0${metersLabel}</p>`;
  tag.dataset.tooltipHtml = tooltipHTML;
  tag.dataset.tooltipClass = "crucible crucible-tooltip";
  tag.dataset.tooltipDirection = "UP";

  return tag;
}

/* -------------------------------------------- */

/**
 * Enregistre l'enricher
 */
export function registerFeetEnricher() {
  CONFIG.TextEditor.enrichers.push({
    id: "crucibleFrFeet",
    pattern: /@\[feet ([\d.]+)]/g,
    enricher: enrichFeet,
  });
  console.log("Crucible FR | Enrichisseur @[feet N] enregistré.");
}
