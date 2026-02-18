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
exports.mobileAccountRoutes = void 0;
// src/routes/v1/mobile/account/account.routes.ts
const hono_1 = require("hono");
const zod_1 = require("zod");
const requireMobileAuth_1 = require("../../../../middleware/requireMobileAuth");
const mobile_errors_1 = require("../../mobile/mobile.errors");
const account_schemas_1 = require("./account.schemas");
const service = __importStar(require("./account.service"));
const requireServerKey_1 = require("../../../../middleware/requireServerKey");
exports.mobileAccountRoutes = new hono_1.Hono();
exports.mobileAccountRoutes.onError((err, c) => {
    if (err instanceof zod_1.ZodError) {
        return c.json({ error: "Données invalides", details: (0, mobile_errors_1.formatZodIssuesFr)(err) }, 400);
    }
    console.error("[MOBILE ACCOUNT ERROR]", err);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
});
exports.mobileAccountRoutes.get("/balance", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const raw = c.req.query();
    const query = account_schemas_1.balanceQuerySchema.parse(raw);
    const r = await service.getBalance(userId, query);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
exports.mobileAccountRoutes.post("/credit", requireServerKey_1.requireServerKey, async (c) => {
    const body = account_schemas_1.creditBodySchema.parse(await c.req.json());
    // Ici: on crédite via payload (plus pratique pour le backend reward)
    const userId = (await c.req.json()).userId ?? null;
    if (!userId) {
        return c.json({ error: "userId requis" }, 400);
    }
    const r = await service.creditUserWallet(userId, body);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
