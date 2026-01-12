import { Hono } from "hono";
import { ZodError } from "zod";
import type { HonoVariables } from "../../../types/hono";
import { requireMobileAuth } from "../../../middleware/requireMobileAuth";
import { formatZodIssuesFr, jsonError } from "./mobile.errors";
import { missionDetailsQuerySchema } from "./missions.details.schemas";
import * as service from "./missions.details.service";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const mobileMissionDetailsRoutes = new Hono<{ Variables: HonoVariables }>();

mobileMissionDetailsRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE MISSION DETAILS ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

/**
 * GET /v1/mobile/missions/:id
 * Query:
 * - includeOrganization=true|false
 * - includeWorkspace=true|false
 * - includeCharts=true|false
 * - includeComments=true|false (recommandé: endpoint séparé)
 */
mobileMissionDetailsRoutes.get("/:id", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const id = c.req.param("id");

  const raw = c.req.query();
  const query = missionDetailsQuerySchema.parse(raw);

  const r = await service.getMissionDetails(userId, id, query);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});
