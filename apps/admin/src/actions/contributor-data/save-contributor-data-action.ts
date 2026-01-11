import { authActionClient } from "@/actions/safe-action";
import { extractContributorData } from "@/lib/contributor-data-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const saveContributorDataSchema = z.object({
  surveyResponseId: z.string().uuid(),
});

export const saveContributorDataAction = authActionClient
  .schema(saveContributorDataSchema)
  .metadata({
    name: "save-contributor-data",
  })
  .action(async ({ parsedInput: { surveyResponseId }, ctx: { user } }) => {
    try {
      // 1. Récupérer la réponse avec toutes les infos nécessaires
      const surveyResponse = await prisma.surveyResponse.findUnique({
        where: { id: surveyResponseId },
        include: {
          survey: {
            include: {
              mission: true,
            },
          },
          user: true,
        },
      });

      if (!surveyResponse) {
        throw new Error("SurveyResponse non trouvée");
      }

      if (!surveyResponse.user) {
        throw new Error("Utilisateur non trouvé pour cette réponse");
      }

      const mission = surveyResponse.survey?.mission;
      if (!mission) {
        throw new Error("Mission non trouvée");
      }

      // 2. Vérifier que la mission est de type "contributor" ou "contributor-info"
      if (mission.type !== "contributor" && mission.type !== "contributor-info") {
        // Ne rien faire si ce n'est pas une mission contributor
        return { success: true, message: "Mission non-contributor, aucune action nécessaire" };
      }

      // 3. Parser les réponses
      const responses = typeof surveyResponse.responses === 'string' 
        ? JSON.parse(surveyResponse.responses) 
        : surveyResponse.responses;

      // 4. Extraire et formater les données
      const contributorDataItems = extractContributorData(responses);

      if (contributorDataItems.length === 0) {
        return { success: true, message: "Aucune donnée à enregistrer" };
      }

      // 5. Enregistrer les données dans la table contributor_data
      // Utiliser upsert pour éviter les doublons
      const savePromises = contributorDataItems.map((item) =>
        prisma.contributorData.upsert({
          where: {
            missionId_userId_key: {
              missionId: mission.id,
              userId: surveyResponse.user!.id,
              key: item.key,
            },
          },
          update: {
            value: item.value,
            questionType: item.questionType,
            originalQuestion: item.originalQuestion,
            updatedAt: new Date(),
          },
          create: {
            key: item.key,
            value: item.value,
            missionId: mission.id,
            userId: surveyResponse.user!.id,
            questionType: item.questionType,
            originalQuestion: item.originalQuestion,
          },
        })
      );

      await Promise.all(savePromises);

      return {
        success: true,
        message: `${contributorDataItems.length} données contributeur enregistrées`,
        savedCount: contributorDataItems.length,
      };
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des données contributeur:", error);
      throw new Error("Impossible d'enregistrer les données contributeur");
    }
  });