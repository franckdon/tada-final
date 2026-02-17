//src/app/api/withdrawals/[id]/reject/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/withdrawals/:id/reject
// body: { reason: string, reviewedById?: string }
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const body = await req.json();
  const reason =
    typeof body?.reason === "string" && body.reason.trim().length > 0
      ? body.reason.trim().slice(0, 500)
      : null;

  if (!reason) {
    return NextResponse.json({ error: "reason_required" }, { status: 400 });
  }

  const reviewedById: string | null =
    typeof body?.reviewedById === "string" && body.reviewedById.length > 0
      ? body.reviewedById
      : null;

  try {
    const updated = await prisma.withdrawal_request.updateMany({
      where: { id, status: "pending" },
      data: {
        status: "rejected",
        rejectionReason: reason,
        reviewedAt: new Date(),
        reviewedById: reviewedById ?? undefined,
        updatedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: "invalid_status_or_not_found", hint: "Only pending can be rejected" },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[ADMIN WITHDRAWALS REJECT ERROR]", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
