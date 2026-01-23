"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTicketMessageSchema = exports.ticketDetailsQuerySchema = exports.listTicketsQuerySchema = exports.createTicketSchema = exports.ticketPriorityEnum = exports.ticketStatusEnum = void 0;
const zod_1 = require("zod");
const truthy = new Set(["1", "true", "yes", "y", "on"]);
const falsy = new Set(["0", "false", "no", "n", "off"]);
function parseBool(v) {
    if (typeof v === "boolean")
        return v;
    if (typeof v !== "string")
        return undefined;
    const s = v.trim().toLowerCase();
    if (truthy.has(s))
        return true;
    if (falsy.has(s))
        return false;
    return undefined;
}
exports.ticketStatusEnum = zod_1.z.enum(["open", "in_progress", "resolved", "closed"]);
exports.ticketPriorityEnum = zod_1.z.enum(["low", "medium", "high", "urgent"]);
// Chez toi le champ DB s’appelle "type" (catégorie). On garde le terme "category" côté API.
exports.createTicketSchema = zod_1.z.object({
    subject: zod_1.z.string().trim().min(3).max(200),
    category: zod_1.z.string().trim().min(2).max(60), // mapped -> type
    priority: exports.ticketPriorityEnum.default("medium"),
    message: zod_1.z.string().trim().min(1).max(5000),
});
exports.listTicketsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    q: zod_1.z.string().trim().min(1).max(200).optional(), // search subject/message
    status: exports.ticketStatusEnum.optional(),
    category: zod_1.z.string().trim().min(1).max(60).optional(),
    priority: exports.ticketPriorityEnum.optional(),
    createdFrom: zod_1.z.coerce.date().optional(),
    createdTo: zod_1.z.coerce.date().optional(),
    sortBy: zod_1.z.enum(["createdAt", "updatedAt", "subject", "status"]).default("createdAt"),
    sortDir: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
/**
 * Détails ticket - Query string
 * includeMessages peut venir sous forme:
 * - "true"/"false", "1"/"0", etc.
 */
exports.ticketDetailsQuerySchema = zod_1.z.object({
    includeMessages: zod_1.z.preprocess((v) => parseBool(v) ?? true, zod_1.z.boolean()),
    messagesPage: zod_1.z.coerce.number().int().min(1).default(1),
    messagesPageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
exports.createTicketMessageSchema = zod_1.z.object({
    content: zod_1.z.string().trim().min(1).max(5000),
});
