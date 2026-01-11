import PricingSection from "@/components/pricing/pricing-section";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export default async function Page({ params }: { params: any }) {
  const pricingPlans = await prisma.subscriptionPlan.findMany({
    where: {
      isActive: true,
    },
  });

  const exstingOrgSubscription = await prisma.subscription.findUnique({
    where: {
      organizationId: params.orgId!,
    },
    include: {
      plan: true,
    },
  });

  const serializablePricingPlans = pricingPlans.map((plan) => ({
    ...plan,
    features: plan.features ? JSON.parse(JSON.stringify(plan.features)) : [],
    price: plan.price.toString(),
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  }));

  const customOrderedPlans = [
    serializablePricingPlans.find((plan) => plan.name === "Starter"),
    serializablePricingPlans.find((plan) => plan.name === "Growth"),
    serializablePricingPlans.find((plan) => plan.name === "Business"),
    serializablePricingPlans.find((plan) => plan.name === "Enterprise"),
  ].filter(Boolean);

  return (
    <main>
      <PricingSection
        initialPlans={customOrderedPlans}
        activeSubscription={exstingOrgSubscription}
      />
    </main>
  );
}
