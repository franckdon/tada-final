import { z } from "zod";

const truthy = new Set(["1", "true", "yes", "y", "on"]);
const falsy = new Set(["0", "false", "no", "n", "off"]);

function parseBool(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (typeof v !== "string") return undefined;
  const s = v.trim().toLowerCase();
  if (truthy.has(s)) return true;
  if (falsy.has(s)) return false;
  return undefined;
}

export const ticketStatusEnum = z.enum(["open", "in_progress", "resolved", "closed"]);
export const ticketPriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

// Chez toi le champ DB s’appelle "type" (catégorie). On garde le terme "category" côté API.
export const createTicketSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  category: z.string().trim().min(2).max(60), // mapped -> type
  priority: ticketPriorityEnum.default("medium"),
  message: z.string().trim().min(1).max(5000),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const listTicketsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),

  q: z.string().trim().min(1).max(200).optional(), // search subject/message
  status: ticketStatusEnum.optional(),
  category: z.string().trim().min(1).max(60).optional(),
  priority: ticketPriorityEnum.optional(),

  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),

  sortBy: z.enum(["createdAt", "updatedAt", "subject", "status"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;

/**
 * Détails ticket - Query string
 * includeMessages peut venir sous forme:
 * - "true"/"false", "1"/"0", etc.
 */
export const ticketDetailsQuerySchema = z.object({
  includeMessages: z.preprocess(
    (v) => parseBool(v) ?? true,
    z.boolean(),
  ),
  messagesPage: z.coerce.number().int().min(1).default(1),
  messagesPageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type TicketDetailsQuery = z.infer<typeof ticketDetailsQuerySchema>;

export const createTicketMessageSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

export type CreateTicketMessageInput = z.infer<typeof createTicketMessageSchema>;
