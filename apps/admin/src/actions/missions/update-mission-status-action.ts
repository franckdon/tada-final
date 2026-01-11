"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { generateInsightsAction } from "./generate-insights-action";
import { generateExecutiveSummaryAction } from "./generate-executive-summary-action";

const updateMissionStatusSchema = z.object({
  missionId: z.string(),
  status: z.enum(["draft", "live", "completed", "archived", "paused"]),
});

export const updateMissionStatusAction = authActionClient
  .schema(updateMissionStatusSchema)
  .metadata({
    name: "update-mission-status-action",
  })
  .action(
    async ({ parsedInput: { missionId, status }, ctx: { user, auth } }) => {
      try {
        // 1. Vérifier que la mission existe
        const existingMission = await prisma.mission.findUnique({
          where: { id: missionId },
          select: { id: true, status: true, name: true },
        });

        if (!existingMission) {
          throw new Error("Mission non trouvée");
        }

        const wasCompleted = existingMission.status === "completed";
        const isNowCompleted = status === "completed";

        // 2. Mettre à jour le statut de la mission
        const updatedMission = await prisma.mission.update({
          where: { id: missionId },
          data: {
            status: status,
            updatedAt: new Date(),
            // Si la mission passe à completed pour la première fois
            ...(isNowCompleted &&
              !wasCompleted && {
                publishAt: new Date(),
              }),
          },
        });

        // 3. Si le statut passe à "completed" (première fois ou mise à jour), générer/mettre à jour les insights et le résumé exécutif
        if (isNowCompleted) {
          try {
            console.log(
              `Mission ${existingMission.name} en "completed" - ${
                wasCompleted ? "Mise à jour" : "Génération"
              } des insights et du résumé exécutif...`
            );

            // Générer les insights pour chaque graphique
            const insightsResult = await generateInsightsAction({ missionId });

            if (insightsResult?.data?.success) {
              console.log(
                `Insights ${wasCompleted ? "mis à jour" : "générés"}: ${
                  insightsResult.data?.data?.insightsGenerated
                } insights pour ${
                  insightsResult.data?.data?.chartsProcessed
                } graphiques`
              );
            } else {
              console.error(
                "Erreur lors de la génération/mise à jour des insights:",
                insightsResult?.data?.error
              );
            }

            // Générer le résumé exécutif de la mission
            const executiveSummaryResult = await generateExecutiveSummaryAction(
              {
                missionId,
              }
            );

            if (executiveSummaryResult?.data?.success) {
              console.log(
                `Résumé exécutif ${
                  executiveSummaryResult.data?.data?.isUpdate
                    ? "mis à jour"
                    : "généré"
                } pour la mission: ${existingMission.name}`
              );
            } else {
              console.error(
                "Erreur lors de la génération du résumé exécutif:",
                executiveSummaryResult?.data?.error
              );
            }
          } catch (error) {
            console.error(
              "Erreur lors de la génération des insights/résumé:",
              error
            );
            // Ne pas faire échouer la mise à jour du statut si la génération échoue
          }
        }

        revalidatePath("/missions");

        return {
          success: true,
          data: {
            mission: updatedMission,
            statusChanged: existingMission.status !== status,
            insightsTriggered: isNowCompleted,
            isUpdate: wasCompleted && isNowCompleted,
          },
        };
      } catch (error) {
        console.error("[UPDATE_MISSION_STATUS_ERROR]", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    }
  );
