import { getPlanLimits, isCustom, isUnlimited, type PlanCode } from "./plan-limits";
import type { PlanOverrides } from "./plan-overrides";

export function getMonthlyCredits(
  planCode: PlanCode,
  overrides?: PlanOverrides | null,
): number | null {
  // 1) override prioritaire si numérique
  const o = overrides?.respondentCompletes;
  if (typeof o === "number" && Number.isFinite(o) && o >= 0) return o;

  // 2) sinon limites par défaut
  const v = getPlanLimits(planCode).respondentCompletes;
  if (typeof v === "number") return v;

  // 3) custom/unlimited => pas de grant automatique (ou à gérer via override)
  if (isUnlimited(v) || isCustom(v)) return null;
  return null;
}
