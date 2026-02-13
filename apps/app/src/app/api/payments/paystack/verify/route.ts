// src/app/api/payments/paystack/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyWorkspaceCreditsFromPurchase } from "@/utils/apply-workspace-credits-from-purchase";

export const runtime = "nodejs";

function jsonError(message: string, status = 400, extra?: Record<string, any>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
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
      providerStatus: true,
      metadata: true,
      createdAt: true,

      // ✅ XOF columns
      totalAmountXof: true,
      unitPriceXof: true,
    },
  });

  if (!purchase) return jsonError("Purchase not found", 404);

  // Idempotent: if already marked paid, still apply credits safely
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

  // ---- Call Paystack verify
  const url = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;

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
    console.error("[paystack.verify] failed", { reference, http: psRes.status, psJson });
    return jsonError(psJson?.message || "Paystack verify failed", 502, {
      reference,
      paystackHttp: psRes.status,
      paystack: psJson,
    });
  }

  const data = psJson.data;
  if (!data) return jsonError("Paystack response missing data", 502, { reference, paystack: psJson });

  const paystackStatus = data.status;
  const paystackAmount = Number(data.amount); // subunits
  const paystackCurrency = (data.currency ?? "").toUpperCase();

  // ✅ Expected: XOF subunits = XOF * 100
  const expectedCurrency = "XOF";
  const expectedAmount = Number(purchase.totalAmountXof ?? 0) * 100;

  const amountOk = paystackAmount === expectedAmount;
  const currencyOk = paystackCurrency === expectedCurrency;

  // Persist verify payload for audit/debug
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

  // ✅ If paid but mismatch, we STOP (security)
  if (isPaid && (!amountOk || !currencyOk)) {
    return jsonError("payment_mismatch", 409, {
      reference,
      checks: {
        amountOk,
        currencyOk,
        expectedAmount,
        paystackAmount,
        expectedCurrency,
        paystackCurrency,
      },
    });
  }

  // Apply credits if paid + OK
  let applied: any = null;
  if (isPaid) {
    applied = await applyWorkspaceCreditsFromPurchase({
      purchaseId: purchase.id,
      reference,
      actorUserId: null,
      paystackVerifyPayload: psJson,
    });
  } else {
    // Not paid => return 409 so callback redirects to error with reason
    return jsonError("not_paid", 409, { reference, status: paystackStatus });
  }

  return NextResponse.json({
    ok: true,
    reference,
    purchaseId: purchase.id,
    status: paystackStatus,
    applied,
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
      totalAmountXof: purchase.totalAmountXof,
      unitPriceXof: purchase.unitPriceXof,
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
