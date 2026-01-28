// src/app/api/payments/paystack/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyWorkspaceCreditsFromPurchase } from "@/utils/apply-workspace-credits-from-purchase";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: "success" | "failed" | "abandoned" | string;
    reference: string;
    amount: number; // subunits
    currency: string;
    paid_at?: string;
    channel?: string;
    metadata?: any;
    customer?: { email?: string };
  };
};

function getReferenceFromUrl(req: Request) {
  const url = new URL(req.url);
  const ref = (url.searchParams.get("reference") ?? "").trim();
  return ref || null;
}

async function handleVerify(reference: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return jsonError("PAYSTACK_SECRET_KEY missing", 500);

  const purchase = await prisma.workspaceCreditPurchase.findUnique({
    where: { providerRef: reference },
    select: {
      id: true,
      workspaceId: true,
      organizationId: true,
      credits: true,
      currency: true,
      totalAmountUsd: true,
      providerStatus: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!purchase) return jsonError("Purchase not found", 404);

  // ✅ If already paid, still ensure credits are applied (idempotent)
  if (purchase.providerStatus === "paid") {
    const applied = await applyWorkspaceCreditsFromPurchase({
      purchaseId: purchase.id,
      reference,
      actorUserId: null,
      paystackVerifyPayload: (purchase.metadata as any)?.paystack?.verify ?? null,
    });

    return NextResponse.json({
      ok: true,
      alreadyPaid: true,
      reference,
      purchaseId: purchase.id,
      applied,
    });
  }

  const url = `https://api.paystack.co/transaction/verify/${encodeURIComponent(
    reference,
  )}`;

  const psRes = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const psJson = (await psRes.json().catch(() => ({}))) as PaystackVerifyResponse;

  if (!psRes.ok || !psJson?.status) {
    console.error("[paystack.verify] failed", { http: psRes.status, psJson });
    return jsonError(psJson?.message || "Paystack verify failed", 502);
  }

  const data = psJson.data;
  if (!data) return jsonError("Paystack response missing data", 502);

  const paystackStatus = data.status;
  const paystackAmount = Number(data.amount);
  const paystackCurrency = (data.currency ?? "").toUpperCase();

  const expectedAmount = purchase.totalAmountUsd;
  const expectedCurrency = (purchase.currency ?? "USD").toUpperCase();

  const amountOk = paystackAmount === expectedAmount;
  const currencyOk = paystackCurrency === expectedCurrency;

  const prevMeta =
    purchase.metadata && typeof purchase.metadata === "object"
      ? (purchase.metadata as Record<string, any>)
      : {};

  const isPaid = paystackStatus === "success";

  await prisma.workspaceCreditPurchase.update({
    where: { id: purchase.id },
    data: {
      providerStatus: isPaid ? "paid" : "pending",
      metadata: {
        ...prevMeta,
        paystack: {
          ...(prevMeta.paystack ?? {}),
          verify: psJson,
        },
      },
    },
  });

  let applied: any = null;
  if (isPaid) {
    applied = await applyWorkspaceCreditsFromPurchase({
      purchaseId: purchase.id,
      reference,
      actorUserId: null,
      paystackVerifyPayload: psJson,
    });
  }

  return NextResponse.json({
    ok: true,
    reference,
    purchaseId: purchase.id,
    status: paystackStatus,
    applied, // ✅ return it so you can see if credits were applied
    checks: {
      amountOk,
      currencyOk,
      expectedAmount,
      paystackAmount,
      expectedCurrency,
      paystackCurrency,
    },
    paystack: {
      paid_at: data.paid_at ?? null,
      channel: data.channel ?? null,
      customerEmail: data.customer?.email ?? null,
    },
    purchase: {
      workspaceId: purchase.workspaceId,
      organizationId: purchase.organizationId,
      credits: purchase.credits,
      providerStatusBefore: purchase.providerStatus,
      createdAt: purchase.createdAt.toISOString(),
    },
  });
}

export async function GET(req: Request) {
  const reference = getReferenceFromUrl(req);
  if (!reference) return jsonError("Missing reference");
  return handleVerify(reference);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const reference = (body?.reference ?? "").toString().trim();
  if (!reference) return jsonError("Missing reference");
  return handleVerify(reference);
}
