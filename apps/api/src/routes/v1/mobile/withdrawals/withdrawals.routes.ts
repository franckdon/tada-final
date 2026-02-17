import { Hono } from "hono";
import { ZodError } from "zod";
import type { HonoVariables } from "../../../../types/hono";
import { requireMobileAuth } from "../../../../middleware/requireMobileAuth";
import { jsonError, formatZodIssuesFr } from "../../mobile/mobile.errors";
import { ContentfulStatusCode } from "hono/utils/http-status";

import {
  createWithdrawalBodySchema,
  cancelWithdrawalParamsSchema,
  listWithdrawalsQuerySchema,
} from "./withdrawals.schemas";
import * as service from "./withdrawals.service";

export const mobileWithdrawalsRoutes = new Hono<{ Variables: HonoVariables }>();

mobileWithdrawalsRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE WITHDRAWALS ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

/**
 * GET /v1/mobile/withdrawals
 * Historique user (optionnel mais pratique)
 */
mobileWithdrawalsRoutes.get("/", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  const raw = c.req.query();
  const q = listWithdrawalsQuerySchema.parse(raw);

  const r = await service.listUserWithdrawals(userId, q);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});

/**
 * POST /v1/mobile/withdrawals
 * Créer une demande de retrait (status=pending)
 */
mobileWithdrawalsRoutes.post("/", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  const body = createWithdrawalBodySchema.parse(await c.req.json());

  const r = await service.createWithdrawalRequest(userId, body);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data, 201);
});

/**
 * POST /v1/mobile/withdrawals/:id/cancel
 * Annuler si et seulement si status=pending
 */
mobileWithdrawalsRoutes.post("/:id/cancel", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  const params = cancelWithdrawalParamsSchema.parse(c.req.param());

  const r = await service.cancelWithdrawalRequest(userId, params.id);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});
