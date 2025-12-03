// default-actions.js
export const DEFAULT_ACTION_TRANSLATIONS = {
    cast: {
        name: "Lancer un Sort",
        description: "Tisser l'arcane pour créer une œuvre de magie."
    },
    move: {
        name: "Déplacement",
        description: "Se déplacer d'une distance en dépensant un montant d'Action qui dépend de votre Foulée et du type de déplacement utilisé."
    },
    defend: {
        name: "Défendre",
        description: "Vous concentrez vos efforts pour éviter les dégâts, augmentant votre défense physique. Vous gagnez la condition <strong>Protégé</strong> jusqu'au début de votre prochain Tour."
    },
    delay: {
        name: "Retarder",
        description: "Vous retardez votre action jusqu'à un moment ultérieur du round de Combat. Choisissez une Initiative entre 1 et la valeur d'Initiative du combattant après vous. Vous agirez à cette nouvelle valeur d'Initiative. Vous ne pouvez retarder votre tour qu'une fois par round."
    },
    reactiveStrike: {
        name: "Assaut opportuniste",
        description: "Effectuer une frappe quand un ennemi quitte votre engagement et que vous n'êtes pas <strong>Débordé</strong>."
    },
    throwWeapon: {
        name: "Lancer une Arme",
        description: "Lancer votre arme de mêlée équipée sur une cible proche. L'attaque subit +2 <strong>Fléaux</strong> et l'arme devient <strong>Lâchée</strong>."
    },
    recover: {
        name: "Récupération",
        description: "Passer 10 minutes hors de combat à récupérer de l'effort pour restaurer complètement Santé, Moral, Action et Focus."
    },
    rest: {
        name: "Repos",
        description: "Passer dix heures à se reposer complètement, incluant manger, dormir, soigner les blessures et récupérer les ressources."
    },
    strike: {
        name: "Frappe",
        description: "Attaquer une créature ou un objet avec une de vos armes équipées."
    }
};
