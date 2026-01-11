export const sectors = {
  education: {
    name: {
      en: "Education",
      fr: "Éducation",
    },
  },
  technology: {
    name: {
      en: "Technology",
      fr: "Technologie",
    },
  },
  healthcare: {
    name: {
      en: "Healthcare",
      fr: "Santé",
    },
  },
  finance: {
    name: {
      en: "Finance",
      fr: "Finance",
    },
  },
  retail: {
    name: {
      en: "Retail",
      fr: "Commerce de détail",
    },
  },
  manufacturing: {
    name: {
      en: "Manufacturing",
      fr: "Industrie",
    },
  },
  consulting: {
    name: {
      en: "Consulting",
      fr: "Conseil",
    },
  },
  media: {
    name: {
      en: "Media & Entertainment",
      fr: "Médias & Divertissement",
    },
  },
  real_estate: {
    name: {
      en: "Real Estate",
      fr: "Immobilier",
    },
  },
  transportation: {
    name: {
      en: "Transportation & Logistics",
      fr: "Transport & Logistique",
    },
  },
  agriculture: {
    name: {
      en: "Agriculture",
      fr: "Agriculture",
    },
  },
  construction: {
    name: {
      en: "Construction",
      fr: "Construction",
    },
  },
  energy: {
    name: {
      en: "Energy & Utilities",
      fr: "Énergie & Services publics",
    },
  },
  hospitality: {
    name: {
      en: "Hospitality & Tourism",
      fr: "Hôtellerie & Tourisme",
    },
  },
  nonprofit: {
    name: {
      en: "Non-Profit",
      fr: "Association à but non lucratif",
    },
  },
  other: {
    name: {
      en: "Other",
      fr: "Autre",
    },
  },
} as const;

export type SectorCode = keyof typeof sectors;
