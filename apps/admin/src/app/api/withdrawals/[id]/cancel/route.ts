//src/app/api/withdrawals/[id]/cancel/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/withdrawals/:id/cancel
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  try {
    const updated = await prisma.withdrawal_request.updateMany({
      where: { id, status: "pending" }, // admin cancel seulement si pending (simple & safe)
      data: { status: "canceled", updatedAt: new Date() },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: "invalid_status_or_not_found", hint: "Only pending can be canceled" },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[ADMIN WITHDRAWALS CANCEL ERROR]", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
