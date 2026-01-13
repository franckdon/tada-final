import { Hono } from "hono";
import { ZodError } from "zod";
import type { HonoVariables } from "../../../../types/hono";

import { requireMobileAuth } from "../../../../middleware/requireMobileAuth";
import { formatZodIssuesFr, jsonError } from "../mobile.errors"; // adapte si ton chemin diffère
import { ContentfulStatusCode } from "hono/utils/http-status";

import { createNotificationSchema, listNotificationsQuerySchema } from "./notifications.schemas";
import * as service from "./notifications.service";

export const mobileNotificationsRoutes = new Hono<{ Variables: HonoVariables }>();

mobileNotificationsRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE NOTIFICATIONS ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});


// POST /v1/mobile/notifications (internal only)
mobileNotificationsRoutes.post("/", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  const body = await c.req.json().catch(() => ({} as any));
  const input = createNotificationSchema.parse(body);

  const internalKey = c.req.header("x-internal-key") ?? null;

  const r = await service.createNotification(userId, input, internalKey);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data, 201);
});

// GET /v1/mobile/notifications
mobileNotificationsRoutes.get("/", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  const raw = c.req.query();
  const query = listNotificationsQuerySchema.parse(raw);

  const r = await service.listNotifications(userId, query);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});

// GET /v1/mobile/notifications/:id
mobileNotificationsRoutes.get("/:id", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const id = c.req.param("id");

  const r = await service.getNotificationDetails(userId, id);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});

// POST /v1/mobile/notifications/:id/read
mobileNotificationsRoutes.post("/:id/read", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const id = c.req.param("id");

  const r = await service.markNotificationRead(userId, id);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});

// POST /v1/mobile/notifications/read-all
mobileNotificationsRoutes.post("/read-all", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  const r = await service.markAllNotificationsRead(userId);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});
