// src/app/api/create-checkout-session/route.ts
import { findSubscriptionPlanById } from "@/lib/subscription/get-subscription-plan";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { planId, organizationId, user } = await req.json();

    // Validation des paramètres requis
    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    if (!user?.email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Récupérer le plan
    const plan = await findSubscriptionPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Rechercher le produit Stripe correspondant
    const products = await stripe.products.list({
      limit: 100, // Optimisation: limiter la recherche
    });

    const plan_product = products?.data?.find(
      (item) => item?.name === plan?.name
    );

    if (!plan_product) {
      return NextResponse.json(
        { error: "Product not found in Stripe" },
        { status: 404 }
      );
    }

    // Rechercher le prix récurrent du produit
    const prices = await stripe.prices.list({
      product: plan_product.id, // Optimisation: filtrer par produit
      type: "recurring", // Filtrer uniquement les prix récurrents
      active: true, // Uniquement les prix actifs
      limit: 10,
    });

    const product_price = prices?.data?.[0]; // Prendre le premier prix actif

    if (!product_price) {
      return NextResponse.json(
        { error: "No recurring price found for this product" },
        { status: 404 }
      );
    }

    // Créer ou récupérer le customer Stripe
    let customer: Stripe.Customer;

    // Vérifier si le customer existe déjà
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]!;

      // Mettre à jour les informations si nécessaire
      if (customer.name !== user.name || customer.metadata.userId !== user.id) {
        customer = await stripe.customers.update(customer.id, {
          name: user.name || customer.name,
          metadata: {
            userId: user.id || customer.metadata.userId,
            organizationId: organizationId || customer.metadata.organizationId,
          },
        });
      }
    } else {
      // Créer un nouveau customer
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id || "",
          organizationId: organizationId || "",
        },
      });
    }

    // Créer la session checkout
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id, // Utiliser le customer ID
      line_items: [
        {
          price: product_price.id,
          quantity: 1,
        },
      ],
      metadata: {
        planId,
        organizationId: organizationId || "",
        userId: user.id || "",
        userEmail: user.email,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
      // Options supplémentaires recommandées
      allow_promotion_codes: true, // Permet les codes promo
      billing_address_collection: "auto", // Collecte l'adresse si nécessaire
      tax_id_collection: {
        enabled: true, // Pour les entreprises
      },
      customer_update: {
        address: "auto", // Met à jour l'adresse du customer
        name: "auto", // Met à jour le nom du customer
      },
    });

    return NextResponse.json({
      id: session.id,
      url: session.url, // Inclure l'URL pour la redirection
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
