// apps/app/src/app/api/payments/paystack/callback/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference")?.trim() || "";

  const origin = url.origin;
  const successUrl = new URL("/billing/paystack/callback/success", origin);
  const errorUrl = new URL("/billing/paystack/callback/error", origin);

  if (!reference) {
    errorUrl.searchParams.set("reason", "missing_reference");
    return NextResponse.redirect(errorUrl.toString(), { status: 302 });
  }

  try {
    // server-to-server verify (idempotent)
    const verifyRes = await fetch(`${origin}/api/payments/paystack/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
      cache: "no-store",
    });

    const json = (await verifyRes.json().catch(() => ({}))) as any;

    if (!verifyRes.ok || !json?.ok) {
      errorUrl.searchParams.set("reference", reference);
      errorUrl.searchParams.set("reason", json?.error || "verify_failed");
      return NextResponse.redirect(errorUrl.toString(), { status: 302 });
    }

    // ✅ propagate useful info to success page
    successUrl.searchParams.set("reference", reference);

    if (json?.purchaseId) successUrl.searchParams.set("purchaseId", String(json.purchaseId));
    if (json?.status) successUrl.searchParams.set("status", String(json.status));

    // ✅ invoice info (from verify)
    if (json?.invoiceId) successUrl.searchParams.set("invoiceId", String(json.invoiceId));
    if (json?.invoiceNumber) successUrl.searchParams.set("invoiceNumber", String(json.invoiceNumber));

    // ✅ workspace (to build internal PDF download link)
    if (json?.purchase?.workspaceId) {
      successUrl.searchParams.set("workspaceId", String(json.purchase.workspaceId));
    } else if (json?.workspaceId) {
      successUrl.searchParams.set("workspaceId", String(json.workspaceId));
    }

    return NextResponse.redirect(successUrl.toString(), { status: 302 });
  } catch (e: any) {
    errorUrl.searchParams.set("reference", reference);
    errorUrl.searchParams.set("reason", e?.message || "callback_exception");
    return NextResponse.redirect(errorUrl.toString(), { status: 302 });
  }
}
