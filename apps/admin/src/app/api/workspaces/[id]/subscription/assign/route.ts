// src/app/api/workspaces/[id]/subscription/assign/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addMonths } from "@/lib/dates";
import type { PlanOverrides } from "@/lib/plans/plan-overrides";
import { getMonthlyCredits } from "@/lib/plans/credits";
import type { PlanCode } from "@/lib/plans/plan-limits";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: headers() });

    // Optionnel mais recommandé: vérifier rôle superAdmin
    // (à adapter selon comment tu exposes les rôles dans la session)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.id;
    const body = await req.json();

   const planCode = String(body.planCode ?? "").trim() as PlanCode;

    // overrides (optionnel)
    const overrides = (body.overrides ?? null) as PlanOverrides | null;

    const note = body.note ? String(body.note).trim() : null;

    if (
    overrides?.respondentCompletes !== undefined &&
    (typeof overrides.respondentCompletes !== "number" ||
        !Number.isFinite(overrides.respondentCompletes) ||
        overrides.respondentCompletes < 0)
    ) {
    return NextResponse.json(
        { error: "overrides.respondentCompletes must be a positive number" },
        { status: 400 },
    );
    }
    if (!planCode) {
        return NextResponse.json({ error: "planCode is required" }, { status: 400 });
    }

    // Mensuel: dates
    const startsAt = body.startsAt ? new Date(body.startsAt) : new Date();
    const endsAt = addMonths(startsAt, 1);

    // Crédit mensuel selon plan + overrides
    const creditsToGrant = getMonthlyCredits(planCode, overrides);

    

    const assignedByUserId = session.user.id;

    // Vérifier existence workspace + récupérer account si besoin
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        workspace_credit_account: { select: { id: true, balance: true } },
      },
    });

    if (!ws) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Transaction DB (subscription + crédit)
    const result = await prisma.$transaction(async (tx) => {
      // 1) Upsert subscription (1-1)
      const sub = await tx.workspacePlanSubscription.upsert({
        where: { workspaceId },
        create: {
          workspace: { connect: { id: workspaceId } },
          planCode,
          status: "active",
          startsAt,
          endsAt,
          source: "manual",
          note,
          assignedByUser: { connect: { id: assignedByUserId } },
        },
        update: {
          planCode,
          status: "active",
          startsAt,
          endsAt,
          source: "manual",
          note,
          assignedByUserId,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          planCode: true,
          status: true,
          startsAt: true,
          endsAt: true,
          source: true,
          note: true,
          assignedByUser: { select: { id: true, name: true, email: true } },
          createdAt: true,
          updatedAt: true,
        },
      });

      // 2) Créditer le compte crédits du workspace si plan numeric
      let creditTx: any = null;

      if (typeof creditsToGrant === "number" && creditsToGrant > 0) {
        // Ensure credit account
        const creditAccount =
          ws.workspace_credit_account ??
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
            subscription_id: null, // optionnel: si tu relies à workspace_credit_subscription
            direction: "credit",
            amount: creditsToGrant,
            reason: "subscription_grant",
            reference_id: sub.id,
            description: `Monthly grant for plan ${planCode}`,
            balance_after: newBalance,
            actor_user_id: assignedByUserId,
            metadata: {
              planCode,
              startsAt: startsAt.toISOString(),
              endsAt: endsAt.toISOString(),
            },
          },
          select: {
            id: true,
            amount: true,
            balance_after: true,
            created_at: true,
            reason: true,
          },
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
