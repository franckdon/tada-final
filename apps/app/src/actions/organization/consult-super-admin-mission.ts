"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ConsultSuperAdminMissionResult {
  success: boolean;
  message: string;
}

export async function consultSuperAdminMission(
  organizationId: string,
  missionId: string
): Promise<ConsultSuperAdminMissionResult> {
  try {
    // 1. Récupérer l'abonnement de l'organisation et sa limite maxMissions
    const organizationWithSubscription = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        Subscription: {
          include: {
            plan: true, // Inclure les détails du plan de souscription
          },
        },
        consultedSuperAdminMissions: {
          where: {
            isSuperAdminMission: true, // S'assurer de ne compter que les missions du super admin
          },
        },
      },
    });

    if (!organizationWithSubscription) {
      return { success: false, message: "Organisation non trouvée." };
    }

    const subscription = organizationWithSubscription.Subscription;
    if (!subscription || subscription.status !== "active") {
      return {
        success: false,
        message: "L'organisation n'a pas d'abonnement actif.",
      };
    }

    const maxMissions = subscription.plan.maxMissions;
    const currentConsultedMissionsCount =
      organizationWithSubscription.consultedSuperAdminMissions.length;

    // 2. Vérifier si la mission est déjà consultée
    const isAlreadyConsulted =
      organizationWithSubscription.consultedSuperAdminMissions.some(
        (m) => m.id === missionId
      );
    if (isAlreadyConsulted) {
      return {
        success: false,
        message: "Cette mission est déjà consultée par votre organisation.",
      };
    }

    // 3. Appliquer la limite maxMissions (uniquement pour les missions du super admin)
    if (maxMissions !== null && currentConsultedMissionsCount >= maxMissions) {
      return {
        success: false,
        message: `Vous avez atteint la limite de ${maxMissions} missions du super admin pour votre plan actuel.`,
      };
    }

    // 4. Lier la mission du super admin à l'organisation
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        consultedSuperAdminMissions: {
          connect: { id: missionId },
        },
      },
    });

    revalidatePath(`/dashboard/super-admin-missions`); // Revalider la page des missions du super admin
    revalidatePath(`/dashboard/my-missions`); // Revalider la page des missions de l'organisation si elle affiche un compteur global

    return {
      success: true,
      message: "Mission du super admin consultée avec succès !",
    };
  } catch (error) {
    console.error("Error consulting super admin mission:", error);
    return {
      success: false,
      message: "Échec de la consultation de la mission du super admin.",
    };
  }
}
