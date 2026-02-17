"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authActionClient } from "../safe-action";
import { addCommentToSubmission } from "./schema";
import { saveContributorDataAction } from "../contributor-data/save-contributor-data-action";

export const addCommentToSubmissionAction = authActionClient
  .schema(addCommentToSubmission)
  .metadata({ name: "add-comment-to-submission-action" })
  .action(async ({ parsedInput: { id, comment, action, missionId, surveyResponseId }, ctx: { user } }) => {
    try {
      const existingComment = await prisma.validationComment.findFirst({
        where: { survey_response_id: surveyResponseId },
        orderBy: { createdAt: "desc" },
      });

      if (existingComment) {
        await prisma.validationComment.update({
          where: { id: existingComment.id },
          data: {
            survey_response_id: surveyResponseId,
            comment: comment ?? "",
            action, // enum validation_action
            validator_id: user.id,
          },
        });
      } else {
        await prisma.validationComment.create({
          data: {
            survey_response_id: surveyResponseId,
            comment: comment ?? "",
            action,
            validator_id: user.id,
          },
        });
      }

      // ❌ on ne touche PAS survey_response.status pour la validation
      // await prisma.surveyResponse.update({ ... })  // <-- à enlever

      if (action === "approved") {
        try {
          await saveContributorDataAction({ surveyResponseId });
        } catch (e) {
          console.error("saveContributorDataAction error:", e);
        }
      }

      // revalidate les pages qui listent les soumissions
      revalidatePath(`/missions/${missionId}/submissions`);
      revalidatePath(`/contributors/${id}/${missionId}`);

      return { success: true };
    } catch (error) {
      console.error("[ADD_COMMENT_TO_SUBMISSION]", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  });
