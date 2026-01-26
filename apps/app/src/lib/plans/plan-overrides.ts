import type { BoolValue, LimitValue, PlanLimits } from "./plan-limits";

export type PlanOverrides = Partial<{
  respondentCompletes: number;
  deploymentLocations: LimitValue;
  surveyVerificationRounds: LimitValue;
  questionsPerSurvey: LimitValue;
  segmentationDimensions: LimitValue;
  userSeats: LimitValue;
  surveyTemplateLibraryAndImport: BoolValue;
  proprietaryDashboardsAccess: LimitValue;
}>;

export function applyOverrides(
  defaults: PlanLimits,
  overrides?: PlanOverrides | null,
): PlanLimits {
  return { ...defaults, ...(overrides ?? {}) } as PlanLimits;
}
