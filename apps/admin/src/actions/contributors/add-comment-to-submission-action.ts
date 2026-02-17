"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authActionClient } from "../safe-action";
import { addCommentToSubmission } from "./schema";
import { saveContributorDataAction } from "../contributor-data/save-contributor-data-action";

const WALLET_PROVIDER_ID = "mobile";

export const addCommentToSubmissionAction = authActionClient
  .schema(addCommentToSubmission)
  .metadata({ name: "add-comment-to-submission-action" })
  .action(
    async ({
      parsedInput: { id, comment, action, missionId, surveyResponseId },
      ctx: { user },
    }) => {
      try {
        const txResult = await prisma.$transaction(async (tx) => {
          // 1) Upsert last validation comment
          const existingComment = await tx.validationComment.findFirst({
            where: { survey_response_id: surveyResponseId },
            orderBy: { createdAt: "desc" },
            select: { id: true },
          });

          if (existingComment) {
            await tx.validationComment.update({
              where: { id: existingComment.id },
              data: {
                survey_response_id: surveyResponseId,
                comment: comment ?? "",
                action,
                validator_id: user.id,
              },
            });
          } else {
            await tx.validationComment.create({
              data: {
                survey_response_id: surveyResponseId,
                comment: comment ?? "",
                action,
                validator_id: user.id,
              },
            });
          }

          // 2) CREDIT ONLY IF approved
          if (action !== "approved") return { credited: false as const };

          // 2.1) fetch surveyResponse context
          const sr = await tx.surveyResponse.findUnique({
            where: { id: surveyResponseId },
            select: {
              id: true,
              userId: true,
              survey: { select: { missionId: true } },
            },
          });

          console.log("[REWARD] sr", {
            surveyResponseId,
            srUserId: sr?.userId,
            srMissionIdFromSurvey: sr?.survey?.missionId,
            missionIdInput: missionId,
            action,
          });

          if (!sr) throw new Error("SurveyResponse introuvable");
          if (!sr.userId) throw new Error("Impossible de créditer: userId null");

          const effectiveMissionId = sr.survey.missionId ?? missionId;
          if (!effectiveMissionId)
            throw new Error("Impossible de créditer: missionId introuvable");

          // 2.2) read mission gain
          const config = await tx.missionConfigContributor.findUnique({
            where: { missionId: effectiveMissionId }, // @@unique([missionId])
            select: { gain: true, title: true },
          });

          console.log("[REWARD] config", {
            effectiveMissionId,
            gain: config?.gain?.toString?.() ?? String(config?.gain),
            title: config?.title,
          });

          if (!config) {
            throw new Error(
              "MissionConfigContributor introuvable: gain non défini pour cette mission",
            );
          }

          const gain = config.gain; // BigInt

          // 2.3) get contributor wallet account (or create one)
          // ⚠️ Tu peux aussi décider de refuser si pas de wallet.
          let acct = await tx.account.findUnique({
            where: {
              userId_providerId: { userId: sr.userId, providerId: WALLET_PROVIDER_ID },
            },
            select: { id: true, balance: true, currency: true, accountId: true, providerId: true },
          });

          if (!acct) {
            acct = await tx.account.create({
              data: {
                userId: sr.userId,
                providerId: WALLET_PROVIDER_ID,
                accountId: sr.userId, // ou autre identifiant stable
                createdAt: new Date(),
                updatedAt: new Date(),
                balance: 0n,
                currency: "XOF",
              },
              select: { id: true, balance: true, currency: true, accountId: true, providerId: true },
            });
          }

          // 2.4) Idempotence métier: MissionReward unique(surveyResponseId)
          // -> si déjà existant => on ne recrédite pas
          const existingReward = await tx.missionReward.findUnique({
            where: { surveyResponseId },
            select: { id: true },
          });

          if (existingReward) {
            return { credited: false as const, reason: "already_rewarded" as const };
          }

          // 2.5) Insert reward record (locks the "one credit per submission")
          await tx.missionReward.create({
            data: {
              userId: sr.userId,
              missionId: effectiveMissionId,
              surveyResponseId,
              amount: gain,
            },
          });

          // 2.6) Ledger transaction idempotent (unique idempotencyKey)
          const idempotencyKey = `mission:${effectiveMissionId}:sr:${surveyResponseId}:approved`;

          const balanceAfter = acct.balance + gain;

          await tx.account_balance_transaction.create({
            data: {
              accountPkId: acct.id,
              amount: gain,
              currency: acct.currency ?? "XOF",
              type: "credit",
              description: `Gain mission: ${config.title ?? effectiveMissionId}`,
              referenceType: "survey_response",
              referenceId: surveyResponseId,
              idempotencyKey,
              balanceAfter,
            },
          });

          // 2.7) Update balance
          await tx.account.update({
            where: { id: acct.id },
            data: { balance: { increment: gain } },
          });

          return { credited: true as const };
        });

        // 3) Secondary side-effect (OK outside tx)
        if (action === "approved") {
          try {
            await saveContributorDataAction({ surveyResponseId });
          } catch (e) {
            console.error("saveContributorDataAction error:", e);
          }
        }

        revalidatePath(`/missions/${missionId}/submissions`);
        revalidatePath(`/contributors/${id}/${missionId}`);

        return { success: true, ...txResult };
      } catch (error) {
        console.error("[ADD_COMMENT_TO_SUBMISSION]", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    },
  );
