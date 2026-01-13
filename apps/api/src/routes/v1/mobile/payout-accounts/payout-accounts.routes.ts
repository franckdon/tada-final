import { Hono } from "hono";
import { ZodError } from "zod";
import type { HonoVariables } from "../../../../types/hono";
import { requireMobileAuth } from "../../../../middleware/requireMobileAuth";
import { ContentfulStatusCode } from "hono/utils/http-status";

import { jsonError, formatZodIssuesFr } from "../../mobile/mobile.errors"; // ajuste le path si besoin
import {
  createPayoutAccountBodySchema,
  listPayoutAccountsQuerySchema,
  payoutAccountIdParamSchema,
} from "./payout-accounts.schemas";
import * as service from "./payout-accounts.service";

export const mobilePayoutAccountsRoutes = new Hono<{ Variables: HonoVariables }>();

mobilePayoutAccountsRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE PAYOUT ACCOUNTS ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

// GET /v1/mobile/payout-accounts
mobilePayoutAccountsRoutes.get("/", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  const raw = c.req.query();
  const query = listPayoutAccountsQuerySchema.parse(raw);

  const r = await service.listPayoutAccounts(userId, query);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});

// POST /v1/mobile/payout-accounts
mobilePayoutAccountsRoutes.post("/", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  const body = await c.req.json().catch(() => ({}));
  const parsed = createPayoutAccountBodySchema.parse(body);

  const r = await service.createPayoutAccount(userId, parsed);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data, 201);
});

// PATCH /v1/mobile/payout-accounts/:id/default
mobilePayoutAccountsRoutes.patch("/:id/default", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const { id } = payoutAccountIdParamSchema.parse(c.req.param());

  const r = await service.setDefaultPayoutAccount(userId, id);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});

// DELETE /v1/mobile/payout-accounts/:id
mobilePayoutAccountsRoutes.delete("/:id", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const { id } = payoutAccountIdParamSchema.parse(c.req.param());

  const r = await service.deletePayoutAccount(userId, id);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});
