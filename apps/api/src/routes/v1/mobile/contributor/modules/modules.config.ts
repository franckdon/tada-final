// apps/api/src/routes/v1/mobile/contributor/modules/modules.config.ts

export type ModuleKey =
  | "personal_info"
  | "location"
  | "ethnicity"
  | "education"
  | "professional"
  | "financial"
  | "banking"
  | "insurance"
  | "languages";

export type ProfileModuleStatus = "locked" | "in_progress" | "completed" | "quality";

export type ModuleConfig = {
  key: ModuleKey;
  label: string;
  order: number;
  rewardXof: number; // 0 => non récompensé
  dependsOn?: ModuleKey; // séquentiel (module précédent obligatoire à 100%)
};

export const MODULES: Record<ModuleKey, ModuleConfig> = {
  personal_info: {
    key: "personal_info",
    label: "Informations Personnelles",
    order: 1,
    rewardXof: 0, // non récompensé
  },

  location: {
    key: "location",
    label: "Données de Localisation",
    order: 2,
    rewardXof: 400,
    dependsOn: "personal_info",
  },

  ethnicity: {
    key: "ethnicity",
    label: "Ethnicité",
    order: 3,
    rewardXof: 500,
    dependsOn: "location",
  },

  education: {
    key: "education",
    label: "Éducation",
    order: 4,
    rewardXof: 400,
    dependsOn: "ethnicity",
  },

  professional: {
    key: "professional",
    label: "Données Professionnelles",
    order: 5,
    rewardXof: 500,
    dependsOn: "education",
  },

  financial: {
    key: "financial",
    label: "Données Financières",
    order: 6,
    rewardXof: 700,
    dependsOn: "professional",
  },

  banking: {
    key: "banking",
    label: "Banque",
    order: 7,
    rewardXof: 300,
    dependsOn: "financial",
  },

  insurance: {
    key: "insurance",
    label: "Assurance",
    order: 8,
    rewardXof: 300,
    dependsOn: "banking",
  },

  languages: {
    key: "languages",
    label: "Langues",
    order: 9,
    rewardXof: 200,
    dependsOn: "insurance",
  },
};

export const ORDERED_MODULE_KEYS: ModuleKey[] = [
  "personal_info",
  "location",
  "ethnicity",
  "education",
  "professional",
  "financial",
  "banking",
  "insurance",
  "languages",
];

/**
 * Helpers optionnels (utile côté service pour verrouillage)
 */
export function getModuleConfig(key: ModuleKey): ModuleConfig {
  return MODULES[key];
}

export function getPreviousModuleKey(key: ModuleKey): ModuleKey | undefined {
  return MODULES[key].dependsOn;
}
