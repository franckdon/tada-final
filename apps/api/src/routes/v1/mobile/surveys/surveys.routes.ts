import { Hono } from "hono";
import { ZodError } from "zod";
import type { HonoVariables } from "../../../../types/hono";
import { requireMobileAuth } from "../../../../middleware/requireMobileAuth";
import { formatZodIssuesFr, jsonError } from "../mobile.errors";
import { surveyDetailsQuerySchema } from "./surveys.schemas";
import * as service from "./surveys.service";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const mobileSurveysRoutes = new Hono<{ Variables: HonoVariables }>();

mobileSurveysRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE SURVEYS ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

// GET /v1/mobile/surveys/:id?includeQuestions=true|false
mobileSurveysRoutes.get("/:id", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const id = c.req.param("id");

  const query = surveyDetailsQuerySchema.parse(c.req.query());

  const r = await service.getSurveyDetails(userId, id, query);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});

// GET /v1/mobile/surveys/:id/questions
mobileSurveysRoutes.get("/:id/questions", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const id = c.req.param("id");

  const r = await service.getSurveyQuestions(userId, id);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});
