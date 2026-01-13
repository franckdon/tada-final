import { Hono } from "hono";
import { ZodError } from "zod";
import type { HonoVariables } from "../../../../types/hono";
import { requireMobileAuth } from "../../../../middleware/requireMobileAuth";
import { jsonError, formatZodIssuesFr } from "../../mobile/mobile.errors";
import { ContentfulStatusCode } from "hono/utils/http-status";

import { balanceQuerySchema } from "./account.schemas";
import * as service from "./account.service";

export const mobileAccountRoutes = new Hono<{ Variables: HonoVariables }>();

mobileAccountRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE ACCOUNT ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

mobileAccountRoutes.get("/balance", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  const raw = c.req.query();
  const query = balanceQuerySchema.parse(raw);

  const r = await service.getBalance(userId, query);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});
