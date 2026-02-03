// src/lib/plans/plan-limits.ts

export type PlanCode = "starter" | "growth" | "business" | "entreprise";

/**
 * numeric limits sometimes need:
 * - "unlimited" (business/entreprise for dashboards, etc.)
 * - "custom" (enterprise negotiated)
 */
export type LimitValue = number | "unlimited" | "custom";

/**
 * yes/no values sometimes need "custom" for enterprise.
 * (If you don't need custom here, you can keep boolean only.)
 */
export type BoolValue = boolean | "custom";

export type PlanLimits = {
  // Core usage
  respondentCompletes: LimitValue; // Respondent Completes (Submissions)
  deploymentLocations: LimitValue; // Deployment Locations
  surveyVerificationRounds: LimitValue; // Survey verification rounds
  questionsPerSurvey: LimitValue; // Questions per Survey
  segmentationDimensions: LimitValue; // Segmentation Dimensions
  userSeats: LimitValue; // User Seats

  // Feature flags
  surveyTemplateLibraryAndImport: BoolValue; // Survey Template Library & Import (yes/no)

  // Dashboards
  proprietaryDashboardsAccess: LimitValue; // number of dashboards or unlimited/custom
};

export const PLAN_LIMITS: Record<PlanCode, PlanLimits> = {
  starter: {
    respondentCompletes: 500,
    deploymentLocations: 1,
    surveyVerificationRounds: 1,
    questionsPerSurvey: 10,
    segmentationDimensions: 2,
    userSeats: 3,
    surveyTemplateLibraryAndImport: true,
    proprietaryDashboardsAccess: 4,
  },

  growth: {
    respondentCompletes: 1000,
    deploymentLocations: 2,
    surveyVerificationRounds: 2,
    questionsPerSurvey: 15,
    segmentationDimensions: 4,
    userSeats: 10,
    surveyTemplateLibraryAndImport: true,
    proprietaryDashboardsAccess: 8,
  },

  business: {
    respondentCompletes: 2000,
    deploymentLocations: 5,
    surveyVerificationRounds: 3,
    questionsPerSurvey: 25,
    segmentationDimensions: 8,
    userSeats: "unlimited",
    surveyTemplateLibraryAndImport: true,
    proprietaryDashboardsAccess: "unlimited",
  },

  entreprise: {
    respondentCompletes: "custom",
    deploymentLocations: "custom",
    surveyVerificationRounds: "custom",
    questionsPerSurvey: "custom",
    segmentationDimensions: "custom",
    userSeats: "unlimited",
    surveyTemplateLibraryAndImport: "custom",
    proprietaryDashboardsAccess: "custom",
  },
} as const;

export function getPlanLimits(code: PlanCode): PlanLimits {
  return PLAN_LIMITS[code];
}

export function isCustom(v: unknown): v is "custom" {
  return v === "custom";
}

export function isUnlimited(v: unknown): v is "unlimited" {
  return v === "unlimited";
}

/**
 * Formats numeric/unlimited/custom values for UI.
 * - locale: used for number formatting and strings (FR/EN)
 */
export function formatLimit(
  v: LimitValue,
  opts?: { locale?: "fr" | "en" },
): string {
  const locale = opts?.locale ?? "fr";

  if (v === "custom") return locale === "fr" ? "Sur devis" : "Custom";
  if (v === "unlimited") return locale === "fr" ? "Illimité" : "Unlimited";

  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB").format(v);
}

export function formatYesNo(
  v: BoolValue,
  opts?: { locale?: "fr" | "en" },
): string {
  const locale = opts?.locale ?? "fr";

  if (v === "custom") return locale === "fr" ? "Sur devis" : "Custom";
  return v ? (locale === "fr" ? "Oui" : "Yes") : locale === "fr" ? "Non" : "No";
}

/**
 * Convenience helper specifically for dashboard access
 * (still uses formatLimit but keeps naming explicit)
 */
export function formatDashboards(
  v: LimitValue,
  opts?: { locale?: "fr" | "en" },
): string {
  return formatLimit(v, opts);
}

/**
 * Optional: central list of items to render a comparison table consistently.
 * You can map over this in /pricing to generate rows.
 */
export const PLAN_FEATURES = [
  {
    key: "respondentCompletes",
    labelFr: "Réponses (soumissions)",
    labelEn: "Respondent completes (submissions)",
  },
  {
    key: "deploymentLocations",
    labelFr: "Zones de déploiement",
    labelEn: "Deployment locations",
  },
  {
    key: "surveyVerificationRounds",
    labelFr: "Tours de vérification",
    labelEn: "Survey verification rounds",
  },
  {
    key: "questionsPerSurvey",
    labelFr: "Questions par enquête",
    labelEn: "Questions per survey",
  },
  {
    key: "segmentationDimensions",
    labelFr: "Dimensions de segmentation",
    labelEn: "Segmentation dimensions",
  },
  { key: "userSeats", labelFr: "Utilisateurs (sièges)", labelEn: "User seats" },
  {
    key: "surveyTemplateLibraryAndImport",
    labelFr: "Templates & import",
    labelEn: "Template library & import",
  },
  {
    key: "proprietaryDashboardsAccess",
    labelFr: "Dashboards TADA",
    labelEn: "TADA dashboards access",
  },
] as const;
