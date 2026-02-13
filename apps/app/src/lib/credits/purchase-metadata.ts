// src/lib/credits/purchase-metadata.ts

// --- Legacy V1 (USD) : on garde si tu as déjà des rows en DB avec ce format ---
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

// --- New V2 (XOF) ---
export type WorkspaceCreditsPurchaseMetadataV2 = {
  v: 2;

  kind: "workspace_credits_purchase";
  workspaceId: string;
  organizationId: string;

  credits: number;

  currency: "XOF";

  // amounts in XOF (no subunit)
  unitPriceXof: number;
  totalAmountXof: number;

  // Paystack amount in subunit (XOF * 100) for audit/debug
  paystackAmount: number;

  // pricing decisions / audit
  workspacePlanCode: "starter" | "growth" | "business" | "entreprise" | null;
  pricingTier: string | null;

  ledger: {
    direction: "credit";
    reason: "credits_purchase";
  };

  provider: "paystack";
  providerRef: string;

  createdAtIso: string;
};

// ✅ Unified type for consumers
export type WorkspaceCreditsPurchaseMetadata =
  | WorkspaceCreditsPurchaseMetadataV1
  | WorkspaceCreditsPurchaseMetadataV2;

// ✅ Builder for the new XOF format
export function buildWorkspaceCreditsPurchaseMetadata(input: {
  workspaceId: string;
  organizationId: string;
  credits: number;

  unitPriceXof: number;
  totalAmountXof: number;

  workspacePlanCode: "starter" | "growth" | "business" | "entreprise" | null;
  pricingTier?: string | null;

  providerRef: string;
}): WorkspaceCreditsPurchaseMetadataV2 {
  const unitPriceXof = Number.isFinite(input.unitPriceXof)
    ? Math.trunc(input.unitPriceXof)
    : 0;

  const totalAmountXof = Number.isFinite(input.totalAmountXof)
    ? Math.trunc(input.totalAmountXof)
    : 0;

  if (unitPriceXof <= 0) throw new Error("Invalid unitPriceXof");
  if (totalAmountXof <= 0) throw new Error("Invalid totalAmountXof");

  const paystackAmount = Math.trunc(totalAmountXof * 100);
  if (paystackAmount <= 0) throw new Error("Invalid paystackAmount");

  return {
    v: 2,
    kind: "workspace_credits_purchase",
    workspaceId: input.workspaceId,
    organizationId: input.organizationId,
    credits: input.credits,
    currency: "XOF",
    unitPriceXof,
    totalAmountXof,
    paystackAmount,
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
