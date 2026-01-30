// src/actions/missions/create-config-mission-action.ts
"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { createMissionConfigForContributorsSchema } from "./schema";
import { revalidatePath } from "next/cache";
import { generateMissionChartsAction } from "./generate-mission-charts-action";

/**
 * Option 4 (aligné apps/app) :
 * - l'image est uploadée AVANT via /api/uploads/storage (service role)
 * - on stocke en DB un PATH Supabase (ex: "mission-thumbnails/xxx.png")
 * - ici on ne gère plus les dataURL / écriture disque
 */
export const createConfigMissionAction = authActionClient
  .schema(createMissionConfigForContributorsSchema)
  .metadata({ name: "create-config-mission-action" })
  .action(async ({ parsedInput }) => {
    try {
      const missionId = parsedInput.missionId as string;

      // 1) Supprimer l'ancienne config (si existante)
      await prisma.missionConfigContributor.deleteMany({
        where: { missionId },
      });

      // 2) Créer la nouvelle config
      //    imageUrl doit être un PATH supabase (ou null)
      const missionConfig = await prisma.missionConfigContributor.create({
        data: parsedInput as any,
      });

      // 3) Publier la mission
      await prisma.mission.update({
        where: { id: missionId },
        data: {
          isPublish: true,
          status: "live",
          publishAt: new Date(),
        },
      });

      // 4) Générer automatiquement les graphiques quand la mission passe en "live"
      try {
        const chartsResult = await generateMissionChartsAction({ missionId });

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
        console.error("Erreur lors de la génération des graphiques:", chartError);
        // Ne pas faire échouer la création de config si les graphiques échouent
      }

      revalidatePath("/missions");
      return { success: true, data: missionConfig };
    } catch (error) {
      console.error("[CREATE_MISSION_CONFIG_ERROR]", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  });
