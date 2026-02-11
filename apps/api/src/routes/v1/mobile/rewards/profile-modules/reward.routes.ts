import { Hono } from "hono";
import { ZodError } from "zod";
import { safeJson, formatZodIssuesFr, jsonError } from "../../mobile.errors";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { requireMobileAuth } from "../../../../../middleware/requireMobileAuth";
import type { HonoVariables } from "../../../../../types/hono";

import { claimRewardSchema } from "./reward.schemas";
import { claimModuleReward, getModuleRewardStatus } from "./rewards.service";

import { DEFAULT_MODULES, type ModuleKey } from "../../contributor/modules/modules.config";

export const profileModulesRewardsRoutes = new Hono<{ Variables: HonoVariables }>();

profileModulesRewardsRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE PROFILE MODULE REWARDS ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

function parseModuleKey(raw: string): ModuleKey | null {
  const key = raw as ModuleKey;
  return DEFAULT_MODULES[key] ? key : null;
}

/**
 * GET /v1/mobile/rewards/profile-modules/:moduleKey/reward-status
 * Body optionnel: { providerId }
 * (si tu veux absolument un GET avec body comme avant, on le supporte en essayant safeJson)
 */
profileModulesRewardsRoutes.get("/:moduleKey/reward-status", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const moduleKeyRaw = c.req.param("moduleKey");
  const moduleKey = parseModuleKey(moduleKeyRaw);

  if (!moduleKey) return c.json({ error: "Module inconnu" }, 404);

  // GET body: pas standard, mais tu as dit que tu le faisais avant
  const providerIdRaw = c.req.query("providerId");
  const providerId = typeof providerIdRaw === "string" && providerIdRaw.length > 0 ? providerIdRaw : undefined;

  const r = await getModuleRewardStatus({ userId, moduleKey, providerId });
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});

/**
 * POST /v1/mobile/rewards/profile-modules/:moduleKey/claim
 * Body: { providerId?, idempotencyKey? }
 */
profileModulesRewardsRoutes.post("/:moduleKey/claim", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const moduleKeyRaw = c.req.param("moduleKey");
  const moduleKey = parseModuleKey(moduleKeyRaw);

  if (!moduleKey) return c.json({ error: "Module inconnu" }, 404);

  const body = await safeJson(c);
  const input = claimRewardSchema.parse(body);

  const r = await claimModuleReward({
    userId,
    moduleKey,
    providerId: input.providerId,
    idempotencyKey: input.idempotencyKey,
  });

  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);
  return c.json(r.data);
});
