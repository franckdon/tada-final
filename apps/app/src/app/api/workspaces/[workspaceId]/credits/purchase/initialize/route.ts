// src/app/api/workspaces/[workspaceId]/credits/purchase/initialize/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

type Body = {
  purchaseId?: string;
  reference?: string; // providerRef
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ workspaceId: string }> },
) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  const { workspaceId } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Body;

  const purchaseId =
    typeof body.purchaseId === "string" ? body.purchaseId : null;
  const reference =
    typeof body.reference === "string" ? body.reference : null;

  if (!purchaseId && !reference) {
    return jsonError("purchaseId or reference is required");
  }

  // 1) Récupérer le purchase déjà créé au prepare (et vérifier workspace)
  const purchase = await prisma.workspaceCreditPurchase.findFirst({
    where: {
      workspaceId,
      ...(purchaseId ? { id: purchaseId } : {}),
      ...(reference ? { providerRef: reference } : {}),
    },
  });

  if (!purchase) return jsonError("Purchase not found", 404);

  // empêcher relance si déjà payé
  if (purchase.providerStatus === "paid") {
    return jsonError("Purchase already paid", 409);
  }

  // 2) Construire payload Paystack depuis la DB (pas depuis le client)
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000";

  const callbackUrl = `${appUrl}/api/payments/paystack/callback?reference=${encodeURIComponent(
    purchase.providerRef,
  )}`;

  // ✅ IMPORTANT: On paie en XOF, donc on doit envoyer un montant XOF (subunit)
  // Assumptions (aligné avec ton PrepareResponse):
  // - purchase.totalAmountXof existe en DB/Prisma et représente le total en XOF (ex: 510000)
  // - Paystack attend amount en subunit => XOF * 100
  const totalAmountXof = Number((purchase as any).totalAmountXof);
  if (!Number.isFinite(totalAmountXof) || totalAmountXof <= 0) {
    return jsonError("Invalid purchase totalAmountXof", 400);
  }

  // Paystack expects subunits (x100)
  const paystackAmount = Math.trunc(totalAmountXof * 100);

  const email =
    (purchase.metadata as any)?.customerEmail ??
    session.user.email ??
    undefined;

  if (!email) return jsonError("Missing customer email", 400);

  const payload = {
    email,
    amount: paystackAmount,
    currency: "XOF",
    reference: purchase.providerRef,
    callback_url: callbackUrl,
    metadata: {
      purchaseId: purchase.id,
      workspaceId: purchase.workspaceId,
      organizationId: purchase.organizationId,
      planCode: purchase.planCode,
      credits: purchase.credits,
      // debug / audit (optionnel)
      totalAmountXof,
      paystackAmount,
    },
  };

  // 3) Appeler Paystack initialize
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return jsonError("Missing PAYSTACK_SECRET_KEY", 500);

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({} as any));

  if (!res.ok || !json?.status) {
    console.error("[paystack.initialize] failed", {
      status: res.status,
      json,
      payload: {
        ...payload,
        // évite de leak l’email dans les logs si tu veux
        email: email ? "[redacted]" : null,
      },
    });
    return jsonError(json?.message || "Paystack initialize failed", 502);
  }

  // 4) Marquer “pending” + stocker réponse
  const prevMeta =
    purchase.metadata && typeof purchase.metadata === "object"
      ? (purchase.metadata as Record<string, any>)
      : {};

  await prisma.workspaceCreditPurchase.update({
    where: { id: purchase.id },
    data: {
      providerStatus: "pending",
      metadata: {
        ...prevMeta,
        paystack: {
          ...(prevMeta.paystack ?? {}),
          initialize: json,
          payload, // optionnel: garder le payload exact envoyé
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    authorization_url: json.data?.authorization_url,
    reference: json.data?.reference,
    purchaseId: purchase.id,
  });
}
