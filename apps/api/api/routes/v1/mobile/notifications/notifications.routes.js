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
exports.mobileNotificationsRoutes = void 0;
const hono_1 = require("hono");
const zod_1 = require("zod");
const requireMobileAuth_1 = require("../../../../middleware/requireMobileAuth");
const mobile_errors_1 = require("../mobile.errors"); // adapte si ton chemin diffère
const notifications_schemas_1 = require("./notifications.schemas");
const service = __importStar(require("./notifications.service"));
exports.mobileNotificationsRoutes = new hono_1.Hono();
exports.mobileNotificationsRoutes.onError((err, c) => {
    if (err instanceof zod_1.ZodError) {
        return c.json({ error: "Données invalides", details: (0, mobile_errors_1.formatZodIssuesFr)(err) }, 400);
    }
    console.error("[MOBILE NOTIFICATIONS ERROR]", err);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
});
// POST /v1/mobile/notifications (internal only)
exports.mobileNotificationsRoutes.post("/", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const body = await c.req.json().catch(() => ({}));
    const input = notifications_schemas_1.createNotificationSchema.parse(body);
    const internalKey = c.req.header("x-internal-key") ?? null;
    const r = await service.createNotification(userId, input, internalKey);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data, 201);
});
// GET /v1/mobile/notifications
exports.mobileNotificationsRoutes.get("/", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const raw = c.req.query();
    const query = notifications_schemas_1.listNotificationsQuerySchema.parse(raw);
    const r = await service.listNotifications(userId, query);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
// GET /v1/mobile/notifications/:id
exports.mobileNotificationsRoutes.get("/:id", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const r = await service.getNotificationDetails(userId, id);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
// POST /v1/mobile/notifications/:id/read
exports.mobileNotificationsRoutes.post("/:id/read", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const r = await service.markNotificationRead(userId, id);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
// POST /v1/mobile/notifications/read-all
exports.mobileNotificationsRoutes.post("/read-all", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const r = await service.markAllNotificationsRead(userId);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
