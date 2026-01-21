// apps/admin/src/lib/validations/plan.ts
export type PlanCreatePayload = {
  tier: string;
  name: string;
  visibility: string;
  sortOrder: number;
  priceType: string;
  translations: Array<{
    locale: string;
    name: string;
    tagline?: string | null;
    idealFor?: string | null;
    keyBenefitFocus?: string | null;
  }>;
  prices: Array<{
    currency: string;
    interval: string;
    amountCents: number | null;
    isCustom: boolean;
  }>;
};

export function validateCreatePlanPayload(payload: PlanCreatePayload) {
  const errors: string[] = [];

  if (!payload.name?.trim()) errors.push("Le nom interne du plan est requis.");
  if (!payload.tier) errors.push("Le tier est requis.");

  const hasTranslationName = payload.translations?.some((t) => t.name?.trim());
  if (!hasTranslationName) {
    errors.push("Ajoute au moins un nom de plan dans une traduction (FR ou EN).");
  }

  if (payload.priceType === "fixed") {
    const anyFixed = payload.prices?.some((p) => !p.isCustom && (p.amountCents ?? 0) > 0);
    if (!anyFixed) errors.push("priceType=fixed : ajoute au moins un prix (non custom) > 0.");
  }

  return { valid: errors.length === 0, errors };
}
