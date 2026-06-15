/**
 * Module de traduction française pour Crucible (FoundryVTT 14).
 *
 * Fonctionnalités :
 *  - Enrichisseur @[feet N] : affiche "N pieds" avec tooltip en mètres (toujours actif).
 *  - Règle de déplacement   : affiche les mètres sur le ruler (option client).
 */

import { registerSettings } from "./scripts/common/settings.mjs";
import { registerFeetEnricher } from "./scripts/enricher.mjs";
import { registerRulerObserver } from "./scripts/ruler.mjs";

/* -------------------------------------------- */
/*  FoundryVTT Initialization
/* -------------------------------------------- */

Hooks.on("init", () => {
  console.log("Crucible FR | Initialisation.");

  registerSettings();
  registerFeetEnricher();
});

/* -------------------------------------------- */
/*  FoundryVTT Setup
/* -------------------------------------------- */

Hooks.on("setup", () => {
  registerRulerObserver();
});
