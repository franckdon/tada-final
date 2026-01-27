// src/app/api/payments/paystack/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: "success" | "failed" | "abandoned" | string;
    reference: string;
    amount: number; // in subunits (kobo/cents)
    currency: string;
    paid_at?: string;
    channel?: string;
    metadata?: any;
    customer?: { email?: string };
  };
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const reference = (body?.reference ?? "").toString().trim();

  if (!reference) return jsonError("Missing reference");

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return jsonError("PAYSTACK_SECRET_KEY missing", 500);

  // 1) Find purchase row first (your DB is the source of truth for what we expect)
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
    },
  });

  if (!purchase) return jsonError("Purchase not found", 404);

  // 2) Verify on Paystack
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
    return jsonError(psJson?.message || "Paystack verify failed", 400);
  }

  const data = psJson.data;
  if (!data) return jsonError("Paystack response missing data", 400);

  // 3) Basic checks
  const paystackStatus = data.status;
  const paystackAmount = Number(data.amount);
  const paystackCurrency = (data.currency ?? "").toUpperCase();

  // Your DB stores totalAmountUsd in cents already.
  const expectedAmount = purchase.totalAmountUsd;
  const expectedCurrency = (purchase.currency ?? "USD").toUpperCase();

  const amountOk = paystackAmount === expectedAmount;
  const currencyOk = paystackCurrency === expectedCurrency;

  return NextResponse.json({
    ok: true,
    reference,
    status: paystackStatus, // e.g. "success"
    purchaseId: purchase.id,
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
      providerStatus: purchase.providerStatus,
      createdAt: purchase.createdAt.toISOString(),
    },
  });
}
