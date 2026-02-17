// src/app/api/withdrawals/[id]/approve/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/withdrawals/:id/approve
// body optionnel: { reviewedById?: string }
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const withdrawalId = params.id;

  let reviewedById: string | null = null;
  try {
    const body = await req.json().catch(() => null);
    reviewedById =
      typeof body?.reviewedById === "string" && body.reviewedById.length > 0
        ? body.reviewedById
        : null;
  } catch {}

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1) Lock la demande
      const rows = await tx.$queryRaw<
        { id: string; status: string }[]
      >`
        SELECT
          w.id::text as id,
          w.status::text as status
        FROM public.withdrawal_request w
        WHERE w.id::text = ${withdrawalId}::text
        FOR UPDATE
      `;

      const w = rows[0];
      if (!w) return { ok: false as const, status: 404, error: "withdrawal_not_found" };

      if (w.status !== "pending") {
        return {
          ok: false as const,
          status: 409,
          error: "invalid_status",
          hint: `Only pending can be approved. status=${w.status}`,
        };
      }

      // 2) approved = review only (PAS DE DEBIT)
      const upd = await tx.$queryRaw<
        { id: string; status: string; reviewedAt: string | null }[]
      >`
        UPDATE public.withdrawal_request w
        SET status = 'approved',
            reviewed_at = now(),
            reviewed_by_id = COALESCE(${reviewedById}::text, w.reviewed_by_id),
            updated_at = now()
        WHERE w.id::text = ${withdrawalId}::text
        RETURNING
          w.id::text as id,
          w.status::text as status,
          w.reviewed_at::text as "reviewedAt"
      `;

      return { ok: true as const, withdrawal: upd[0] };
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, hint: (result as any).hint },
        { status: (result as any).status },
      );
    }

    return NextResponse.json(result);
  } catch (e: any) {
    console.error("[ADMIN WITHDRAWALS APPROVE ERROR]", e);
    return NextResponse.json(
      { error: "internal_error", details: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
