"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listWithdrawalsQuerySchema = exports.cancelWithdrawalParamsSchema = exports.createWithdrawalBodySchema = void 0;
//src/routes/v1/mobile/withdrawals/withdrawals.schemas.ts
const zod_1 = require("zod");
exports.createWithdrawalBodySchema = zod_1.z.object({
    providerId: zod_1.z.string().optional(), // pour cibler un wallet provider si besoin
    payoutAccountId: zod_1.z.string().min(1),
    amount: zod_1.z.number().int().min(3000), // XOF => 1 = 1 XOF, seuil 3000
    currency: zod_1.z.string().default("XOF"),
    idempotencyKey: zod_1.z.string().min(8).max(120).optional(),
});
exports.cancelWithdrawalParamsSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
});
exports.listWithdrawalsQuerySchema = zod_1.z.object({
    status: zod_1.z.string().optional(), // ex: pending|approved|rejected|paid|canceled
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
