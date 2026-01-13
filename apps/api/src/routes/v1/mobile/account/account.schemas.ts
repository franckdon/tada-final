import { z } from "zod";

export const balanceQuerySchema = z.object({
  providerId: z.string().optional(),
});

export type BalanceQuery = z.infer<typeof balanceQuerySchema>;
