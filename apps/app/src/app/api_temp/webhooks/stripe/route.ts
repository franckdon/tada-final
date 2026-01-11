// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  handleCheckoutCompleted,
  handleCheckoutExpired,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  handleSubscriptionCreated,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from "./event-handlers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

/**
 * Avoid leaking secrets in logs:
 * - We only log derived / non-sensitive parts (presence flags, short ids, hostnames).
 */
function getDbHostSafe() {
  const db = process.env.DATABASE_URL || "";
  const afterAt = db.split("@")[1] || "";
  const hostPortAndRest = afterAt.split("/")[0] || "";
  return hostPortAndRest || "unknown";
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log("[STRIPE_WEBHOOK] received", {
    env: process.env.VERCEL_ENV || process.env.NODE_ENV,
    hasWebhookSecret: !!webhookSecret,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    hasSigHeader: !!req.headers.get("stripe-signature"),
    dbHost: getDbHostSafe(),
  });

  if (!webhookSecret) {
    console.error("[STRIPE_WEBHOOK] Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("[STRIPE_WEBHOOK] Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // IMPORTANT: Use raw text for Stripe signature verification
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[STRIPE_WEBHOOK] Invalid signature", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // --- LOG #2: Event basics ---
  console.log("[STRIPE_WEBHOOK] event", {
    id: event.id,
    type: event.type,
    created: event.created,
    livemode: event.livemode,
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // --- LOG #3: Checkout session quick diagnostics ---
        console.log("[STRIPE_WEBHOOK] checkout.session.completed", {
          sessionId: session.id,
          mode: session.mode,
          paymentIntent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          customerId: typeof session.customer === "string" ? session.customer : null,
          currency: session.currency,
          amountTotal: session.amount_total,
          metadata: session.metadata ?? {},
        });

        await handleCheckoutCompleted(session);
        break;
      }

      case "checkout.session.expired": {
        const expiredSession = event.data.object as Stripe.Checkout.Session;

        console.log("[STRIPE_WEBHOOK] checkout.session.expired", {
          sessionId: expiredSession.id,
          mode: expiredSession.mode,
          metadata: expiredSession.metadata ?? {},
        });

        await handleCheckoutExpired(expiredSession);
        break;
      }

      case "customer.subscription.created": {
        const subscriptionCreated = event.data.object as Stripe.Subscription;

        console.log("[STRIPE_WEBHOOK] customer.subscription.created", {
          subId: subscriptionCreated.id,
          status: subscriptionCreated.status,
          customer:
            typeof subscriptionCreated.customer === "string"
              ? subscriptionCreated.customer
              : null,
          metadata: subscriptionCreated.metadata ?? {},
        });

        await handleSubscriptionCreated(subscriptionCreated);
        break;
      }

      case "customer.subscription.updated": {
        const subscriptionUpdated = event.data.object as Stripe.Subscription;

        console.log("[STRIPE_WEBHOOK] customer.subscription.updated", {
          subId: subscriptionUpdated.id,
          status: subscriptionUpdated.status,
          cancelAtPeriodEnd: subscriptionUpdated.cancel_at_period_end,
          currentPeriodEnd: subscriptionUpdated.current_period_end,
          metadata: subscriptionUpdated.metadata ?? {},
        });

        await handleSubscriptionUpdated(subscriptionUpdated);
        break;
      }

      case "customer.subscription.deleted": {
        const subscriptionDeleted = event.data.object as Stripe.Subscription;

        console.log("[STRIPE_WEBHOOK] customer.subscription.deleted", {
          subId: subscriptionDeleted.id,
          status: subscriptionDeleted.status,
          metadata: subscriptionDeleted.metadata ?? {},
        });

        await handleSubscriptionDeleted(subscriptionDeleted);
        break;
      }

      // Subscription invoices
      case "invoice.paid": {
        const invoicePaid = event.data.object as Stripe.Invoice;

        console.log("[STRIPE_WEBHOOK] invoice.paid", {
          invoiceId: invoicePaid.id,
          subscription:
            typeof invoicePaid.subscription === "string" ? invoicePaid.subscription : null,
          paymentIntent:
            typeof invoicePaid.payment_intent === "string" ? invoicePaid.payment_intent : null,
          amountPaid: invoicePaid.amount_paid,
          currency: invoicePaid.currency,
          metadata: invoicePaid.metadata ?? {},
        });

        await handleInvoicePaid(invoicePaid);
        break;
      }

      case "invoice.payment_failed": {
        const invoicePaymentFailed = event.data.object as Stripe.Invoice;

        console.log("[STRIPE_WEBHOOK] invoice.payment_failed", {
          invoiceId: invoicePaymentFailed.id,
          subscription:
            typeof invoicePaymentFailed.subscription === "string"
              ? invoicePaymentFailed.subscription
              : null,
          paymentIntent:
            typeof invoicePaymentFailed.payment_intent === "string"
              ? invoicePaymentFailed.payment_intent
              : null,
          amountDue: invoicePaymentFailed.amount_due,
          currency: invoicePaymentFailed.currency,
          metadata: invoicePaymentFailed.metadata ?? {},
        });

        await handleInvoicePaymentFailed(invoicePaymentFailed);
        break;
      }

      default: {
        console.log("[STRIPE_WEBHOOK] Unhandled event type", {
          type: event.type,
          id: event.id,
        });
        break;
      }
    }
  } catch (error) {
    console.error("[STRIPE_EVENT_HANDLER_ERROR]", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      eventType: event.type,
      eventId: event.id,
    });

    return NextResponse.json(
      { error: "Webhook event handling failed." },
      { status: 500 }
    );
  }

  console.log("[STRIPE_WEBHOOK] handled", { eventId: event.id, type: event.type });
  return NextResponse.json({ received: true });
}
