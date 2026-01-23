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
exports.mobilePayoutAccountsRoutes = void 0;
const hono_1 = require("hono");
const zod_1 = require("zod");
const requireMobileAuth_1 = require("../../../../middleware/requireMobileAuth");
const mobile_errors_1 = require("../../mobile/mobile.errors"); // ajuste le path si besoin
const payout_accounts_schemas_1 = require("./payout-accounts.schemas");
const service = __importStar(require("./payout-accounts.service"));
exports.mobilePayoutAccountsRoutes = new hono_1.Hono();
exports.mobilePayoutAccountsRoutes.onError((err, c) => {
    if (err instanceof zod_1.ZodError) {
        return c.json({ error: "Données invalides", details: (0, mobile_errors_1.formatZodIssuesFr)(err) }, 400);
    }
    console.error("[MOBILE PAYOUT ACCOUNTS ERROR]", err);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
});
// GET /v1/mobile/payout-accounts
exports.mobilePayoutAccountsRoutes.get("/", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const raw = c.req.query();
    const query = payout_accounts_schemas_1.listPayoutAccountsQuerySchema.parse(raw);
    const r = await service.listPayoutAccounts(userId, query);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
// POST /v1/mobile/payout-accounts
exports.mobilePayoutAccountsRoutes.post("/", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const body = await c.req.json().catch(() => ({}));
    const parsed = payout_accounts_schemas_1.createPayoutAccountBodySchema.parse(body);
    const r = await service.createPayoutAccount(userId, parsed);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data, 201);
});
// PATCH /v1/mobile/payout-accounts/:id/default
exports.mobilePayoutAccountsRoutes.patch("/:id/default", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const { id } = payout_accounts_schemas_1.payoutAccountIdParamSchema.parse(c.req.param());
    const r = await service.setDefaultPayoutAccount(userId, id);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
// DELETE /v1/mobile/payout-accounts/:id
exports.mobilePayoutAccountsRoutes.delete("/:id", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const { id } = payout_accounts_schemas_1.payoutAccountIdParamSchema.parse(c.req.param());
    const r = await service.deletePayoutAccount(userId, id);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
