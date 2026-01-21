import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PricingOverview } from "@/components/pricing/overview/pricing-overview";

export const metadata = { title: "Pricing | Tada" };

export default async function PricingPage() {
  const plans = await prisma.plan.findMany({
    orderBy: [{ sortOrder: "asc" }],
    select: {
      id: true,
      tier: true,
      name: true,
      priceType: true,
      sortOrder: true,
      prices: {
        select: {
          currency: true,
          interval: true,
          amountCents: true,
          isCustom: true,
        },
      },
      translations: {
        select: { locale: true, name: true, tagline: true },
      },
    },
  });

  const categories = await prisma.featureCategory.findMany({
    orderBy: [{ sortOrder: "asc" }],
    select: {
      id: true,
      key: true,
      name: true,
      sortOrder: true,
      features: {
        orderBy: [{ sortOrder: "asc" }],
        select: {
          id: true,
          key: true,
          label: true,
          description: true,
          valueType: true,
          unit: true,
          sortOrder: true,
          categoryId: true,
        },
      },
    },
  });

  // features sans catégorie (optionnel)
  const uncategorizedFeatures = await prisma.feature.findMany({
    where: { categoryId: null },
    orderBy: [{ sortOrder: "asc" }],
    select: {
      id: true,
      key: true,
      label: true,
      description: true,
      valueType: true,
      unit: true,
      sortOrder: true,
      categoryId: true,
    },
  });

  const planFeatureValues = await prisma.planFeature.findMany({
    select: {
      planId: true,
      featureId: true,
      booleanValue: true,
      numberValue: true,
      textValue: true,
      isUnlimited: true,
      isCustom: true,
      highlight: true,
    },
  });

  const addOns = await prisma.addOn.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      key: true,
      name: true,
      description: true,
      valueType: true,
      unit: true,
    },
  });

  const planAddOnValues = await prisma.planAddOn.findMany({
    select: {
      planId: true,
      addOnId: true,
      isEnabled: true,
      booleanValue: true,
      numberValue: true,
      textValue: true,
      isUnlimited: true,
      isCustom: true,
      highlight: true,
    },
  });

  // sérialisation dates (si jamais) + payload minimal
  return (
    <div className="min-h-screen p-3 bg-white">
      <PricingOverview
        plans={plans as any}
        categories={categories as any}
        uncategorizedFeatures={uncategorizedFeatures as any}
        planFeatureValues={planFeatureValues as any}
        addOns={addOns as any}
        planAddOnValues={planAddOnValues as any}
      />
    </div>
  );
}
