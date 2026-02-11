// apps/api/src/routes/v1/mobile/rewards/profile-modules/rewards.routes.ts
import { Hono } from "hono";
import { ZodError } from "zod";
import type { HonoVariables } from "../../../../types/hono";
import { requireMobileAuth } from "../../../../middleware/requireMobileAuth";
import { claimRewardSchema } from "./reward.schemas";
import * as service from "./reward.service";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { formatZodIssuesFr, jsonError, safeJson } from "../mobile.errors";
import { getModuleRewardStatus } from "./profile-modules/reward.service";

export const profileModuleRewardsRoutes = new Hono<{ Variables: HonoVariables }>();

profileModuleRewardsRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE REWARDS ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

// POST /:moduleKey/claim
profileModuleRewardsRoutes.post("/:moduleKey/claim", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const moduleKey = c.req.param("moduleKey") as any;

  const body = await safeJson(c);
  const data = claimRewardSchema.parse(body);

  const r = await service.claimModuleReward({
    userId,
    moduleKey,
    providerId: data.providerId,
    idempotencyKey: data.idempotencyKey,
  });

  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);
  return c.json(r.data);
});

profileModuleRewardsRoutes.get("/:moduleKey/reward-status", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const moduleKey = c.req.param("moduleKey") as any;

  const r = await getModuleRewardStatus({ userId, moduleKey });

  if (!r.ok) return jsonError(c, r.status as any, r.message);
  return c.json(r.data);
});
