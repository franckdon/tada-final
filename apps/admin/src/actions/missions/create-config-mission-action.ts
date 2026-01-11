"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { createMissionConfigForContributorsSchema } from "./schema";
import { revalidatePath } from "next/cache";
import { generateMissionChartsAction } from "./generate-mission-charts-action";

export const createConfigMissionAction = authActionClient
  .schema(createMissionConfigForContributorsSchema)
  .metadata({
    name: "create-config-mission-action",
  })
  .action(async ({ parsedInput, ctx: { user, auth } }) => {
    try {
      // Supprimer l'ancienne config s'il y en a une
      await prisma.missionConfigContributor.deleteMany({
        where: { missionId: parsedInput.missionId as string },
      });

      const mission = await prisma.missionConfigContributor.create({
        data: parsedInput as any,
      });

      await prisma.mission.update({
        where: { id: parsedInput.missionId as string },
        data: {
          isPublish: true,
          status: "live",
          publishAt: new Date(),
        },
      });

      // Générer automatiquement les graphiques quand la mission passe en "live"
      try {
        const chartsResult = await generateMissionChartsAction({
          missionId: parsedInput.missionId as string,
        });

        if (chartsResult?.data?.success) {
          console.log(
            `Graphiques générés automatiquement: ${chartsResult.data?.data?.chartsGenerated} graphiques créés`
          );
        } else {
          console.error(
            "Erreur lors de la génération des graphiques:",
            chartsResult?.data?.error
          );
        }
      } catch (chartError) {
        console.error(
          "Erreur lors de la génération des graphiques:",
          chartError
        );
        // Ne pas faire échouer la création de config si les graphiques échouent
      }

      revalidatePath("/missions");
      return { success: true, data: mission };
    } catch (error) {
      console.error("[CREATE_MISSION_CONFIG_ERROR]", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  });
