// src/lib/payments/paystack/payload.ts
import type { WorkspaceCreditsPurchaseMetadata } from "@/lib/credits/purchase-metadata";

export type PaystackCurrency = "XOF";

export type PaystackInitializePayload = {
  email: string;
  amount: string; // subunit (Paystack expects *100)
  currency?: PaystackCurrency; // "XOF"
  reference: string;
  callback_url: string;
  channels?: Array<"card" | "mobile_money" | "bank_transfer">;
  metadata?: string; // JSON.stringify(metadata)
};

export function buildPaystackInitializePayload(input: {
  customerEmail: string;
  reference: string;
  callbackUrl: string;

  // ✅ already in Paystack subunit (XOF * 100)
  amount: number;

  currency?: PaystackCurrency; // default "XOF"
  metadata: WorkspaceCreditsPurchaseMetadata;

  channels?: Array<"card" | "mobile_money" | "bank_transfer">;
}): PaystackInitializePayload {
  const safeAmount = Number.isFinite(input.amount) ? Math.trunc(input.amount) : 0;
  if (safeAmount <= 0) {
    throw new Error("Invalid Paystack amount (must be > 0)");
  }

  return {
    email: input.customerEmail,
    amount: String(safeAmount),
    currency: input.currency ?? "XOF",
    reference: input.reference,
    callback_url: input.callbackUrl,
    channels: input.channels ?? ["card", "mobile_money", "bank_transfer"],
    metadata: JSON.stringify(input.metadata),
  };
}
