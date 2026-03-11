"use server";

import { z } from "zod";
import { authActionClient } from "../safe-action";
import { prisma } from "@/lib/prisma";

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

function getPlanLabel(planCode: EffectivePlanCode) {
  if (!planCode) return "Aucun plan actif";
  if (planCode === "starter") return "Starter";
  if (planCode === "growth") return "Growth";
  if (planCode === "business") return "Business";
  if (planCode === "entreprise") return "Entreprise";
  return "Aucun plan actif";
}

export const getSubmissionValidationPreviewAction = authActionClient
  .schema(
    z.object({
      surveyResponseId: z.string().min(1),
    }),
  )
  .metadata({ name: "get-submission-validation-preview-action" })
  .action(async ({ parsedInput: { surveyResponseId } }) => {
    const sr = await prisma.surveyResponse.findUnique({
      where: { id: surveyResponseId },
      select: {
        id: true,
        survey: {
          select: {
            id: true,
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

    if (!sr) {
      throw new Error("Soumission introuvable");
    }

    const mission = sr.survey?.mission;
    if (!mission) {
      throw new Error("Mission introuvable pour cette soumission");
    }

    if (!mission.workspaceId || !mission.workspace) {
      throw new Error("Cette mission n'est liée à aucun workspace");
    }

    const now = new Date();

    const activePlan = await prisma.workspacePlanSubscription.findFirst({
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

    const normalizedPlanCode = normalizePlanCode(activePlan?.planCode ?? null);
    const requiredCredits = getWorkspaceValidationDebit(normalizedPlanCode);

    const creditAccount = await prisma.workspace_credit_account.findUnique({
      where: { workspace_id: mission.workspaceId },
      select: {
        id: true,
        balance: true,
        currency: true,
        overdraft_allowed: true,
        overdraft_limit: true,
      },
    });

    const currentBalance = creditAccount?.balance ?? 0;
    const hasEnoughCredits = currentBalance >= requiredCredits;
    const remainingAfterApproval = currentBalance - requiredCredits;

    return {
      surveyResponseId,
      mission: {
        id: mission.id,
        name: mission.name,
      },
      workspace: {
        id: mission.workspace.id,
        name: mission.workspace.name,
      },
      account: {
        id: creditAccount?.id ?? null,
        balance: currentBalance,
        currency: creditAccount?.currency ?? "credits",
      },
      pricing: {
        activePlanCode: normalizedPlanCode,
        activePlanLabel: getPlanLabel(normalizedPlanCode),
        requiredCredits,
      },
      result: {
        hasEnoughCredits,
        remainingAfterApproval,
      },
    };
  });