
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference")?.trim() || "";

  // Where to send the user after callback
  const origin = url.origin;
  const successUrl = new URL("/billing/paystack/callback/success", origin);
  const errorUrl = new URL("/billing/paystack/callback/error", origin);

  if (!reference) {
    errorUrl.searchParams.set("reason", "missing_reference");
    return NextResponse.redirect(errorUrl.toString(), { status: 302 });
  }

  try {
    // Call our internal verify route (server-to-server)
    // You will implement this route next step.
    const verifyRes = await fetch(`${origin}/api/payments/paystack/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // pass reference, nothing else
      body: JSON.stringify({ reference }),
      cache: "no-store",
    });

    const json = (await verifyRes.json().catch(() => ({}))) as any;

    if (!verifyRes.ok) {
      errorUrl.searchParams.set("reference", reference);
      errorUrl.searchParams.set("reason", json?.error || "verify_failed");
      return NextResponse.redirect(errorUrl.toString(), { status: 302 });
    }

    // Expected: { ok: true, reference, status, purchaseId?, ... }
    successUrl.searchParams.set("reference", reference);
    if (json?.purchaseId) successUrl.searchParams.set("purchaseId", String(json.purchaseId));
    if (json?.status) successUrl.searchParams.set("status", String(json.status));

    return NextResponse.redirect(successUrl.toString(), { status: 302 });
  } catch (e: any) {
    errorUrl.searchParams.set("reference", reference);
    errorUrl.searchParams.set("reason", e?.message || "callback_exception");
    return NextResponse.redirect(errorUrl.toString(), { status: 302 });
  }
}
