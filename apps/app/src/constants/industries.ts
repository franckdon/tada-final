export const industries = {
  accounting: { name: { en: "Accounting", fr: "Comptabilité" } },
  airlines_aviation: { name: { en: "Airlines/Aviation", fr: "Aérien / Aviation" } },
  alternative_dispute_resolution: {
    name: { en: "Alternative Dispute Resolution", fr: "Médiation / Arbitrage" },
  },
  alternative_medicine: { name: { en: "Alternative Medicine", fr: "Médecine alternative" } },
  animation: { name: { en: "Animation", fr: "Animation" } },
  apparel_fashion: { name: { en: "Apparel & Fashion", fr: "Mode & habillement" } },
  architecture_planning: { name: { en: "Architecture & Planning", fr: "Architecture & urbanisme" } },
  arts_crafts: { name: { en: "Arts & Crafts", fr: "Arts & artisanat" } },
  automotive: { name: { en: "Automotive", fr: "Automobile" } },
} as const;

export type IndustryKey = keyof typeof industries;
