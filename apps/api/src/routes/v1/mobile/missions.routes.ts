import { Hono } from "hono";
import { ZodError } from "zod";
import type { HonoVariables } from "../../../types/hono";
import { requireMobileAuth } from "../../../middleware/requireMobileAuth";
import { formatZodIssuesFr, jsonError } from "./mobile.errors";
import { missionsListQuerySchema } from "./missions.schemas";
import * as service from "./missions.service";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const mobileMissionsRoutes = new Hono<{ Variables: HonoVariables }>();

mobileMissionsRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE MISSIONS ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

mobileMissionsRoutes.get("/", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  console.log("[mobile/missions] userId =", userId);

  const raw = c.req.query();
  const query = missionsListQuerySchema.parse(raw);

  const r = await service.listMissions(userId, query);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});
