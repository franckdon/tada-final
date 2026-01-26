import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addMonths } from "@/lib/dates";
import { getMonthlyCredits } from "@/lib/plans/credits";
import type { PlanOverrides } from "@/lib/plans/plan-overrides";
import type { PlanCode } from "@/lib/plans/plan-limits";

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
    const note = body?.note ? String(body.note).trim() : null;

    const existing = await prisma.workspacePlanSubscription.findUnique({
      where: { workspaceId },
      select: {
        id: true,
        planCode: true,
        status: true,
        startsAt: true,
        endsAt: true,
        overrides: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "No subscription found for this workspace" },
        { status: 404 },
      );
    }

    const now = new Date();
    const endsAt = existing.endsAt ? new Date(existing.endsAt) : null;
    const stillValid = Boolean(endsAt && endsAt > now);

    // Si la période est encore valide (ex: tu as désactivé puis réactivé),
    // on ne change PAS les dates et on ne re-crédite PAS.
    const nextStartsAt = stillValid ? existing.startsAt : now;
    const nextEndsAt = stillValid ? endsAt : addMonths(now, 1);

    const planCode = String(existing.planCode).trim() as PlanCode;
    const overrides = (existing.overrides ?? null) as PlanOverrides | null;

    // Crédit uniquement si on repart sur un NOUVEAU cycle (abonnement expiré)
    const shouldGrant = !stillValid;
    const creditsToGrant = shouldGrant ? getMonthlyCredits(planCode, overrides) : 0;

    const result = await prisma.$transaction(async (tx) => {
      const sub = await tx.workspacePlanSubscription.update({
        where: { workspaceId },
        data: {
          status: "active",
          startsAt: nextStartsAt,
          endsAt: nextEndsAt,
          note,
          assignedByUserId: session.user.id,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          planCode: true,
          status: true,
          startsAt: true,
          endsAt: true,
          note: true,
          source: true,
          assignedByUser: { select: { id: true, name: true, email: true } },
          updatedAt: true,
        },
      });

      let creditTx: any = null;

      if (typeof creditsToGrant === "number" && creditsToGrant > 0) {
        const ws = await tx.workspace.findUnique({
          where: { id: workspaceId },
          select: {
            workspace_credit_account: { select: { id: true, balance: true } },
          },
        });

        const creditAccount =
          ws?.workspace_credit_account ??
          (await tx.workspace_credit_account.create({
            data: {
              workspace: { connect: { id: workspaceId } },
              balance: 0,
              currency: "EUR",
              overdraft_allowed: false,
              overdraft_limit: 0,
            },
            select: { id: true, balance: true },
          }));

        const newBalance = (creditAccount.balance ?? 0) + creditsToGrant;

        await tx.workspace_credit_account.update({
          where: { id: creditAccount.id },
          data: { balance: newBalance, updated_at: new Date() },
        });

        creditTx = await tx.workspace_credit_transaction.create({
          data: {
            credit_account_id: creditAccount.id,
            subscription_id: null,
            direction: "credit",
            amount: creditsToGrant,
            reason: "subscription_enable_grant",
            reference_id: sub.id,
            description: `Enable monthly grant for plan ${planCode}`,
            balance_after: newBalance,
            actor_user_id: session.user.id,
            metadata: {
              planCode,
              action: "enable",
              startsAt: nextStartsAt.toISOString(),
              endsAt: nextEndsAt.toISOString(),
            },
          },
          select: { id: true, amount: true, balance_after: true, created_at: true, reason: true },
        });
      }

      return { sub, creditTx };
    });

    return NextResponse.json(
      {
        subscription: result.sub,
        creditsGranted: result.creditTx?.amount ?? 0,
        creditBalanceAfter: result.creditTx?.balance_after ?? null,
        reusedExistingPeriod: stillValid,
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
