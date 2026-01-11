// apps/api/src/routes/v1/mobile/user.routes.ts
import { Hono } from "hono";
import { ZodError } from "zod";

import type { HonoVariables } from "../../../types/hono";

import { requireMobileAuth } from "../../../middleware/requireMobileAuth";
import { formatZodIssuesFr, jsonError, safeJson } from "./mobile.errors";
import { changePasswordSchema, userPatchSchema, userPutSchema } from "./mobile.schemas";
import * as service from "./mobile.service";
import { mobileUserAvatarRoutes } from "./user.avatar.routes";

export const mobileUserRoutes = new Hono<{ Variables: HonoVariables }>();

mobileUserRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE USER ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

// GET /me
mobileUserRoutes.get("/me", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  const r = await service.getMe(userId);
  if (!r.ok) return jsonError(c, r.status, r.message);

  return c.json(r.data);
});

// PUT /me (modification totale)
mobileUserRoutes.put("/me", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const body = await safeJson(c);

  const data = userPutSchema.parse(body);
  const r = await service.updateMeFull(userId, data);

  if (!r.ok) return jsonError(c, r.status, r.message);

  return c.json(r.data);
});

// PATCH /me (modification partielle)
mobileUserRoutes.patch("/me", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const body = await safeJson(c);

  const data = userPatchSchema.parse(body);
  const r = await service.updateMePartial(userId, data);

  if (!r.ok) return jsonError(c, r.status, r.message);

  return c.json(r.data);
});

// PUT /me/password (changer mot de passe depuis l'espace)
mobileUserRoutes.put("/me/password", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const body = await safeJson(c);

  // IMPORTANT: le schema exige confirmPassword
  const { oldPassword, newPassword } = changePasswordSchema.parse(body);

  const r = await service.changePassword(userId, { oldPassword, newPassword });
  if (!r.ok) return jsonError(c, r.status, r.message);

  return c.json({ ok: true });
});

/**
 * Routes avatar
 * - POST   /me/avatar
 * - GET    /me/avatar
 * - DELETE /me/avatar
 *
 * Note: on monte le router avatar sur /me pour une meilleure lisibilité.
 * Ton fichier user.avatar.routes.ts doit déclarer "/avatar" (et non "/me/avatar")
 * pour éviter le doublon.
 */
mobileUserRoutes.route("/me", mobileUserAvatarRoutes);
