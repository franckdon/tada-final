import type { WorkspaceCreditsPurchaseMetadataV1 } from "@/lib/credits/purchase-metadata";

export type PaystackInitializePayload = {
  email: string;
  amount: string; // subunit (cents for USD)
  currency?: "USD";
  reference: string;
  callback_url: string;
  channels?: Array<"card" | "mobile_money" | "bank_transfer">;
  metadata?: string; // JSON.stringify(metadata)
};

export function buildPaystackInitializePayload(input: {
  customerEmail: string;
  reference: string;
  callbackUrl: string;

  totalAmountUsdCents: number;
  metadata: WorkspaceCreditsPurchaseMetadataV1;

  channels?: Array<"card" | "mobile_money" | "bank_transfer">;
}): PaystackInitializePayload {
  return {
    email: input.customerEmail,
    amount: String(input.totalAmountUsdCents),
    currency: "USD",
    reference: input.reference,
    callback_url: input.callbackUrl,
    channels: input.channels ?? ["card", "mobile_money", "bank_transfer"],
    metadata: JSON.stringify(input.metadata),
  };
}
