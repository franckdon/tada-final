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
exports.contributorModulesRoutes = void 0;
// apps/api/src/routes/v1/mobile/contributor/modules/modules.routes.ts
const hono_1 = require("hono");
const zod_1 = require("zod");
const mobile_errors_1 = require("../../mobile.errors");
const modules_schemas_1 = require("./modules.schemas");
const service = __importStar(require("./modules.service"));
const requireMobileAuth_1 = require("../../../../../middleware/requireMobileAuth");
exports.contributorModulesRoutes = new hono_1.Hono();
exports.contributorModulesRoutes.onError((err, c) => {
    if (err instanceof zod_1.ZodError) {
        return c.json({ error: "Données invalides", details: (0, mobile_errors_1.formatZodIssuesFr)(err) }, 400);
    }
    console.error("[MOBILE MODULES ERROR]", err);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
});
// GET /progress
exports.contributorModulesRoutes.get("/progress", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const r = await service.getAllProgress(userId);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
// PATCH /personal-info
exports.contributorModulesRoutes.patch("/personal-info", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const body = await (0, mobile_errors_1.safeJson)(c);
    const data = modules_schemas_1.personalInfoSchema.parse(body);
    const r = await service.updatePersonalInfo(userId, data);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
// PATCH /location
exports.contributorModulesRoutes.patch("/location", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const body = await (0, mobile_errors_1.safeJson)(c);
    const data = modules_schemas_1.locationSchema.parse(body);
    const r = await service.updateLocation(userId, data);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
// PATCH /ethnicity
exports.contributorModulesRoutes.patch("/ethnicity", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const body = await (0, mobile_errors_1.safeJson)(c);
    const data = modules_schemas_1.ethnicitySchema.parse(body);
    const r = await service.updateEthnicity(userId, data);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
