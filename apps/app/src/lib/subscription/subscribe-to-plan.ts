import { loadStripe } from "@stripe/stripe-js";

type UserData = {
  id: string;
  email?: string;
  name?: string;
};

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export async function subscribeToPlan(
  planId: string,
  organizationId: string,
  user: UserData
) {
  try {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ planId, organizationId, user }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erreur de création de la session");
    }

    const stripe = await stripePromise;

    if (!stripe) {
      throw new Error("Stripe non initialisé");
    }

    const result = await stripe.redirectToCheckout({
      sessionId: data.id,
    });

    if (result.error) {
      console.error(result.error.message);
    }
  } catch (err) {
    console.error("Erreur de souscription :", err);
  }
}
