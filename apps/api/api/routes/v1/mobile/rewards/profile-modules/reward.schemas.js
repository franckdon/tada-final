"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimRewardSchema = void 0;
const zod_1 = require("zod");
exports.claimRewardSchema = zod_1.z.object({
    providerId: zod_1.z.string().optional(),
    // idempotency optionnelle (sinon calculée côté serveur)
    idempotencyKey: zod_1.z.string().min(10).optional(),
});
