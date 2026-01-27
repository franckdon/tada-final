import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { applyWorkspaceCreditTx } from "@/lib/credits/ledger";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = params.id;

  const body = await req.json().catch(() => ({}));
  const direction = body.direction === "debit" ? "debit" : "credit";

  const amountRaw = Number(body.amount ?? 0);
  const amount = Number.isFinite(amountRaw) ? Math.floor(amountRaw) : 0;

  if (amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive integer" }, { status: 400 });
  }
  if (amount > 1_000_000) {
    return NextResponse.json({ error: "amount too large" }, { status: 400 });
  }

  const note = body.note ? String(body.note).trim() : null;

  const reason = direction === "credit" ? "manual_grant" : "manual_withdraw";

  const res = await applyWorkspaceCreditTx({
    workspaceId,
    direction,
    amount,
    reason,
    actorUserId: session.user.id,
    description: note,
    metadata: {
      note,
      source: "admin_manual",
    },
  });

  return NextResponse.json(res);
}
