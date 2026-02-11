// apps/admin/src/lib/contributor-modules.ts

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

export type ModuleConfig = {
  key: ModuleKey;
  label: string;
  defaultOrder: number;
  defaultDependsOn?: ModuleKey;
};

export const MODULES: Record<ModuleKey, ModuleConfig> = {
  personal_info: {
    key: "personal_info",
    label: "Informations Personnelles",
    defaultOrder: 1,
  },
  location: {
    key: "location",
    label: "Données de Localisation",
    defaultOrder: 2,
    defaultDependsOn: "personal_info",
  },
  ethnicity: {
    key: "ethnicity",
    label: "Ethnicité",
    defaultOrder: 3,
    defaultDependsOn: "location",
  },
  education: {
    key: "education",
    label: "Éducation",
    defaultOrder: 4,
    defaultDependsOn: "ethnicity",
  },
  professional: {
    key: "professional",
    label: "Données Professionnelles",
    defaultOrder: 5,
    defaultDependsOn: "education",
  },
  financial: {
    key: "financial",
    label: "Données Financières",
    defaultOrder: 6,
    defaultDependsOn: "professional",
  },
  banking: {
    key: "banking",
    label: "Banque",
    defaultOrder: 7,
    defaultDependsOn: "financial",
  },
  insurance: {
    key: "insurance",
    label: "Assurance",
    defaultOrder: 8,
    defaultDependsOn: "banking",
  },
  languages: {
    key: "languages",
    label: "Langues",
    defaultOrder: 9,
    defaultDependsOn: "insurance",
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
