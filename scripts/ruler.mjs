/**
 * Affichage des mètres sur la règle de déplacement.
 *
 * Un unique setting client (enableRulerMeters, activé par défaut) contrôle
 * la fonctionnalité — visible directement dans le panneau des réglages.
 */

import { MODULE_ID } from "./common/constants.mjs";
import { feetToMeters } from "./common/utils.mjs";

/**
 * Démarre l'observer sur "canvasReady"
 */
export function registerRulerObserver() {
  if (!game.settings.get(MODULE_ID, "enableRulerMeters")) return;

  Hooks.once("canvasReady", _startObserver);
  if (canvas?.ready) _startObserver();
}

/* -------------------------------------------- */

/**
 * Créé un observer sur l'élément "hud"
 */
function _startObserver() {
  const hud = document.getElementById("hud");
  if (!hud) {
    console.warn(
      "Crucible FR | #hud introuvable, MutationObserver non démarré.",
    );
    return;
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) _processWaypointLabels(node);
      }
    }
  });

  observer.observe(hud, { childList: true, subtree: true });
  console.log("Crucible FR | MutationObserver sur #hud démarré.");
}

/* -------------------------------------------- */

/**
 * Traverse les labels et injecte le système métrique
 * @param {HTMLElement} root
 */
function _processWaypointLabels(root) {
  const labels = root.classList?.contains("waypoint-label")
    ? [root]
    : Array.from(root.querySelectorAll(".waypoint-label"));

  for (const label of labels) _injectMetersInLabel(label);
}

/* -------------------------------------------- */

/**
 * Injecte le système métrique dans un label
 * @param {HTMLElement} label
 */
function _injectMetersInLabel(label) {
  const measureEl = label.querySelector(".total-measurement:not(.total-cost)");
  if (!measureEl || label.querySelector(".crucible-fr-meters")) return;

  const rawText = Array.from(measureEl.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join("")
    .trim();

  const feet = parseFloat(rawText.replace(/\s|\u00a0/g, "").replace(",", "."));
  if (isNaN(feet) || feet <= 0) return;

  const span = document.createElement("span");
  span.className = "crucible-fr-meters";
  span.textContent = `\u00a0(≈\u00a0${feetToMeters(feet)})`;
  measureEl.appendChild(span);
}
