"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface SubscribeToPlanResult {
  success: boolean;
  message: string;
}

export async function subscribeToPlan(
  planId: string,
  organizationId: string
): Promise<SubscribeToPlanResult> {
  try {
    // J'intégre ici la passerelle de paiement.

    // Vérifie si l'organisation a déjà un abonnement actif
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        organizationId: organizationId,
      },
    });

    if (existingSubscription) {
      // Nous pourrions gérer les mises à niveau/rétrogradations, ou empêcher plusieurs abonnements.
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planId: planId,
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(
            new Date().setMonth(new Date().getMonth() + 1)
          ),
          cancelAtPeriodEnd: false,
        },
      });
      revalidatePath("/market-beats");
      return { success: true, message: "Abonnement mis à jour avec succès !" };
    } else {
      await prisma.subscription.create({
        data: {
          organizationId: organizationId,
          planId: planId,
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(
            new Date().setMonth(new Date().getMonth() + 1)
          ),
          cancelAtPeriodEnd: false,
        },
      });
      revalidatePath("/market-beats");
      return { success: true, message: "Abonné avec succès !" };
    }
  } catch (error) {
    console.error("Error subscribing to plan:", error);
    return { success: false, message: "Échec de la souscription au plan." };
  }
}
