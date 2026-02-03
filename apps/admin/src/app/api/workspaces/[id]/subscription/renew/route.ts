// src/app/api/workspaces/[id]/subscription/renew/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addMonths } from "@/lib/dates";
import { getMonthlyCredits } from "@/lib/plans/credits";
import type { PlanOverrides } from "@/lib/plans/plan-overrides";
import type { PlanCode, LimitValue, BoolValue } from "@/lib/plans/plan-limits";

/**
 * Aligné sur assign:
 * LimitValue = number | "unlimited" | "custom"
 * BoolValue  = boolean | "custom"
 */
function isLimitValue(v: unknown): v is LimitValue {
  return (
    (typeof v === "number" && Number.isFinite(v) && v >= 0) ||
    v === "unlimited" ||
    v === "custom"
  );
}

function assertLimitValue(name: string, v: unknown) {
  if (v === undefined) return;
  if (!isLimitValue(v)) {
    throw new Error(`${name} must be number>=0 | "unlimited" | "custom"`);
  }
}

function isBoolValue(v: unknown): v is BoolValue {
  return typeof v === "boolean" || v === "custom";
}

function assertBoolValue(name: string, v: unknown) {
  if (v === undefined) return;
  if (!isBoolValue(v)) {
    throw new Error(`${name} must be boolean | "custom"`);
  }
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
    const note = body?.note ? String(body.note).trim() : null;

    // 1) Charger la subscription existante (inclure overrides)
    const existing = await prisma.workspacePlanSubscription.findUnique({
      where: { workspaceId },
      select: {
        id: true,
        planCode: true,
        status: true,
        startsAt: true,
        endsAt: true,
        overrides: true,
        source: true,
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
    // - si endsAt est encore futur => on prolonge à partir de endsAt (on conserve startsAt)
    // - sinon => nouveau cycle: startsAt=now et endsAt=now+1mois
    const isCurrentPeriodStillValid = Boolean(existing.endsAt && existing.endsAt > now);

    const startsAt = isCurrentPeriodStillValid ? existing.startsAt : now;
    const baseEnd = isCurrentPeriodStillValid ? (existing.endsAt as Date) : now;
    const endsAt = addMonths(baseEnd, 1);

    const planCode = String(existing.planCode).trim() as PlanCode;

    // 2) Overrides: uniquement si plan entreprise
    const overrides =
      planCode === "entreprise"
        ? ((existing.overrides ?? null) as PlanOverrides | null)
        : null;

    // 3) Valider overrides (aligné assign)
    if (planCode === "entreprise" && overrides) {
      assertLimitValue("overrides.respondentCompletes", overrides.respondentCompletes);
      assertLimitValue("overrides.deploymentLocations", overrides.deploymentLocations);
      assertLimitValue("overrides.surveyVerificationRounds", overrides.surveyVerificationRounds);
      assertLimitValue("overrides.questionsPerSurvey", overrides.questionsPerSurvey);
      assertLimitValue("overrides.segmentationDimensions", overrides.segmentationDimensions);
      assertLimitValue("overrides.userSeats", overrides.userSeats);
      assertLimitValue("overrides.proprietaryDashboardsAccess", overrides.proprietaryDashboardsAccess);
      assertBoolValue("overrides.surveyTemplateLibraryAndImport", overrides.surveyTemplateLibraryAndImport);
    }

    // 4) Crédit mensuel selon plan + overrides (entreprise inclus)
    const creditsToGrant = getMonthlyCredits(planCode, overrides);

    /**
     * ✅ Aligné sur assign :
     * Update subscription HORS transaction (rapide, évite timeout interactive)
     */
    const sub = await prisma.workspacePlanSubscription.update({
      where: { workspaceId },
      data: {
        status: "active",
        startsAt, // conserve si période encore valide
        endsAt,   // prolonge d'un mois
        note,
        assignedByUserId: session.user.id,
        updatedAt: new Date(),
        // ⚠️ on ne touche pas overrides au renew, on conserve la négociation existante
      },
      select: {
        id: true,
        planCode: true,
        status: true,
        startsAt: true,
        endsAt: true,
        note: true,
        source: true,
        overrides: true,
        assignedByUser: { select: { id: true, name: true, email: true } },
        updatedAt: true,
      },
    });

    /**
     * ✅ Crédit : transaction courte + timeout augmenté
     */
    let creditTx: any = null;
    let creditBalanceAfter: number | null = null;

    if (typeof creditsToGrant === "number" && creditsToGrant > 0) {
      const creditResult = await prisma.$transaction(
        async (tx) => {
          // Récupérer / créer le compte crédit
          let creditAccount = await tx.workspace_credit_account.findUnique({
            where: { workspace_id: workspaceId },
            select: { id: true, balance: true },
          });

          if (!creditAccount) {
            creditAccount = await tx.workspace_credit_account.create({
              data: {
                workspace: { connect: { id: workspaceId } },
                balance: 0,
                currency: "EUR",
                overdraft_allowed: false,
                overdraft_limit: 0,
              },
              select: { id: true, balance: true },
            });
          }

          const newBalance = (creditAccount.balance ?? 0) + creditsToGrant;

          await tx.workspace_credit_account.update({
            where: { id: creditAccount.id },
            data: { balance: newBalance, updated_at: new Date() },
          });

          const createdTx = await tx.workspace_credit_transaction.create({
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
                action: "renew",
                planCode,
                startsAt: startsAt.toISOString(),
                endsAt: endsAt.toISOString(),
                // ✅ très utile pour entreprise (audit)
                overrides: overrides ?? null,
                // Optionnel : savoir si on renouvelait un cycle actif ou expiré
                isCurrentPeriodStillValid,
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

          return { createdTx, newBalance };
        },
        { timeout: 20_000, maxWait: 20_000 },
      );

      creditTx = creditResult.createdTx;
      creditBalanceAfter = creditResult.newBalance;
    }

    return NextResponse.json(
      {
        subscription: sub,
        creditsGranted: creditTx?.amount ?? 0,
        creditBalanceAfter,
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
