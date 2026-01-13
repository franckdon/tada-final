import { Hono } from "hono";
import { ZodError } from "zod";

import type { HonoVariables } from "../../../../types/hono";
import { requireMobileAuth } from "../../../../middleware/requireMobileAuth";
import { formatZodIssuesFr, jsonError, safeJson } from "../mobile.errors";
import { createSurveyResponseSchema } from "./responses.schemas";
import * as service from "./responses.service";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const mobileSurveyResponsesRoutes = new Hono<{ Variables: HonoVariables }>();

mobileSurveyResponsesRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE SURVEY RESPONSES ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

/**
 * POST /v1/mobile/surveys/:surveyId/responses
 */
mobileSurveyResponsesRoutes.post("/:surveyId/responses", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const surveyId = c.req.param("surveyId");

  const body = await safeJson(c);
  const input = createSurveyResponseSchema.parse(body);

  const ip = c.req.header("x-forwarded-for") ?? null;
  const ua = c.req.header("user-agent") ?? null;

  const r = await service.createSurveyResponse(userId, surveyId, input, { ip, ua });
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data, 201);
});
