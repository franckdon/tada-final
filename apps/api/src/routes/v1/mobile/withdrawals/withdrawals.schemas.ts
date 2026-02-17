//src/routes/v1/mobile/withdrawals/withdrawals.schemas.ts
import { z } from "zod";

export const createWithdrawalBodySchema = z.object({
  providerId: z.string().optional(), // pour cibler un wallet provider si besoin
  payoutAccountId: z.string().min(1),
  amount: z.number().int().min(3000), // XOF => 1 = 1 XOF, seuil 3000
  currency: z.string().default("XOF"),
  idempotencyKey: z.string().min(8).max(120).optional(),
});

export type CreateWithdrawalBody = z.infer<typeof createWithdrawalBodySchema>;

export const cancelWithdrawalParamsSchema = z.object({
  id: z.string().min(1),
});

export type CancelWithdrawalParams = z.infer<typeof cancelWithdrawalParamsSchema>;

export const listWithdrawalsQuerySchema = z.object({
  status: z.string().optional(), // ex: pending|approved|rejected|paid|canceled
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListWithdrawalsQuery = z.infer<typeof listWithdrawalsQuerySchema>;
