"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.mobileSupportRoutes = void 0;
const hono_1 = require("hono");
const zod_1 = require("zod");
const requireMobileAuth_1 = require("../../../../middleware/requireMobileAuth");
const mobile_errors_1 = require("../mobile.errors");
const support_schemas_1 = require("./support.schemas");
const service = __importStar(require("./support.service"));
exports.mobileSupportRoutes = new hono_1.Hono();
exports.mobileSupportRoutes.onError((err, c) => {
    if (err instanceof zod_1.ZodError) {
        return c.json({ error: "Données invalides", details: (0, mobile_errors_1.formatZodIssuesFr)(err) }, 400);
    }
    console.error("[MOBILE SUPPORT ERROR]", err);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
});
/**
 * POST /v1/mobile/support/tickets
 */
exports.mobileSupportRoutes.post("/tickets", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const body = await (0, mobile_errors_1.safeJson)(c);
    const input = support_schemas_1.createTicketSchema.parse(body);
    const r = await service.createTicket(userId, input);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data, 201);
});
/**
 * GET /v1/mobile/support/tickets
 * Filtres:
 * - q, status, category, priority
 * - createdFrom, createdTo
 * - page, pageSize, sortBy, sortDir
 */
exports.mobileSupportRoutes.get("/tickets", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const raw = c.req.query();
    const query = support_schemas_1.listTicketsQuerySchema.parse(raw);
    const r = await service.listMyTickets(userId, query);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
/**
 * GET /v1/mobile/support/tickets/:id
 * Query:
 * - includeMessages=true|false
 * - messagesPage, messagesPageSize
 */
exports.mobileSupportRoutes.get("/tickets/:id", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const ticketId = c.req.param("id");
    const raw = c.req.query();
    const query = support_schemas_1.ticketDetailsQuerySchema.parse(raw);
    const r = await service.getMyTicketDetails(userId, ticketId, query);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
/**
 * POST /v1/mobile/support/tickets/:id/messages
 */
exports.mobileSupportRoutes.post("/tickets/:id/messages", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const ticketId = c.req.param("id");
    const body = await (0, mobile_errors_1.safeJson)(c);
    const input = support_schemas_1.createTicketMessageSchema.parse(body);
    const r = await service.postMessageOnMyTicket(userId, ticketId, input);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data, 201);
});
