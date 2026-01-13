// /app/api/verify-checkout-session/route.js
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
// import { db } from '@/lib/db'; // votre base de données

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID manquant" },
        { status: 400 }
      );
    }

    // 1. Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["invoice"],
    });

    if (!session) {
      return NextResponse.json({ error: "Session invalide" }, { status: 400 });
    }

    const organizationId = session?.metadata?.organizationId!;
    const planId = session?.metadata?.planId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "organization est manquante dans metadata" },
        { status: 400 }
      );
    }

    if (!planId) {
      return NextResponse.json(
        { error: "Le plan manque dans metadata" },
        { status: 400 }
      );
    }

    // 2. Vérifier le statut de la session
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        {
          error: "Paiement non confirmé",
          status: session.payment_status,
        },
        { status: 400 }
      );
    }

    // 3. Récupérer les informations de l'abonnement si c'est un abonnement
    let subscription = null;
    if (session.subscription) {
      subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
    }

    const userSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!userSession) {
      return NextResponse.json(
        { error: "Organisation non authentifié" },
        { status: 401 }
      );
    }

    const newSubscription = await prisma.subscription.upsert({
      where: { organizationId },
      update: {
        stripeCustomerId: session.customer as string,
        updatedAt: new Date(),
        planId: session?.metadata?.planId ?? undefined,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          new Date().setMonth(new Date().getMonth() + 1)
        ),
        cancelAtPeriodEnd: false,
      },
      create: {
        stripeCustomerId: session.customer as string,
        updatedAt: new Date(),
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          new Date().setMonth(new Date().getMonth() + 1)
        ),
        cancelAtPeriodEnd: false,
        organization: {
          connect: { id: organizationId },
        },
        plan: {
          connect: { id: session?.metadata?.planId! },
        },
      },
    });

    // 5. Exemple sans base de données (stockage temporaire)
    // Vous pouvez stocker les infos dans une session ou un cache
    const userData = {
      userId: userSession?.session?.userId!,
      orgId: session?.metadata?.organizationId!,
      customerId: session.customer,
      subscriptionId: subscription?.id,
      planType: subscription?.items?.data[0]?.price?.nickname || "premium",
      status: subscription?.status || "active",
      credits:
        subscription?.items?.data[0]?.price?.nickname === "pro" ? 1000 : 100,
    };

    const invoice = session.invoice as Stripe.Invoice;

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        customer: session.customer,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_status: session.payment_status,
      },
      invoice: {
        amount_paid: invoice.amount_paid,
        number: invoice.number,
        hosted_invoice_url: invoice.hosted_invoice_url,
        invoice_pdf: invoice.invoice_pdf,
      },
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            current_period_end: newSubscription?.currentPeriodEnd,
            plan: subscription.items.data[0]?.price?.nickname,
          }
        : null,
      user: userData,
    });
  } catch (error: any) {
    console.error("Erreur lors de la vérification:", error);

    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        {
          error: "Session Stripe invalide",
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
