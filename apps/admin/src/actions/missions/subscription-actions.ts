"use server";

import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { stripe, getStripeCustomer, createCheckoutSession } from "@/lib/stripe";
import { authActionClient } from "../safe-action";

const prisma = new PrismaClient();

// Schémas de validation
const createCheckoutSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  planId: z.string().min(1, "Plan ID is required"),
  billingEmail: z.string().email("Valid email is required"),
});

const getSubscriptionSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

const cancelSubscriptionSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

const getUsageStatsSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

export async function getSubscriptionPlans() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    return { success: true, data: plans };
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return {
      success: false,
      error: "Failed to fetch subscription plans",
    };
  }
}

// Action pour créer une session de checkout Stripe
export const createSubscriptionCheckoutAction = authActionClient
  .schema(createCheckoutSchema)
  .metadata({
    name: "create-subscription-checkout",
  })
  .action(async ({ parsedInput: { organizationId, planId, billingEmail } }) => {
    try {
      // Récupérer le plan
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        throw new Error("Plan not found");
      }

      // Créer ou récupérer le customer Stripe
      const customer = await getStripeCustomer(billingEmail, organizationId);

      // Créer le prix Stripe si nécessaire (ou utiliser un prix existant)
      const price = await stripe.prices.create({
        unit_amount: plan.price,
        currency: plan.currency.toLowerCase(),
        recurring: {
          interval: plan.interval as "month" | "year",
        },
        product_data: {
          name: plan.name,
          statement_descriptor: plan.description || undefined,
        },
      });

      // Créer la session de checkout
      const session = await createCheckoutSession({
        customerId: customer?.id || "",
        priceId: price.id,
        organizationId,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/plans`,
      });

      return { success: true, data: { url: session.url } };
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw new Error("Failed to create checkout session");
    }
  });

// Action pour récupérer la souscription d'une organisation
export async function getOrganizationSubscription(organizationId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    return { success: true, data: subscription };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return {
      success: false,
      error: "Failed to fetch subscription",
    };
  }
}

// Action pour annuler une souscription
export const cancelSubscriptionAction = authActionClient
  .schema(cancelSubscriptionSchema)
  .metadata({
    name: "cancel-subscription",
  })
  .action(async ({ parsedInput: { organizationId } }) => {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { organizationId },
      });

      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new Error("Subscription not found");
      }

      // Annuler dans Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Mettre à jour en base
      await prisma.subscription.update({
        where: { organizationId },
        data: { cancelAtPeriodEnd: true },
      });

      revalidatePath("/");
      return {
        success: true,
        message:
          "Subscription will be canceled at the end of the current period",
      };
    } catch (error) {
      console.error("Error canceling subscription:", error);
      throw new Error("Failed to cancel subscription");
    }
  });
