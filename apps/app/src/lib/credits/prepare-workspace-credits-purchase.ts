import { prisma } from "@/lib/prisma";
import { getUnitPriceUSD, type PlanCode } from "@/lib/plans/plan-limits";
import { buildPaystackReference } from "@/lib/payments/paystack/reference";
import {
  buildWorkspaceCreditsPurchaseMetadata,
} from "@/lib/credits/purchase-metadata";
import {
  buildPaystackInitializePayload,
  type PaystackInitializePayload,
} from "@/lib/payments/paystack/payload";

type PrepareInput = {
  workspaceId: string;
  organizationId: string;

  // customer
  customerEmail: string;

  // purchase intent
  credits: number;

  // plan snapshot (from workspace subscription; can be null)
  workspacePlanCode: PlanCode | null;

  // optional: which tier rule was applied for enterprise etc.
  pricingTier?: string | null;

  // derived from request origin
  appOrigin: string;
};

type PrepareOutput = {
  purchase: {
    id: string;
    workspaceId: string;
    organizationId: string;
    planCode: PlanCode | null;

    credits: number;

    unitPriceUsdCents: number;
    totalAmountUsdCents: number;

    currency: "USD";
    provider: "paystack";
    providerRef: string;
    providerStatus: "pending";
    metadata: any;

    createdAt: string;
    updatedAt: string;
  };

  paystack: {
    payload: PaystackInitializePayload;
  };
};

function clampInt(v: unknown, def: number, min: number, max: number) {
  const n = Number.parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, n));
}

/**
 * Prepare a Paystack purchase *without calling Paystack*:
 * - computes unit price based on workspace plan + credits volume
 * - creates WorkspaceCreditPurchase row (pending) for audit + future webhook verification
 * - returns paystack initialize payload (ready)
 */
export async function prepareWorkspaceCreditsPurchase(
  input: PrepareInput,
): Promise<PrepareOutput> {
  const credits = clampInt(input.credits, 0, 1, 1_000_000);
  if (credits <= 0) {
    throw new Error("credits must be > 0");
  }

  // 1) compute unit price (USD) -> cents
  const unitPriceUsd = getUnitPriceUSD({
    planCode: input.workspacePlanCode,
    credits,
  });

  if (!Number.isFinite(unitPriceUsd) || unitPriceUsd <= 0) {
    throw new Error("Invalid unit price computed");
  }

  const unitPriceUsdCents = Math.round(unitPriceUsd * 100);
  const totalAmountUsdCents = unitPriceUsdCents * credits;

  // 2) build paystack reference (idempotency key on provider side)
  const providerRef = buildPaystackReference({
    workspaceId: input.workspaceId,
    organizationId: input.organizationId,
    purpose: "workspace_credits",
  });

  // 3) metadata snapshot (also used later when crediting the ledger)
  const metadata = buildWorkspaceCreditsPurchaseMetadata({
    workspaceId: input.workspaceId,
    organizationId: input.organizationId,
    credits,
    unitPriceUsdCents,
    totalAmountUsdCents,
    workspacePlanCode: input.workspacePlanCode,
    pricingTier: input.pricingTier ?? null,
    providerRef,
  });

  // 4) callback URL (front page OR api route later)
  // Here we point to a *page* route you can create later; for now it's just a predictable URL.
  const callbackUrl = `${input.appOrigin}/billing/paystack/callback?reference=${encodeURIComponent(
    providerRef,
  )}`;

  // 5) Persist purchase intent as PENDING
  // 5) Persist purchase intent as PENDING (idempotent)
  const row = await prisma.workspaceCreditPurchase.upsert({
    where: { providerRef },
    create: {
      workspaceId: input.workspaceId,
      organizationId: input.organizationId,
      planCode: input.workspacePlanCode,
      credits,
      unitPriceUsd: unitPriceUsdCents,
      totalAmountUsd: totalAmountUsdCents,
      currency: "USD",
      provider: "paystack",
      providerRef,
      providerStatus: "pending",
      metadata,
    },
    update: {
      // On met à jour le snapshot (au cas où credits/plan/pricingTier change)
      planCode: input.workspacePlanCode,
      credits,
      unitPriceUsd: unitPriceUsdCents,
      totalAmountUsd: totalAmountUsdCents,
      providerStatus: "pending", // si tu veux forcer pending tant que pas payé
      metadata,
    },
    select: {
      id: true,
      workspaceId: true,
      organizationId: true,
      planCode: true,
      credits: true,
      unitPriceUsd: true,
      totalAmountUsd: true,
      currency: true,
      provider: true,
      providerRef: true,
      providerStatus: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
  });


  // 6) Build Paystack initialize payload (no HTTP call here)
  const payload = buildPaystackInitializePayload({
    customerEmail: input.customerEmail,
    reference: providerRef,
    callbackUrl,
    totalAmountUsdCents,
    metadata,
  });

  return {
    purchase: {
      id: row.id,
      workspaceId: row.workspaceId,
      organizationId: row.organizationId,
      planCode: (row.planCode as PlanCode | null) ?? null,
      credits: row.credits,
      unitPriceUsdCents: row.unitPriceUsd,
      totalAmountUsdCents: row.totalAmountUsd,
      currency: "USD",
      provider: "paystack",
      providerRef: row.providerRef,
      providerStatus: "pending",
      metadata: row.metadata,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    },
    paystack: { payload },
  };
}
