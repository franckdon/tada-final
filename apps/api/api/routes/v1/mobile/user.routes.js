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
exports.mobileUserRoutes = void 0;
// apps/api/src/routes/v1/mobile/user.routes.ts
const hono_1 = require("hono");
const zod_1 = require("zod");
const requireMobileAuth_1 = require("../../../middleware/requireMobileAuth");
const mobile_errors_1 = require("./mobile.errors");
const mobile_schemas_1 = require("./mobile.schemas");
const service = __importStar(require("./mobile.service"));
const user_avatar_routes_1 = require("./user.avatar.routes");
exports.mobileUserRoutes = new hono_1.Hono();
exports.mobileUserRoutes.onError((err, c) => {
    if (err instanceof zod_1.ZodError) {
        return c.json({ error: "Données invalides", details: (0, mobile_errors_1.formatZodIssuesFr)(err) }, 400);
    }
    console.error("[MOBILE USER ERROR]", err);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
});
// GET /me
exports.mobileUserRoutes.get("/me", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const r = await service.getMe(userId);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
// PUT /me (modification totale)
exports.mobileUserRoutes.put("/me", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const body = await (0, mobile_errors_1.safeJson)(c);
    const data = mobile_schemas_1.userPutSchema.parse(body);
    const r = await service.updateMeFull(userId, data);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
// PATCH /me (modification partielle)
exports.mobileUserRoutes.patch("/me", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const body = await (0, mobile_errors_1.safeJson)(c);
    const data = mobile_schemas_1.userPatchSchema.parse(body);
    const r = await service.updateMePartial(userId, data);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
// PUT /me/password (changer mot de passe depuis l'espace)
exports.mobileUserRoutes.put("/me/password", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const body = await (0, mobile_errors_1.safeJson)(c);
    // IMPORTANT: le schema exige confirmPassword
    const { oldPassword, newPassword } = mobile_schemas_1.changePasswordSchema.parse(body);
    const r = await service.changePassword(userId, { oldPassword, newPassword });
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
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
exports.mobileUserRoutes.route("/me", user_avatar_routes_1.mobileUserAvatarRoutes);
