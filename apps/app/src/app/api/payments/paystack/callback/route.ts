import { NextResponse } from "next/server";

/**
 * Paystack redirects the user back to this URL after checkout.
 * Typical query params:
 * - reference=xxxxxxxx
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference");

  // UI-only step: just show the payload we got
  // Later: verify transaction + update DB + credit ledger
  return NextResponse.json({
    ok: true,
    step: "callback_received",
    reference,
    receivedAt: new Date().toISOString(),
  });
}
