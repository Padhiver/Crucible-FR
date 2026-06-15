/**
 * crucible-fr.mjs
 * Module de traduction française pour Crucible (FoundryVTT 14).
 *
 * Fonctionnalités :
 *  - Enrichisseur @[feet N] : affiche "N pieds" avec tooltip en mètres (toujours actif).
 *  - Règle de déplacement   : affiche les mètres sur le ruler (option client).
 */

import { registerFeetEnricher } from "./scripts/enricher.mjs";
import { registerRulerSetting, registerRulerObserver } from "./scripts/ruler.mjs";

Hooks.on("init", () => {
  console.log("Crucible FR | Initialisation.");
  registerRulerSetting();
  registerFeetEnricher();
});

Hooks.on("setup", () => {
  registerRulerObserver();
});

Hooks.once("ready", () => {
  const style = document.createElement("style");
  style.id = "crucible-fr-styles";
  style.textContent = `
    /* Masque l'icône ::before du style "condition" sur les badges @[feet N] */
    enriched-content.cfr-no-icon::before { display: none; }

    /* Mètres sur la règle de déplacement */
    .crucible-fr-meters { opacity: 0.8; font-size: 0.88em; }
  `;
  document.head.appendChild(style);
});
