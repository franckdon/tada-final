"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditBodySchema = exports.balanceQuerySchema = void 0;
// src/routes/v1/mobile/account/account.schemas.ts
const zod_1 = require("zod");
exports.balanceQuerySchema = zod_1.z.object({
    providerId: zod_1.z.string().optional(),
});
exports.creditBodySchema = zod_1.z.object({
    providerId: zod_1.z.string().optional(), // si tu veux forcer un provider
    amount: zod_1.z.number().int().positive(), // en plus petite unité (XOF => 1 = 1 XOF)
    currency: zod_1.z.string().default("XOF"),
    reason: zod_1.z.string().min(2).max(80), // ex: "profile_module_reward"
    description: zod_1.z.string().max(255).optional(),
    referenceType: zod_1.z.string().max(50).optional(), // ex: "profile_module"
    referenceId: zod_1.z.string().max(80).optional(), // ex: moduleKey / progressId
    idempotencyKey: zod_1.z.string().min(8).max(120), // obligatoire
});
