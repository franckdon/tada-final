import { getPlanLimits, isCustom, isUnlimited, type PlanCode } from "@/lib/plans/plan-limits";

export function resolveQuestionsLimit(args: {
  planCode: PlanCode;
  overrideQuestionsPerSurvey?: number | null;
  fallback?: number;
}) {
  const fallback = args.fallback ?? 10;

  const limits = getPlanLimits(args.planCode);
  const v = limits.questionsPerSurvey;

  if (isCustom(v)) {
    const ov = args.overrideQuestionsPerSurvey;
    return typeof ov === "number" && ov > 0 ? Math.floor(ov) : fallback;
  }

  if (isUnlimited(v)) return 25;

  return Math.max(1, Math.floor(v));
}
