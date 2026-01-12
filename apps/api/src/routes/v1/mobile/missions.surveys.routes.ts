import { Hono } from "hono";
import { ZodError } from "zod";
import type { HonoVariables } from "../../../types/hono";
import { requireMobileAuth } from "../../../middleware/requireMobileAuth";
import { formatZodIssuesFr, jsonError } from "./mobile.errors";
import { surveysListQuerySchema } from "./surveys/surveys.schemas";
import * as surveysService from "./surveys/surveys.service";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const mobileMissionSurveysRoutes = new Hono<{ Variables: HonoVariables }>();

mobileMissionSurveysRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE MISSION SURVEYS ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

// GET /v1/mobile/missions/:missionId/surveys
mobileMissionSurveysRoutes.get("/:missionId/surveys", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const missionId = c.req.param("missionId");

  const query = surveysListQuerySchema.parse(c.req.query());

  const r = await surveysService.listMissionSurveys(userId, missionId, query);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});
