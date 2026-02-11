// src/routes/v1/mobile/account/account.schemas.ts
import { z } from "zod";

export const balanceQuerySchema = z.object({
  providerId: z.string().optional(),
});

export type BalanceQuery = z.infer<typeof balanceQuerySchema>;

export const creditBodySchema = z.object({
  providerId: z.string().optional(), // si tu veux forcer un provider
  amount: z.number().int().positive(), // en plus petite unité (XOF => 1 = 1 XOF)
  currency: z.string().default("XOF"),
  reason: z.string().min(2).max(80), // ex: "profile_module_reward"
  description: z.string().max(255).optional(),
  referenceType: z.string().max(50).optional(), // ex: "profile_module"
  referenceId: z.string().max(80).optional(),   // ex: moduleKey / progressId
  idempotencyKey: z.string().min(8).max(120),   // obligatoire
});

export type CreditBody = z.infer<typeof creditBodySchema>;