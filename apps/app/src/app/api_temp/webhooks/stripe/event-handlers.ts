// src/app/api/webhooks/stripe/event-handlers.ts
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Stripe may deliver the same event multiple times.
 * We prevent double-crediting by checking existing rows.
 *
 * IMPORTANT:
 * - For workspace credits: we anchor idempotency to payment_intent when possible (best),
 *   otherwise fallback to checkout session id.
 * - For subscription invoices: we already use stripeInvoiceId.
 *
 * NOTE ABOUT SNAKE_CASE:
 * Your Prisma client currently exposes snake_case fields for these NEW tables
 * (e.g. workspace_id, credit_account_id, reference_id, etc.). This file uses
 * snake_case consistently to match your generated client.
 */

async function alreadyProcessedWorkspaceCredits(referenceId: string, workspaceId: string) {
  // Find the credit account for this workspace
  const account = await prisma.workspaceCreditAccount.findUnique({
    where: { workspace_id: workspaceId },
    select: { id: true },
  });

  if (!account?.id) return false;

  // Look for an existing purchase credit transaction with the same reference
  const existingTx = await prisma.workspaceCreditTransaction.findFirst({
    where: {
      credit_account_id: account.id,
      reference_id: referenceId,
      reason: "purchase",
      direction: "credit",
    },
    select: { id: true },
  });

  return !!existingTx;
}

async function alreadyProcessedInvoice(invoiceId: string) {
  const existing = await prisma.payment.findFirst({
    where: { stripeInvoiceId: invoiceId },
    select: { id: true },
  });
  return !!existing;
}

function getMetadata(session: Stripe.Checkout.Session) {
  const md = (session.metadata ?? {}) as Record<string, string>;
  return {
    type: md.type || "", // "workspace_credits" or legacy
    workspaceId: md.workspaceId || "",
    organizationId: md.organizationId || "",
    actorUserId: md.actorUserId || md.userId || "",
    credits: Number.parseInt(md.credits || "0", 10) || 0,
    unitPriceCents: Number.parseInt(md.unitPriceCents || "0", 10) || 0,
    amountTotalCents: Number.parseInt(md.amountTotalCents || "0", 10) || 0,
    requestId: md.requestId || "",
  };
}

function getWorkspaceCreditsReferenceId(session: Stripe.Checkout.Session) {
  // Prefer payment_intent for true idempotency.
  // Fallback to checkout session id if payment_intent missing.
  return (typeof session.payment_intent === "string" && session.payment_intent) || session.id;
}

/**
 * 1) CHECKOUT SESSION COMPLETED
 * Handles:
 * - workspace credits purchase (NEW): WorkspaceCreditAccount + WorkspaceCreditTransaction
 * - legacy organization credits (OLD): BillingInfo.credits increment
 */
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("[WH] checkout.session.completed raw snapshot", {
    id: session.id,
    mode: session.mode,
    status: session.status,
    payment_status: (session as any).payment_status,
    currency: session.currency,
    amount_total: session.amount_total,
    payment_intent: session.payment_intent,
    customer: session.customer,
    metadata: session.metadata,
  });

  // Only one-time payments here
  if (session.mode !== "payment") {
    console.warn("[WH] skip: mode not payment", { mode: session.mode });
    return;
  }

  if (!session.id) {
    console.warn("[WH] skip: missing session.id");
    return;
  }

  const md = getMetadata(session);
  console.log("[WH] parsed metadata", md);

  const credits = md.credits;
  if (!credits || credits <= 0) {
    console.warn("[WH] skip: invalid credits", { credits, metadata: session.metadata });
    return;
  }

  /**
   * NEW FLOW: Workspace credits
   * Source of truth = ledger transaction; balance is a cached view.
   */
  if (md.type === "workspace_credits") {
    console.log("[WH] handling workspace_credits", {
      workspaceId: md.workspaceId,
      organizationId: md.organizationId,
      credits,
    });

    if (!md.workspaceId) {
      console.warn("[WH] skip: missing workspaceId in metadata", { metadata: session.metadata });
      return;
    }

    // Validate workspace exists
    const ws = await prisma.workspace.findUnique({
      where: { id: md.workspaceId },
      select: { id: true, organizationId: true },
    });

    if (!ws) {
      console.warn("[WH] skip: workspace not found", { workspaceId: md.workspaceId });
      return;
    }

    const referenceId = getWorkspaceCreditsReferenceId(session);

    // Idempotency guard (workspace credits)
    if (await alreadyProcessedWorkspaceCredits(referenceId, md.workspaceId)) {
      console.log("[WH] skip: workspace credits already processed", {
        referenceId,
        workspaceId: md.workspaceId,
      });
      return;
    }

    try {
      await prisma.$transaction(async (tx) => {
        console.log("[WH] tx start (workspace_credits)", {
          workspaceId: md.workspaceId,
          credits,
          referenceId,
        });

        // Ensure account exists (snake_case)
        const account = await tx.workspaceCreditAccount.upsert({
          where: { workspace_id: md.workspaceId },
          update: {},
          create: {
            workspace_id: md.workspaceId,
            balance: 0,
            currency: (session.currency || "EUR").toUpperCase(),
            overdraft_allowed: false,
            overdraft_limit: 0,
          },
          select: { id: true },
        });

        console.log("[WH] tx account upsert ok", { accountId: account.id });

        // Read current balance inside tx
        const current = await tx.workspaceCreditAccount.findUnique({
          where: { id: account.id },
          select: { balance: true },
        });

        const before = current?.balance ?? 0;
        const after = before + credits;

        // Ledger transaction (snake_case)
        console.log("[WH] tx creating transaction", {
          credit_account_id: account.id,
          direction: "credit",
          amount: credits,
          reason: "purchase",
          reference_id: referenceId,
          description: `Achat de ${credits} crédits (Stripe ref: ${referenceId})`,
          balance_before: before,
          balance_after: after,
        });
        
        const createdTx = await tx.workspaceCreditTransaction.create({
          data: {
            credit_account_id: account.id,
            direction: "credit",
            amount: credits,
            reason: "purchase",
            reference_id: referenceId, // idempotency anchor
            description: `Achat de ${credits} crédits (Stripe ref: ${referenceId})`,
            balance_after: after,
            actor_user_id: md.actorUserId || null,
            metadata: {
              type: "workspace_credits",
              requestId: md.requestId || null,
              stripeCheckoutSessionId: session.id,
              stripePaymentIntentId:
                typeof session.payment_intent === "string" ? session.payment_intent : null,
              stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
              amountTotal: session.amount_total ?? null,
              currency: session.currency ?? null,
              organizationId: md.organizationId || ws.organizationId || null,
              workspaceId: md.workspaceId,
              unitPriceCents: md.unitPriceCents || null,
              amountTotalCents: md.amountTotalCents || null,
            } as any,
          },
          select: { id: true },
        });

        console.log("[WH] tx transaction create ok", {
          txId: createdTx.id,
          before,
          after,
        });

        // Update cached balance
        await tx.workspaceCreditAccount.update({
          where: { id: account.id },
          data: { balance: after },
        });

        console.log("[WH] tx balance update ok", { accountId: account.id, after });
      });

      console.log("[WH] tx committed (workspace_credits)", {
        workspaceId: md.workspaceId,
        referenceId,
      });
    } catch (e) {
      console.error("[WH] tx failed (workspace_credits)", e);
      throw e;
    }

    // Revalidate relevant reads (adjust to your app routes)
    revalidatePath(`/api/workspaces/${md.workspaceId}/credits`);
    revalidatePath("/billing");
    return;
  }

  /**
   * OLD FLOW: Organization credits (legacy)
   */
  console.warn("[WH] not workspace_credits, fallback to legacy flow", {
    type: md.type,
    organizationId: md.organizationId,
  });

  if (!md.organizationId) {
    console.warn("[WH] skip legacy: missing organizationId", {
      sessionId: session.id,
      metadata: session.metadata,
    });
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.billingInfo.upsert({
        where: { organizationId: md.organizationId },
        update: { credits: { increment: credits } },
        create: {
          organizationId: md.organizationId,
          credits,
          country: session.customer_details?.address?.country || "",
          company: session.customer_details?.name || "",
          firstName: "",
          lastName: "",
          civility: "",
          acceptTerms: true,
        },
      });
    });

    console.log("[WH] legacy credits incremented", {
      organizationId: md.organizationId,
      credits,
    });
  } catch (e) {
    console.error("[WH] legacy tx failed", e);
    throw e;
  }

  revalidatePath("/api/billing/get-one");
}

/**
 * 2) CHECKOUT SESSION EXPIRED
 */
export async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  console.log("[WH] checkout.session.expired", {
    id: session.id,
    mode: session.mode,
    status: session.status,
    metadata: session.metadata,
  });

  // Optional: analytics / abandoned checkout tracking
}

/**
 * 3) SUBSCRIPTION CREATED (legacy organization subscription)
 */
export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("[WH] customer.subscription.created", {
    id: subscription.id,
    status: subscription.status,
    metadata: subscription.metadata,
  });

  const organizationId = subscription.metadata?.organizationId;
  const planId = subscription.metadata?.planId;

  if (!organizationId || !planId) {
    console.warn("[WH] skip subscription.created: missing orgId or planId", {
      organizationId,
      planId,
    });
    return;
  }

  await prisma.subscription.create({
    data: {
      organizationId,
      planId,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.start_date * 1000),
      // Stripe typings can vary; keep safe access
      currentPeriodEnd: (subscription as any).current_period_end
        ? new Date((subscription as any).current_period_end * 1000)
        : new Date(),
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      metadata: subscription.metadata as any,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  revalidatePath("/api/billing/get-one");
}

/**
 * 4) SUBSCRIPTION UPDATED
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("[WH] customer.subscription.updated", {
    id: subscription.id,
    status: subscription.status,
  });

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: subscription.start_date ? new Date(subscription.start_date * 1000) : new Date(),
      currentPeriodEnd: (subscription as any).current_period_end
        ? new Date((subscription as any).current_period_end * 1000)
        : new Date(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      stripePriceId: subscription.items.data[0]?.price.id,
      metadata: subscription.metadata as any,
    },
  });

  revalidatePath("/api/billing/get-one");
}

/**
 * 5) SUBSCRIPTION DELETED
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("[WH] customer.subscription.deleted", { id: subscription.id });

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: "canceled", cancelAtPeriodEnd: false },
  });

  revalidatePath("/api/billing/get-one");
}

/**
 * 6) INVOICE PAID (subscription invoices)
 */
export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const stripeSubId =
    typeof (invoice as any).subscription === "string"
      ? ((invoice as any).subscription as string)
      : null;

  console.log("[WH] invoice.paid", {
    invoiceId: invoice.id,
    stripeSubscriptionId: stripeSubId,
    organizationId: invoice.metadata?.organizationId,
    amount_paid: invoice.amount_paid,
    currency: invoice.currency,
  });

  if (!stripeSubId) return;

  const localSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubId },
    select: { id: true },
  });

  if (!localSub) return;

  // Idempotency: avoid duplicates
  if (await alreadyProcessedInvoice(invoice.id)) {
    await prisma.payment.updateMany({
      where: { stripeInvoiceId: invoice.id },
      data: {
        status: "paid",
        paidAt: invoice.status_transitions?.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000)
          : new Date(),
      },
    });
    revalidatePath("/api/billing/get-one");
    return;
  }

  await prisma.payment.create({
    data: {
      subscriptionId: localSub.id,
      stripeInvoiceId: invoice.id,
      stripePaymentIntentId: typeof invoice.payment_intent === "string" ? invoice.payment_intent : null,
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency || "EUR",
      status: "paid",
      description: invoice.description || "Paiement d'abonnement",
      paidAt: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : new Date(),
    },
  });

  revalidatePath("/api/billing/get-one");
}

/**
 * 7) INVOICE PAYMENT FAILED (subscription invoices)
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const stripeSubId =
    typeof (invoice as any).subscription === "string"
      ? ((invoice as any).subscription as string)
      : null;

  console.log("[WH] invoice.payment_failed", {
    invoiceId: invoice.id,
    stripeSubscriptionId: stripeSubId,
    organizationId: invoice.metadata?.organizationId,
    amount_due: invoice.amount_due,
    currency: invoice.currency,
  });

  if (!stripeSubId) return;

  const localSub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubId },
    select: { id: true },
  });

  if (!localSub) return;

  const existing = await prisma.payment.findFirst({
    where: { stripeInvoiceId: invoice.id },
    select: { id: true },
  });

  if (existing) {
    await prisma.payment.update({
      where: { id: existing.id },
      data: { status: "failed" },
    });
    revalidatePath("/api/billing/get-one");
    return;
  }

  await prisma.payment.create({
    data: {
      subscriptionId: localSub.id,
      stripeInvoiceId: invoice.id,
      amount: (invoice.amount_due || 0) / 100,
      currency: invoice.currency || "EUR",
      status: "failed",
      description: invoice.description || "Tentative de paiement échouée",
    },
  });

  revalidatePath("/api/billing/get-one");
}

/**
 * 8) INVOICE PAYMENT SUCCEEDED (optional)
 * (No-op to avoid double handling in some Stripe setups.)
 */
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("[WH] invoice.payment_succeeded (noop)", { invoiceId: invoice.id });
}

/**
 * Utility: local subscription id from Stripe subscription id
 */
export async function getSubscriptionId(stripeSubscriptionId: string): Promise<string | null> {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
    select: { id: true },
  });
  return subscription?.id || null;
}
