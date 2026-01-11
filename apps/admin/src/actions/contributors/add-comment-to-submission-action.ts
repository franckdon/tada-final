"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authActionClient } from "../safe-action";
import { addCommentToSubmission } from "./schema";
import { saveContributorDataAction } from "../contributor-data/save-contributor-data-action";

export const addCommentToSubmissionAction = authActionClient
  .schema(addCommentToSubmission)
  .metadata({
    name: "add-comment-to-submission-action",
  })
  .action(
    async ({
      parsedInput: { id, comment, action, missionId, surveyResponseId },
      ctx: { user },
    }) => {
      try {
        const existingComment = await prisma.validationComment.findFirst({
          where: {
            surveyResponseId,
          },
        });

        if (existingComment) {
          await prisma.validationComment.update({
            where: {
              id: existingComment.id,
            },
            data: {
              surveyResponseId,
              comment: comment ?? "",
              action,
              validatorId: user.id,
            },
          });
        } else {
          await prisma.validationComment.create({
            data: {
              surveyResponseId,
              comment: comment ?? "",
              action,
              validatorId: user.id,
            },
          });
        }

        const result = await prisma.surveyResponse.update({
          where: { id: surveyResponseId },
          data: {
            status: action,
          },
        });

        // Si le statut passe à "approved", déclencher l'enregistrement des données contributeur
        if (action === "approved") {
          try {
            const saveResult = await saveContributorDataAction({
              surveyResponseId,
            });
            if (saveResult?.data?.success) {
              console.log(
                `Données contributeur enregistrées pour la réponse ${surveyResponseId}: ${saveResult.data.message}`
              );
            } else {
              console.warn(
                `Erreur lors de l'enregistrement des données contributeur: ${
                  saveResult?.data?.message || "Erreur inconnue"
                }`
              );
            }
          } catch (error) {
            console.error(
              "Erreur lors de l'enregistrement automatique des données contributeur:",
              error
            );
            // Ne pas faire échouer l'approbation si l'enregistrement échoue
          }
        }

        revalidatePath(`/contributors/${id}/${missionId}`);
        return { success: true, data: result };
      } catch (error) {
        console.error("[ADD_COMMENT_TO_SUBMISSION]", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    }
  );
