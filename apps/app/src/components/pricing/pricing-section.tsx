"use client";

import { PricingCard } from "./pricing-card";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { authClient, useSession } from "@/lib/auth-client";
import { subscribeToPlan } from "@/lib/subscription/subscribe-to-plan";
import { Subscription } from "@/types/subscription";

interface PricingSectionProps {
  initialPlans: any[];
  activeSubscription: Subscription | null;
}

export default function PricingSection({
  initialPlans,
  activeSubscription,
}: PricingSectionProps) {
  const { data } = useSession();
  const [pricingPlans] = useState(initialPlans);
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(
    null
  );
  const { data: organizations } = authClient.useListOrganizations();

  const handleSubscribe = async (plan: any) => {
    setSubscribingPlanId(plan.id);

    if (plan?.name === "Enterprise") {
      window.open(
        "https://calendly.com/jeviensaider/rendez-vous-client",
        "_blank"
      );
      setSubscribingPlanId(null);
      return;
    }

    if (!organizations || !organizations[0]?.id) {
      toast({
        title: "Erreur",
        description: "L'organisation est introuvable ou son ID est manquant.",
        variant: "destructive",
      });
      setSubscribingPlanId(null);
      return;
    }

    try {
      await subscribeToPlan(plan?.id, organizations[0]?.id, {
        id: data?.user.id!,
        email: data?.user.email,
        name: data?.user.name,
      });
      toast({
        title: "Succès",
        description: "Redirection vers la page de paiement Stripe…",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error?.message || "Une erreur est survenue lors de la souscription.",
        variant: "destructive",
      });
    } finally {
      setSubscribingPlanId(null);
    }
  };

  return (
    <section className="w-full py-3 md:py-4 lg:py-5">
      <div>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-4xl text-black">
              Costs less than making the wrong decision
            </h2>
            <p className="max-w-[900px] text-gray-700 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Find the ideal subscription plan that fits your needs and budget.
            </p>
          </div>
        </div>
        <div className="mx-auto grid items-start gap-6 py-12 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 lg:gap-8">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              currency={plan.currency}
              duration={plan.interval}
              description={plan.description}
              features={plan.features as any[]}
              isPopular={plan.name === "Growth"}
              onChoosePlan={() => handleSubscribe(plan)}
              loading={subscribingPlanId === plan.id}
              isActivePlan={activeSubscription?.plan.id === plan.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
