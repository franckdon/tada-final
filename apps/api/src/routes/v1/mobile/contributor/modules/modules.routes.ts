// apps/api/src/routes/v1/mobile/contributor/modules/modules.routes.ts
import { Hono } from "hono";
import { ZodError } from "zod";
import { safeJson, formatZodIssuesFr, jsonError } from "../../mobile.errors";
import { personalInfoSchema, locationSchema, ethnicitySchema } from "./modules.schemas";
import * as service from "./modules.service";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { HonoVariables } from "../../../../../types/hono";
import { requireMobileAuth } from "../../../../../middleware/requireMobileAuth";

export const contributorModulesRoutes = new Hono<{ Variables: HonoVariables }>();

contributorModulesRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE MODULES ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

// GET /progress
contributorModulesRoutes.get("/progress", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const r = await service.getAllProgress(userId);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);
  return c.json(r.data);
});

// PATCH /personal-info
contributorModulesRoutes.patch("/personal-info", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const body = await safeJson(c);
  const data = personalInfoSchema.parse(body);

  const r = await service.updatePersonalInfo(userId, data);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});

// PATCH /location
contributorModulesRoutes.patch("/location", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const body = await safeJson(c);
  const data = locationSchema.parse(body);

  const r = await service.updateLocation(userId, data);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});

// PATCH /ethnicity
contributorModulesRoutes.patch("/ethnicity", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const body = await safeJson(c);
  const data = ethnicitySchema.parse(body);

  const r = await service.updateEthnicity(userId, data);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});
