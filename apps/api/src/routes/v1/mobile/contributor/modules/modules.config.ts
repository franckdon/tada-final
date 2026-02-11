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

export type ProfileModuleStatus =
  | "locked"
  | "in_progress"
  | "completed"
  | "quality";

/**
 * Config "statique" (source de vérité fonctionnelle)
 * => label / order / dependsOn (et rien sur les montants ici)
 */
export type DefaultModuleConfig = {
  key: ModuleKey;
  label: string;
  order: number;
  dependsOn?: ModuleKey;
};

/**
 * Config "runtime" (dynamisée depuis apps/admin / DB)
 * => rewardXof / isActive peuvent venir de contributor_module_reward_config
 */
export type RuntimeModuleConfig = DefaultModuleConfig & {
  rewardXof: number; // 0 => pas de récompense
  isActive: boolean; // module activé ou non
};

/**
 * Source statique des modules (labels + dépendances + ordre)
 * IMPORTANT: on ne met plus rewardXof ici.
 */
export const DEFAULT_MODULES: Record<ModuleKey, DefaultModuleConfig> = {
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

export const ORDERED_MODULE_KEYS: ModuleKey[] = Object.values(DEFAULT_MODULES)
  .sort((a, b) => a.order - b.order)
  .map((m) => m.key);

/**
 * Helpers "statiques"
 */
export function getDefaultModuleConfig(key: ModuleKey): DefaultModuleConfig {
  return DEFAULT_MODULES[key];
}

export function getPreviousModuleKey(key: ModuleKey): ModuleKey | undefined {
  return DEFAULT_MODULES[key].dependsOn;
}

/**
 * Helper de merge DB -> runtime config
 * - fallback rewardXof=0, isActive=true si pas de ligne DB
 * - garde order/label/dependsOn du DEFAULT (pour stabilité)
 *
 * DB rows attendues: { moduleKey, rewardXof, isActive, order?, moduleLabel?, dependsOn? }
 * (on utilisera ça dans le repo/service à l’étape suivante)
 */
export function mergeRuntimeConfig(
  key: ModuleKey,
  dbRow?: Partial<{
    moduleKey: string;
    moduleLabel: string | null;
    order: number | null;
    rewardXof: number | null;
    isActive: boolean | null;
    dependsOn: string | null;
  }>,
): RuntimeModuleConfig {
  const base = getDefaultModuleConfig(key);

  return {
    ...base,
    // on garde base.label / base.order / base.dependsOn comme vérité fonctionnelle
    rewardXof:
      typeof dbRow?.rewardXof === "number" ? dbRow.rewardXof : 0,
    isActive:
      typeof dbRow?.isActive === "boolean" ? dbRow.isActive : true,
  };
}
