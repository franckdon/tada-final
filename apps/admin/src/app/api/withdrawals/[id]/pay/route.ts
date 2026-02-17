// src/app/api/withdrawals/[id]/pay/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/withdrawals/:id/pay
// body optionnel: { providerRef?: string }
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const withdrawalId = params.id;

  let providerRef: string | null = null;
  try {
    const body = await req.json().catch(() => null);
    providerRef =
      typeof body?.providerRef === "string" && body.providerRef.trim().length > 0
        ? body.providerRef.trim().slice(0, 120)
        : null;
  } catch {}

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1) Lock la demande
      const rows = await tx.$queryRaw<
        { id: string; status: string; amount: bigint; accountPkId: string }[]
      >`
        SELECT
          w.id::text as id,
          w.status::text as status,
          w.amount as amount,
          w.account_pk_id::text as "accountPkId"
        FROM public.withdrawal_request w
        WHERE w.id::text = ${withdrawalId}::text
        FOR UPDATE
      `;

      const w = rows[0];
      if (!w) return { ok: false as const, status: 404, error: "withdrawal_not_found" };

      if (w.status !== "approved") {
        return {
          ok: false as const,
          status: 409,
          error: "invalid_status",
          hint: `Only approved can be paid. status=${w.status}`,
        };
      }

      const amount = w.amount;

      // 2) Débit du wallet (comparaison en ::text pour éviter uuid/text mismatch)
      const accRows = await tx.$queryRaw<
        { id: string; balance: bigint; currency: string }[]
      >`
        UPDATE public.account a
        SET balance = a.balance - ${amount}::bigint
        WHERE a.id::text = ${w.accountPkId}::text
          AND a.balance >= ${amount}::bigint
        RETURNING a.id::text as id, a.balance as balance, a.currency as currency
      `;

      const acc = accRows[0];
      if (!acc) {
        return {
          ok: false as const,
          status: 400,
          error: "insufficient_balance_or_wallet_not_found",
        };
      }

      // 3) Passer en PAID
      const upd = await tx.$queryRaw<
        { id: string; status: string; paidAt: string | null; providerRef: string | null }[]
      >`
        UPDATE public.withdrawal_request w
        SET status = 'paid',
            paid_at = now(),
            provider_ref = COALESCE(${providerRef}::text, w.provider_ref),
            updated_at = now()
        WHERE w.id::text = ${withdrawalId}::text
        RETURNING
          w.id::text as id,
          w.status::text as status,
          w.paid_at::text as "paidAt",
          w.provider_ref::text as "providerRef"
      `;

      return {
        ok: true as const,
        withdrawal: upd[0],
        account: { id: acc.id, balance: acc.balance.toString(), currency: acc.currency },
      };
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, hint: (result as any).hint },
        { status: (result as any).status },
      );
    }

    return NextResponse.json(result);
  } catch (e: any) {
    console.error("[ADMIN WITHDRAWALS PAY ERROR]", e);
    return NextResponse.json(
      { error: "internal_error", details: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
