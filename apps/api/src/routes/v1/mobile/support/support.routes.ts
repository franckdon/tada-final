import { Hono } from "hono";
import { ZodError } from "zod";
import type { HonoVariables } from "../../../../types/hono";

import { requireMobileAuth } from "../../../../middleware/requireMobileAuth";
import { formatZodIssuesFr, jsonError, safeJson } from "../mobile.errors";
import {
  createTicketSchema,
  createTicketMessageSchema,
  listTicketsQuerySchema,
  ticketDetailsQuerySchema,
} from "./support.schemas";
import * as service from "./support.service";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const mobileSupportRoutes = new Hono<{ Variables: HonoVariables }>();

mobileSupportRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE SUPPORT ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

/**
 * POST /v1/mobile/support/tickets
 */
mobileSupportRoutes.post("/tickets", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  const body = await safeJson(c);
  const input = createTicketSchema.parse(body);

  const r = await service.createTicket(userId, input);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data, 201);
});

/**
 * GET /v1/mobile/support/tickets
 * Filtres:
 * - q, status, category, priority
 * - createdFrom, createdTo
 * - page, pageSize, sortBy, sortDir
 */
mobileSupportRoutes.get("/tickets", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  const raw = c.req.query();
  const query = listTicketsQuerySchema.parse(raw);

  const r = await service.listMyTickets(userId, query);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});

/**
 * GET /v1/mobile/support/tickets/:id
 * Query:
 * - includeMessages=true|false
 * - messagesPage, messagesPageSize
 */
mobileSupportRoutes.get("/tickets/:id", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const ticketId = c.req.param("id");

  const raw = c.req.query();
  const query = ticketDetailsQuerySchema.parse(raw);

  const r = await service.getMyTicketDetails(userId, ticketId, query);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data);
});

/**
 * POST /v1/mobile/support/tickets/:id/messages
 */
mobileSupportRoutes.post("/tickets/:id/messages", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const ticketId = c.req.param("id");

  const body = await safeJson(c);
  const input = createTicketMessageSchema.parse(body);

  const r = await service.postMessageOnMyTicket(userId, ticketId, input);
  if (!r.ok) return jsonError(c, r.status as ContentfulStatusCode, r.message);

  return c.json(r.data, 201);
});
