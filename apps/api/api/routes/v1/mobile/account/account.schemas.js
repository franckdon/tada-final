"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceQuerySchema = void 0;
const zod_1 = require("zod");
exports.balanceQuerySchema = zod_1.z.object({
    providerId: zod_1.z.string().optional(),
});
