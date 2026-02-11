import { z } from "zod";

export const claimRewardSchema = z.object({
  providerId: z.string().optional(),
  // idempotency optionnelle (sinon calculée côté serveur)
  idempotencyKey: z.string().min(10).optional(),
});

export type ClaimRewardInput = z.infer<typeof claimRewardSchema>;
