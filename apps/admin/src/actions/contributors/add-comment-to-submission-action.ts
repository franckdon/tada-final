"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authActionClient } from "../safe-action";
import { addCommentToSubmission } from "./schema";
import { saveContributorDataAction } from "../contributor-data/save-contributor-data-action";

const WALLET_PROVIDER_ID = "mobile_credentials";

type EffectivePlanCode =
  | "starter"
  | "growth"
  | "business"
  | "entreprise"
  | null;

function normalizePlanCode(planCode?: string | null): EffectivePlanCode {
  if (
    planCode === "starter" ||
    planCode === "growth" ||
    planCode === "business" ||
    planCode === "entreprise"
  ) {
    return planCode;
  }
  return null;
}

function getWorkspaceValidationDebit(planCode: EffectivePlanCode): number {
  if (!planCode) return 10;
  if (planCode === "starter") return 7;
  if (planCode === "growth") return 6;
  if (planCode === "business") return 5;
  if (planCode === "entreprise") return 4;
  return 10;
}

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
          // --------------------------------------------------
          // 1) Fetch context once
          // --------------------------------------------------
          const sr = await tx.surveyResponse.findUnique({
            where: { id: surveyResponseId },
            select: {
              id: true,
              userId: true,
              survey: {
                select: {
                  missionId: true,
                  mission: {
                    select: {
                      id: true,
                      name: true,
                      workspaceId: true,
                      workspace: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });

          if (!sr) throw new Error("SurveyResponse introuvable");
          if (!sr.userId) throw new Error("Impossible de créditer: userId null");

          const effectiveMissionId = sr.survey.missionId ?? missionId;
          if (!effectiveMissionId) {
            throw new Error("Impossible de traiter: missionId introuvable");
          }

          const mission = sr.survey.mission;
          if (!mission) {
            throw new Error("Mission introuvable pour cette soumission");
          }

          // --------------------------------------------------
          // 2) If approved => debit workspace credits first
          // --------------------------------------------------
          let workspaceChargeResult: {
            debited: boolean;
            alreadyDebited: boolean;
            requiredCredits: number;
            activePlanCode: EffectivePlanCode;
            workspaceBalanceBefore: number;
            workspaceBalanceAfter: number;
            workspaceId: string | null;
            workspaceName: string | null;
          } = {
            debited: false,
            alreadyDebited: false,
            requiredCredits: 0,
            activePlanCode: null,
            workspaceBalanceBefore: 0,
            workspaceBalanceAfter: 0,
            workspaceId: mission.workspaceId ?? null,
            workspaceName: mission.workspace?.name ?? null,
          };

          if (action === "approved") {
            if (!mission.workspaceId || !mission.workspace) {
              throw new Error(
                "Impossible d'approuver: cette mission n'est liée à aucun workspace",
              );
            }

            const now = new Date();

            // ✅ Ceci est le plan COMMERCIAL
            const activePlan = await tx.workspacePlanSubscription.findFirst({
              where: {
                workspaceId: mission.workspaceId,
                status: "active",
                startsAt: { lte: now },
                OR: [{ endsAt: null }, { endsAt: { gte: now } }],
              },
              orderBy: { startsAt: "desc" },
              select: {
                id: true,
                planCode: true,
                status: true,
                startsAt: true,
                endsAt: true,
              },
            });

            const normalizedPlanCode = normalizePlanCode(
              activePlan?.planCode ?? null,
            );
            const requiredCredits =
              getWorkspaceValidationDebit(normalizedPlanCode);

            const creditAccount = await tx.workspace_credit_account.findUnique({
              where: { workspace_id: mission.workspaceId },
              select: {
                id: true,
                balance: true,
                currency: true,
              },
            });

            if (!creditAccount) {
              throw new Error(
                "Crédit du workspace insuffisant: aucun compte de crédits trouvé pour ce workspace",
              );
            }

            const existingWorkspaceDebit =
              await tx.workspace_credit_transaction.findFirst({
                where: {
                  credit_account_id: creditAccount.id,
                  reference_id: surveyResponseId,
                  reason: "submission_validation",
                  direction: "debit",
                },
                select: {
                  id: true,
                  balance_after: true,
                  amount: true,
                },
              });

            if (existingWorkspaceDebit) {
              workspaceChargeResult = {
                debited: false,
                alreadyDebited: true,
                requiredCredits,
                activePlanCode: normalizedPlanCode,
                workspaceBalanceBefore: creditAccount.balance,
                workspaceBalanceAfter:
                  existingWorkspaceDebit.balance_after ?? creditAccount.balance,
                workspaceId: mission.workspace.id,
                workspaceName: mission.workspace.name,
              };
            } else {
              if (creditAccount.balance < requiredCredits) {
                throw new Error(
                  `Crédit du workspace insuffisant: ${creditAccount.balance} disponible(s), ${requiredCredits} requis`,
                );
              }

              const balanceAfter = creditAccount.balance - requiredCredits;

              await tx.workspace_credit_transaction.create({
                data: {
                  credit_account_id: creditAccount.id,

                  // ✅ IMPORTANT:
                  // Ne pas mettre activePlan.id ici.
                  // subscription_id attend un ID de workspace_credit_subscription,
                  // pas un ID de WorkspacePlanSubscription.
                  subscription_id: null,

                  direction: "debit",
                  amount: requiredCredits,
                  reason: "submission_validation",
                  reference_id: surveyResponseId,
                  description: `Validation de soumission - mission ${mission.name}`,
                  balance_after: balanceAfter,
                  actor_user_id: user.id,
                  metadata: {
                    surveyResponseId,
                    missionId: effectiveMissionId,
                    workspaceId: mission.workspace.id,
                    workspaceName: mission.workspace.name,
                    planCode: normalizedPlanCode,
                    workspacePlanSubscriptionId: activePlan?.id ?? null,
                  },
                },
              });

              await tx.workspace_credit_account.update({
                where: { id: creditAccount.id },
                data: {
                  balance: {
                    decrement: requiredCredits,
                  },
                },
              });

              workspaceChargeResult = {
                debited: true,
                alreadyDebited: false,
                requiredCredits,
                activePlanCode: normalizedPlanCode,
                workspaceBalanceBefore: creditAccount.balance,
                workspaceBalanceAfter: balanceAfter,
                workspaceId: mission.workspace.id,
                workspaceName: mission.workspace.name,
              };
            }
          }

          // --------------------------------------------------
          // 3) Upsert validation comment
          // --------------------------------------------------
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

          // --------------------------------------------------
          // 4) Contributor reward only if approved
          // --------------------------------------------------
          if (action !== "approved") {
            return {
              credited: false as const,
              workspaceCharge: workspaceChargeResult,
            };
          }

          const config = await tx.missionConfigContributor.findUnique({
            where: { missionId: effectiveMissionId },
            select: { gain: true, title: true },
          });

          if (!config) {
            throw new Error(
              "MissionConfigContributor introuvable: gain non défini pour cette mission",
            );
          }

          const gain = config.gain;

          let acct = await tx.account.findUnique({
            where: {
              userId_providerId: {
                userId: sr.userId,
                providerId: WALLET_PROVIDER_ID,
              },
            },
            select: {
              id: true,
              balance: true,
              currency: true,
              accountId: true,
              providerId: true,
            },
          });

          if (!acct) {
            acct = await tx.account.create({
              data: {
                userId: sr.userId,
                providerId: WALLET_PROVIDER_ID,
                accountId: sr.userId,
                createdAt: new Date(),
                updatedAt: new Date(),
                balance: 0n,
                currency: "XOF",
              },
              select: {
                id: true,
                balance: true,
                currency: true,
                accountId: true,
                providerId: true,
              },
            });
          }

          const existingReward = await tx.missionReward.findUnique({
            where: { surveyResponseId },
            select: { id: true },
          });

          if (existingReward) {
            return {
              credited: false as const,
              reason: "already_rewarded" as const,
              workspaceCharge: workspaceChargeResult,
            };
          }

          await tx.missionReward.create({
            data: {
              userId: sr.userId,
              missionId: effectiveMissionId,
              surveyResponseId,
              amount: gain,
            },
          });

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

          await tx.account.update({
            where: { id: acct.id },
            data: { balance: { increment: gain } },
          });

          return {
            credited: true as const,
            workspaceCharge: workspaceChargeResult,
          };
        });

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
          error:
            error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    },
  );