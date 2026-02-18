// src/app/api/workspaces/[id]/credits/purchase/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type PaymentMethod = "cash" | "cheque" | "bank_transfer" | "mobile_money";

function isPaymentMethod(v: unknown): v is PaymentMethod {
  return (
    v === "cash" ||
    v === "cheque" ||
    v === "bank_transfer" ||
    v === "mobile_money"
  );
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.id;
    const body = await req.json().catch(() => ({}));

    const creditsQtyRaw = Number(body.creditsQty ?? 0);
    const creditsQty = Number.isFinite(creditsQtyRaw)
      ? Math.floor(creditsQtyRaw)
      : 0;

    const amountRaw = Number(body.amountXof ?? 0);
    const amountXof = Number.isFinite(amountRaw) ? Math.floor(amountRaw) : 0;

    const unitPriceRaw = Number(body.unitPriceXof ?? 0);
    const unitPriceXof = Number.isFinite(unitPriceRaw) ? Math.floor(unitPriceRaw) : 0;

    const paymentMethod = body.paymentMethod as unknown;
    const note = body.note ? String(body.note).trim() : null;

    if (creditsQty <= 0) {
      return NextResponse.json(
        { error: "creditsQty must be a positive integer" },
        { status: 400 },
      );
    }
    if (creditsQty > 1_000_000) {
      return NextResponse.json(
        { error: "creditsQty too large" },
        { status: 400 },
      );
    }
    if (amountXof <= 0) {
      return NextResponse.json(
        { error: "amountXof must be a positive integer" },
        { status: 400 },
      );
    }
    if (!isPaymentMethod(paymentMethod)) {
      return NextResponse.json(
        { error: "paymentMethod is invalid" },
        { status: 400 },
      );
    }

    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true },
    });
    if (!ws) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const actorUserId = session.user.id;

    const result = await prisma.$transaction(
      async (tx) => {
        // 1) ensure credit account
        let account = await tx.workspace_credit_account.findUnique({
          where: { workspace_id: workspaceId },
          select: { id: true, balance: true },
        });

        if (!account) {
          account = await tx.workspace_credit_account.create({
            data: {
              workspace: { connect: { id: workspaceId } },
              balance: 0,
              currency: "XOF",
              overdraft_allowed: false,
              overdraft_limit: 0,
            },
            select: { id: true, balance: true },
          });
        }

        const newBalance = (account.balance ?? 0) + creditsQty;

        await tx.workspace_credit_account.update({
          where: { id: account.id },
          data: { balance: newBalance, updated_at: new Date() },
        });

        // 2) create credit tx
        const creditTx = await tx.workspace_credit_transaction.create({
          data: {
            credit_account_id: account.id,
            subscription_id: null,
            direction: "credit",
            amount: creditsQty,
            reason: "paid_topup",
            reference_id: null,
            description: note ?? `Paid credits top-up (+${creditsQty})`,
            balance_after: newBalance,
            actor_user_id: actorUserId,
            metadata: {
              note,
              source: "credits_purchase",
              billing: {
                paymentMethod,
                creditsQty,
                amountXof,
                unitPriceXof: unitPriceXof > 0 ? unitPriceXof : null,
              },
            },
          },
          select: {
            id: true,
            amount: true,
            balance_after: true,
            created_at: true,
            metadata: true,
          },
        });

        // 3) create invoice with workspaceCreditTransactionId set (✅ constraint OK)
        const invoice = await tx.invoice.create({
          data: {
            workspaceId,
            workspaceCreditTransactionId: creditTx.id,
            amountCents: amountXof,
            currency: "XOF",
            metadata: {
              kind: "credits_topup",
              itemLabel: "Credits top-up",
              note,
              source: "credits_topup_paid",
              billing: {
                paymentMethod,
                creditsQty,
                amountXof,
                unitPriceXof: unitPriceXof > 0 ? unitPriceXof : null,
              },
            },
          },
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            issuedAt: true,
            amountCents: true,
            currency: true,
            workspaceCreditTransactionId: true,
            workspacePlanSubscriptionId: true,
            metadata: true,
          },
        });

        // 4) optional: back-reference invoiceId in tx.metadata
        await tx.workspace_credit_transaction
          .update({
            where: { id: creditTx.id },
            data: {
              metadata: {
                ...(creditTx.metadata as any),
                invoiceId: invoice.id,
              } as any,
            },
          })
          .catch(() => null);

        return { invoice, creditTx, creditBalanceAfter: newBalance };
      },
      { timeout: 20_000, maxWait: 20_000 },
    );

    return NextResponse.json(
      {
        ok: true,
        invoiceId: result.invoice.id,
        invoice: result.invoice,
        creditTx: result.creditTx,
        creditBalanceAfter: result.creditBalanceAfter,
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 },
    );
  }
}
