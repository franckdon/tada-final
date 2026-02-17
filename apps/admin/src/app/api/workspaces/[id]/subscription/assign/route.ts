// src/app/api/workspaces/[id]/subscription/assign/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addMonths } from "@/lib/dates";
import type { PlanOverrides } from "@/lib/plans/plan-overrides";
import type { PlanCode, LimitValue, BoolValue } from "@/lib/plans/plan-limits";
import { ensureInvoiceForPlanSubscription } from "@/lib/billing/invoice-service";

/**
 * Validation alignée sur plan-limits.ts
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

type PaymentMethod = "cash" | "cheque" | "bank_transfer" | "mobile_money";

function isPaymentMethod(v: unknown): v is PaymentMethod {
  return (
    v === "cash" ||
    v === "cheque" ||
    v === "bank_transfer" ||
    v === "mobile_money"
  );
}

const UNIT_PRICE_XOF = 9000;

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
    const body = await req.json();

    const planCode = String(body.planCode ?? "").trim() as PlanCode;
    const overrides = (body.overrides ?? null) as PlanOverrides | null;
    const note = body.note ? String(body.note).trim() : null;

    const billing = body.billing ?? null;
    const paymentMethod = billing?.paymentMethod as unknown;
    const creditsQty = Number(billing?.creditsQty ?? 0);
    const unitPriceXof = Number(billing?.unitPriceXof ?? UNIT_PRICE_XOF);
    const amountXof = Number(billing?.amountXof ?? 0);

    if (!planCode) {
      return NextResponse.json({ error: "planCode is required" }, { status: 400 });
    }

    // billing validation
    if (!isPaymentMethod(paymentMethod)) {
      return NextResponse.json({ error: "paymentMethod is invalid" }, { status: 400 });
    }
    if (!Number.isFinite(creditsQty) || creditsQty <= 0) {
      return NextResponse.json({ error: "creditsQty must be > 0" }, { status: 400 });
    }
    if (!Number.isFinite(unitPriceXof) || unitPriceXof <= 0) {
      return NextResponse.json({ error: "unitPriceXof must be > 0" }, { status: 400 });
    }

    if (planCode === "entreprise") {
      if (!Number.isFinite(amountXof) || amountXof <= 0) {
        return NextResponse.json(
          { error: "For entreprise, amountXof is required and must be > 0" },
          { status: 400 },
        );
      }
    } else {
      // non entreprise: if amountXof missing, compute default (unitPrice * qty)
      // but you also allow custom amount.
      if (!Number.isFinite(amountXof) || amountXof <= 0) {
        return NextResponse.json(
          { error: "amountXof must be > 0 (you can override default in UI)" },
          { status: 400 },
        );
      }
    }

    // ✅ sécurité : overrides uniquement pour entreprise
    const safeOverrides = planCode === "entreprise" ? overrides : null;

    // ✅ validations strictes (uniquement si entreprise)
    if (planCode === "entreprise" && safeOverrides) {
      assertLimitValue("overrides.respondentCompletes", safeOverrides.respondentCompletes);
      assertLimitValue("overrides.deploymentLocations", safeOverrides.deploymentLocations);
      assertLimitValue("overrides.surveyVerificationRounds", safeOverrides.surveyVerificationRounds);
      assertLimitValue("overrides.questionsPerSurvey", safeOverrides.questionsPerSurvey);
      assertLimitValue("overrides.segmentationDimensions", safeOverrides.segmentationDimensions);
      assertLimitValue("overrides.userSeats", safeOverrides.userSeats);
      assertLimitValue("overrides.proprietaryDashboardsAccess", safeOverrides.proprietaryDashboardsAccess);

      assertBoolValue("overrides.surveyTemplateLibraryAndImport", safeOverrides.surveyTemplateLibraryAndImport);
    }

    // Mensuel: dates
    const startsAt = body.startsAt ? new Date(body.startsAt) : new Date();
    const endsAt = addMonths(startsAt, 1);

    const assignedByUserId = session.user.id;

    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true },
    });

    if (!ws) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // 1) upsert subscription
    const sub = await prisma.workspacePlanSubscription.upsert({
      where: { workspaceId },
      create: {
        workspace: { connect: { id: workspaceId } },
        planCode,
        status: "active",
        startsAt,
        endsAt,
        source: "manual",
        note,
        overrides: safeOverrides,
        assignedByUser: { connect: { id: assignedByUserId } },
      },
      update: {
        planCode,
        status: "active",
        startsAt,
        endsAt,
        source: "manual",
        note,
        overrides: safeOverrides,
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
        overrides: true,
        assignedByUser: { select: { id: true, name: true, email: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    // 2) invoice upsert/update (XOF)
    const invoice = await ensureInvoiceForPlanSubscription({
      workspaceId,
      workspacePlanSubscriptionId: sub.id,
      currency: "XOF",
      amountCents: amountXof, // treated as XOF integer
      metadata: {
        source: "manual_plan_assign",
        planCode,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        overrides: safeOverrides ?? null,
        note,
        billing: {
          paymentMethod,
          creditsQty,
          unitPriceXof,
          amountXof,
        },
      },
    });

    // 3) credits grant = creditsQty
    let creditTx: any = null;
    let creditBalanceAfter: number | null = null;

    if (creditsQty > 0) {
      const creditResult = await prisma.$transaction(
        async (tx) => {
          let creditAccount = await tx.workspace_credit_account.findUnique({
            where: { workspace_id: workspaceId },
            select: { id: true, balance: true },
          });

          if (!creditAccount) {
            creditAccount = await tx.workspace_credit_account.create({
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

          const newBalance = (creditAccount.balance ?? 0) + creditsQty;

          await tx.workspace_credit_account.update({
            where: { id: creditAccount.id },
            data: { balance: newBalance, updated_at: new Date() },
          });

          const createdTx = await tx.workspace_credit_transaction.create({
            data: {
              credit_account_id: creditAccount.id,
              subscription_id: null,
              direction: "credit",
              amount: creditsQty,
              reason: "manual_credit_grant",
              reference_id: sub.id,
              description: `Manual credit grant (${creditsQty}) for plan ${planCode}`,
              balance_after: newBalance,
              actor_user_id: assignedByUserId,
              metadata: {
                planCode,
                startsAt: startsAt.toISOString(),
                endsAt: endsAt.toISOString(),
                invoiceId: invoice.id,
                billing: {
                  paymentMethod,
                  creditsQty,
                  unitPriceXof,
                  amountXof,
                },
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
        invoice,
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
