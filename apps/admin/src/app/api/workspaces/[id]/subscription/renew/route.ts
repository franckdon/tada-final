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

    // Règle:
    // - si endsAt est encore futur => on prolonge à partir de endsAt
    // - sinon => on repart sur un nouveau cycle à partir de now
    const isCurrentPeriodStillValid = Boolean(existing.endsAt && existing.endsAt > now);

    const startsAt = isCurrentPeriodStillValid ? existing.startsAt : now;
    const baseEnd = isCurrentPeriodStillValid ? (existing.endsAt as Date) : now;
    const endsAt = addMonths(baseEnd, 1);

    const planCode = String(existing.planCode).trim() as PlanCode;
    const overrides = (existing.overrides ?? null) as PlanOverrides | null;

    const creditsToGrant = getMonthlyCredits(planCode, overrides);

    const result = await prisma.$transaction(async (tx) => {
      // 1) Update subscription (NE PAS écraser startsAt si période valide)
      const sub = await tx.workspacePlanSubscription.update({
        where: { workspaceId },
        data: {
          status: "active",
          startsAt,
          endsAt,
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

      // 2) Créditer le mois supplémentaire (1 renouvellement = 1 grant)
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
            reason: "subscription_renew_grant",
            reference_id: sub.id,
            description: `Renew monthly grant for plan ${planCode}`,
            balance_after: newBalance,
            actor_user_id: session.user.id,
            metadata: {
              planCode,
              action: "renew",
              startsAt: startsAt.toISOString(),
              endsAt: endsAt.toISOString(),
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
