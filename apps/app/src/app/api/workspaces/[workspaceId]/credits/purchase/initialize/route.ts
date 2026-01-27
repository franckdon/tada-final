// src/app/api/workspaces/[workspaceId]/credits/purchase/initialize/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUnitPriceUSD, type PlanCode } from "@/lib/plans/plan-limits";
import { buildPaystackReference } from "@/lib/payments/paystack/reference";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } },
) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  const workspaceId = params.workspaceId;

  const body = await req.json().catch(() => ({}));
  const creditsRaw = body?.credits;
  const planCodeRaw = body?.planCode ?? null;
  const emailRaw = body?.email ?? null;

  const credits = Number(creditsRaw);
  if (!Number.isFinite(credits) || credits <= 0) {
    return jsonError("Invalid credits");
  }

  const planCode: PlanCode | null =
    planCodeRaw === "starter" ||
    planCodeRaw === "growth" ||
    planCodeRaw === "business" ||
    planCodeRaw === "entreprise"
      ? planCodeRaw
      : null;

  const customerEmail =
    typeof emailRaw === "string" && emailRaw.trim().length > 0
      ? emailRaw.trim()
      : (session.user.email ?? "").trim();

  if (!customerEmail) {
    return jsonError("Missing customer email");
  }

  // 1) Resolve organizationId (depuis workspace)
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, organizationId: true },
  });

  if (!workspace?.organizationId) return jsonError("Workspace not found", 404);

  // 2) Pricing snapshot (USD -> cents)
  const unitPriceUsdCents = getUnitPriceUSD({ planCode, credits }) * 100;
  const unit = Math.round(unitPriceUsdCents);
  const total = unit * Math.trunc(credits);

  // 3) Generate providerRef (idempotency ref) - use your canonical builder
  const providerRef = buildPaystackReference({
    workspaceId,
    organizationId: workspace.organizationId,
    purpose: "workspace_credits",
  });

  // 4) Create purchase in DB (historique ✅)
  const purchase = await prisma.workspaceCreditPurchase.create({
    data: {
      workspaceId,
      organizationId: workspace.organizationId,
      planCode,
      credits: Math.trunc(credits),
      unitPriceUsd: unit,
      totalAmountUsd: total,
      currency: "USD",
      provider: "paystack",
      providerRef,
      providerStatus: "pending",
      metadata: {
        pricing: { planCode, credits: Math.trunc(credits) },
        userId: session.user.id,
      },
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

  // 5) Build Paystack payload
  // ✅ Important: callback must point to your real callback route
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000";

  const callbackUrl = `${appUrl}/api/payments/paystack/callback?reference=${encodeURIComponent(
    purchase.providerRef,
  )}`;

  const paystackPayload = {
    email: customerEmail,
    amount: purchase.totalAmountUsd, // cents
    currency: "USD",
    reference: purchase.providerRef,
    callback_url: callbackUrl,
    metadata: {
      purchaseId: purchase.id,
      workspaceId: purchase.workspaceId,
      organizationId: purchase.organizationId,
      planCode: purchase.planCode,
      credits: purchase.credits,
    },
  };

  return NextResponse.json({
    ok: true,
    purchase: {
      ...purchase,
      unitPriceUsdCents: purchase.unitPriceUsd,
      totalAmountUsdCents: purchase.totalAmountUsd,
      createdAt: purchase.createdAt.toISOString(),
      updatedAt: purchase.updatedAt.toISOString(),
    },
    paystack: { payload: paystackPayload },
  });
}
