import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function signedAmount(direction: string, amount: number) {
  const d = (direction || "").toLowerCase();
  const isCredit = d === "credit" || d === "in";
  return isCredit ? Math.abs(amount) : -Math.abs(amount);
}

function labelFromReason(reason: string, direction: string) {
  const r = (reason || "").toLowerCase();
  const d = (direction || "").toLowerCase();

  if (r.includes("top") || r.includes("purchase") || r.includes("recharge"))
    return "Top up";
  if (r.includes("subscription")) return "Subscription";
  if (r.includes("refund")) return "Refund";
  if (r.includes("adjust")) return "Adjustment";

  if (d === "credit" || d === "in") return "Credit";
  if (d === "debit" || d === "out") return "Spend";

  return reason || "Activity";
}

function parseCursor(raw: string | null) {
  if (!raw) return null;
  const [createdAt, id] = raw.split("|");
  if (!createdAt || !id) return null;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return null;
  return { createdAt: d, id };
}

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } },
) {
  try {
    const { searchParams } = new URL(req.url);

    const rawLimit = Number(searchParams.get("limit") ?? 20);
    const limit = Math.min(Math.max(rawLimit, 1), 50);

    const cursor = parseCursor(searchParams.get("cursor"));
    const workspaceId = params.workspaceId;

    // 1) credit account du workspace
    const creditAccount = await prisma.workspaceCreditAccount.findUnique({
      where: { workspaceId },
      select: { id: true },
    });

    if (!creditAccount) {
      return NextResponse.json({ success: true, data: [], nextCursor: null });
    }

    // 2) filtre cursor (pagination stable)
    const cursorWhere = cursor
      ? {
          OR: [
            { created_at: { lt: cursor.createdAt } },
            {
              AND: [
                { created_at: { equals: cursor.createdAt } },
                { id: { lt: cursor.id } },
              ],
            },
          ],
        }
      : {};

    const txs = await prisma.workspaceCreditTransaction.findMany({
      where: {
        credit_account_id: creditAccount.id,
        ...cursorWhere,
      },
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
      take: limit,
      select: {
        id: true,
        direction: true,
        amount: true,
        reason: true,
        description: true,
        reference_id: true,
        created_at: true,
      },
    });

    const rows = txs.map((tx) => ({
      id: tx.id,
      label: labelFromReason(tx.reason, tx.direction),
      reason: tx.reason,
      direction: tx.direction,
      amount: signedAmount(tx.direction, tx.amount),
      description: tx.description ?? null,
      referenceId: tx.reference_id ?? null,
      createdAt: tx.created_at,
    }));

    const last = txs[txs.length - 1];
    const nextCursor =
      last && txs.length === limit
        ? `${last.created_at.toISOString()}|${last.id}`
        : null;

    return NextResponse.json({ success: true, data: rows, nextCursor });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Failed to load activities" },
      { status: 500 },
    );
  }
}
