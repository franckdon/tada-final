import { prisma } from "@/lib/prisma";

export async function saveSubscriptionToDb({
  organizationId,
  planId,
  stripeSubscriptionId,
}: {
  organizationId: string;
  planId: string;
  stripeSubscriptionId: string;
}) {
  try {
    await prisma.subscription.upsert({
      where: { organizationId },
      update: {
        planId,
        stripeSubscriptionId,
        status: "active",
      },
      create: {
        organizationId,
        planId,
        stripeSubscriptionId,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
      },
    });

    console.log(`✅ Abonnement mis à jour pour org ${organizationId}`);
  } catch (err) {
    console.error("❌ Erreur d'enregistrement abonnement :", err);
    throw err;
  }
}
