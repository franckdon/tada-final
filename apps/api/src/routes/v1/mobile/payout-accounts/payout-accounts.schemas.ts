import { z } from "zod";

const truthy = new Set(["1", "true", "yes", "y", "on"]);

function parseBool(v: unknown): boolean | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim().toLowerCase();
  if (truthy.has(s)) return true;
  return false;
}

export const payoutAccountTypeEnum = z.enum(["mobile_money", "bank"]);

export const createPayoutAccountBodySchema = z
  .object({
    type: payoutAccountTypeEnum,
    label: z.string().min(2).max(80),

    // Mobile Money
    provider: z.string().min(2).max(40).optional(), // orange, mtn, moov, wave, other...
    country: z.string().length(2).optional(),
    dialCode: z.string().min(2).max(6).optional(), // +225
    phone: z.string().min(6).max(25).optional(),

    // Bank
    bankName: z.string().min(2).max(120).optional(),
    rib: z.string().min(5).max(64).optional(),
    iban: z.string().min(10).max(34).optional(),
    bic: z.string().min(8).max(11).optional(),

    isDefault: z.boolean().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "mobile_money") {
      if (!v.phone) ctx.addIssue({ code: "custom", path: ["phone"], message: "Téléphone requis" });
      if (!v.dialCode)
        ctx.addIssue({ code: "custom", path: ["dialCode"], message: "Indicatif requis (ex: +225)" });
    }

    if (v.type === "bank") {
      if (!v.bankName) ctx.addIssue({ code: "custom", path: ["bankName"], message: "Nom de banque requis" });
      if (!v.rib && !v.iban)
        ctx.addIssue({ code: "custom", path: ["rib"], message: "RIB ou IBAN requis" });
    }
  });

export const listPayoutAccountsQuerySchema = z.object({
  includeDeleted: z.string().optional().transform((v) => (parseBool(v) ? true : false)),
});

export const payoutAccountIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreatePayoutAccountBody = z.infer<typeof createPayoutAccountBodySchema>;
export type ListPayoutAccountsQuery = z.infer<typeof listPayoutAccountsQuerySchema>;
