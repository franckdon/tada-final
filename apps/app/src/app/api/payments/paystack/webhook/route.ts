import { NextResponse } from "next/server";

/**
 * Paystack sends events to this endpoint (server-to-server).
 * Later you'll verify signature + update purchase + credit ledger.
 *
 * IMPORTANT:
 * - Webhooks require reading the raw body for signature verification.
 * - For now we just parse JSON and log/return an ack.
 */
export async function POST(req: Request) {
  // NOTE: In Next App Router, you can read text() then JSON.parse it.
  const raw = await req.text();

  let event: any = null;
  try {
    event = JSON.parse(raw);
  } catch {
    // If Paystack sends non-JSON (rare), still ack to avoid retries.
    return NextResponse.json(
      { ok: true, step: "webhook_received_non_json" },
      { status: 200 },
    );
  }

  // UI-only step: just show what we received
  // Later: verify signature, then:
  // - match providerRef (reference)
  // - update providerStatus
  // - insert into workspace_credit_transaction ledger
  return NextResponse.json({
    ok: true,
    step: "webhook_received",
    event: {
      event: event?.event ?? null,
      data: {
        reference: event?.data?.reference ?? null,
        status: event?.data?.status ?? null,
        amount: event?.data?.amount ?? null,
        currency: event?.data?.currency ?? null,
      },
    },
    receivedAt: new Date().toISOString(),
  });
}
