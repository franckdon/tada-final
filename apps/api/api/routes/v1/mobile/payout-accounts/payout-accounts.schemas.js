"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payoutAccountIdParamSchema = exports.listPayoutAccountsQuerySchema = exports.createPayoutAccountBodySchema = exports.payoutAccountTypeEnum = void 0;
const zod_1 = require("zod");
const truthy = new Set(["1", "true", "yes", "y", "on"]);
function parseBool(v) {
    if (typeof v !== "string")
        return undefined;
    const s = v.trim().toLowerCase();
    if (truthy.has(s))
        return true;
    return false;
}
exports.payoutAccountTypeEnum = zod_1.z.enum(["mobile_money", "bank"]);
exports.createPayoutAccountBodySchema = zod_1.z
    .object({
    type: exports.payoutAccountTypeEnum,
    label: zod_1.z.string().min(2).max(80),
    // Mobile Money
    provider: zod_1.z.string().min(2).max(40).optional(), // orange, mtn, moov, wave, other...
    country: zod_1.z.string().length(2).optional(),
    dialCode: zod_1.z.string().min(2).max(6).optional(), // +225
    phone: zod_1.z.string().min(6).max(25).optional(),
    // Bank
    bankName: zod_1.z.string().min(2).max(120).optional(),
    rib: zod_1.z.string().min(5).max(64).optional(),
    iban: zod_1.z.string().min(10).max(34).optional(),
    bic: zod_1.z.string().min(8).max(11).optional(),
    isDefault: zod_1.z.boolean().optional(),
})
    .superRefine((v, ctx) => {
    if (v.type === "mobile_money") {
        if (!v.phone)
            ctx.addIssue({ code: "custom", path: ["phone"], message: "Téléphone requis" });
        if (!v.dialCode)
            ctx.addIssue({ code: "custom", path: ["dialCode"], message: "Indicatif requis (ex: +225)" });
    }
    if (v.type === "bank") {
        if (!v.bankName)
            ctx.addIssue({ code: "custom", path: ["bankName"], message: "Nom de banque requis" });
        if (!v.rib && !v.iban)
            ctx.addIssue({ code: "custom", path: ["rib"], message: "RIB ou IBAN requis" });
    }
});
exports.listPayoutAccountsQuerySchema = zod_1.z.object({
    includeDeleted: zod_1.z.string().optional().transform((v) => (parseBool(v) ? true : false)),
});
exports.payoutAccountIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
