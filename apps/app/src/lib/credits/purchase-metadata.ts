export type WorkspaceCreditsPurchaseMetadataV1 = {
  v: 1;

  kind: "workspace_credits_purchase";
  workspaceId: string;
  organizationId: string;

  credits: number;

  // cents
  unitPriceUsdCents: number;
  totalAmountUsdCents: number;

  // for pricing decisions / audit
  workspacePlanCode: "starter" | "growth" | "business" | "entreprise" | null;
  pricingTier: string | null;

  // ledger mapping
  ledger: {
    direction: "credit";
    reason: "credits_purchase";
  };

  // provider
  provider: "paystack";
  providerRef: string;

  createdAtIso: string;
};

export function buildWorkspaceCreditsPurchaseMetadata(input: {
  workspaceId: string;
  organizationId: string;
  credits: number;
  unitPriceUsdCents: number;
  totalAmountUsdCents: number;
  workspacePlanCode: "starter" | "growth" | "business" | "entreprise" | null;
  pricingTier?: string | null;
  providerRef: string;
}): WorkspaceCreditsPurchaseMetadataV1 {
  return {
    v: 1,
    kind: "workspace_credits_purchase",
    workspaceId: input.workspaceId,
    organizationId: input.organizationId,
    credits: input.credits,
    unitPriceUsdCents: input.unitPriceUsdCents,
    totalAmountUsdCents: input.totalAmountUsdCents,
    workspacePlanCode: input.workspacePlanCode,
    pricingTier: input.pricingTier ?? null,
    ledger: {
      direction: "credit",
      reason: "credits_purchase",
    },
    provider: "paystack",
    providerRef: input.providerRef,
    createdAtIso: new Date().toISOString(),
  };
}
