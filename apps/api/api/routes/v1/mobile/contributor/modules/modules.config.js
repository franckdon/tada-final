"use strict";
// apps/api/src/routes/v1/mobile/contributor/modules/modules.config.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDERED_MODULE_KEYS = exports.DEFAULT_MODULES = void 0;
exports.getDefaultModuleConfig = getDefaultModuleConfig;
exports.getPreviousModuleKey = getPreviousModuleKey;
exports.mergeRuntimeConfig = mergeRuntimeConfig;
/**
 * Source statique des modules (labels + dépendances + ordre)
 * IMPORTANT: on ne met plus rewardXof ici.
 */
exports.DEFAULT_MODULES = {
    personal_info: {
        key: "personal_info",
        label: "Informations Personnelles",
        order: 1,
    },
    location: {
        key: "location",
        label: "Données de Localisation",
        order: 2,
        dependsOn: "personal_info",
    },
    ethnicity: {
        key: "ethnicity",
        label: "Ethnicité",
        order: 3,
        dependsOn: "location",
    },
    education: {
        key: "education",
        label: "Éducation",
        order: 4,
        dependsOn: "ethnicity",
    },
    professional: {
        key: "professional",
        label: "Données Professionnelles",
        order: 5,
        dependsOn: "education",
    },
    financial: {
        key: "financial",
        label: "Données Financières",
        order: 6,
        dependsOn: "professional",
    },
    banking: {
        key: "banking",
        label: "Banque",
        order: 7,
        dependsOn: "financial",
    },
    insurance: {
        key: "insurance",
        label: "Assurance",
        order: 8,
        dependsOn: "banking",
    },
    languages: {
        key: "languages",
        label: "Langues",
        order: 9,
        dependsOn: "insurance",
    },
};
exports.ORDERED_MODULE_KEYS = Object.values(exports.DEFAULT_MODULES)
    .sort((a, b) => a.order - b.order)
    .map((m) => m.key);
/**
 * Helpers "statiques"
 */
function getDefaultModuleConfig(key) {
    return exports.DEFAULT_MODULES[key];
}
function getPreviousModuleKey(key) {
    return exports.DEFAULT_MODULES[key].dependsOn;
}
/**
 * Helper de merge DB -> runtime config
 * - fallback rewardXof=0, isActive=true si pas de ligne DB
 * - garde order/label/dependsOn du DEFAULT (pour stabilité)
 *
 * DB rows attendues: { moduleKey, rewardXof, isActive, order?, moduleLabel?, dependsOn? }
 * (on utilisera ça dans le repo/service à l’étape suivante)
 */
function mergeRuntimeConfig(key, dbRow) {
    const base = getDefaultModuleConfig(key);
    return {
        ...base,
        // on garde base.label / base.order / base.dependsOn comme vérité fonctionnelle
        rewardXof: typeof dbRow?.rewardXof === "number" ? dbRow.rewardXof : 0,
        isActive: typeof dbRow?.isActive === "boolean" ? dbRow.isActive : true,
    };
}
