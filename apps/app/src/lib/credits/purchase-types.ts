export type PurchaseProvider = "paystack";
export type PurchaseStatus = "pending" | "succeeded" | "failed";

export type WorkspaceCreditPurchaseIntent = {
  id: string;
  workspaceId: string;
  organizationId: string;

  planCode: "starter" | "growth" | "business" | "entreprise" | null;

  credits: number;
  unitPriceUsdCents: number;
  totalAmountUsdCents: number;

  currency: "USD";
  provider: PurchaseProvider;
  providerRef: string;
  status: PurchaseStatus;

  metadata: Record<string, unknown> | null;

  createdAt: string;
  updatedAt: string;
};
