// src/components/missions/update-mission-card.tsx
"use client";

import { AudiencesFilterProvider } from "@/context/audiences-filter-context";
import { useI18n } from "@/locales/client";
import { useAssistantInstructions } from "@assistant-ui/react";
import { useAssistantForm } from "@assistant-ui/react-hook-form";
import { Form } from "@tada/ui/components/form";
import { useRef } from "react";
import { UpdateMissionForm } from "./forms/update-mission-form";
import type { Mission, TempMission } from "@prisma/client";

type WorkspaceCtx = { id: string; organizationStatus: string | null };
type OrganizationCtx = { id: string; status: string | null };

export function UpdateMissionCard({
  locale,
  organization,
  workspace,
  mission,
  originalMissionId,
  canEdit,
}: {
  locale: string;
  organization: OrganizationCtx;
  workspace: WorkspaceCtx;
  mission: Mission | TempMission;
  originalMissionId: string;
  canEdit: boolean;
}) {
  const t = useI18n();

  const chatLang = locale === "fr" ? "French" : "English";
  const confirmQuestion =
    locale === "fr"
      ? "Confirmes-tu que c’est correct pour que je remplisse le formulaire ?"
      : "Can you confirm this is correct so I can fill in the form?";

  useAssistantInstructions(`
You are Dina, a Marketing Research Copilot.

ABSOLUTE RULES (must follow):
- You MUST start by asking questions. Do NOT provide a full mission brief in your first messages.
- Until you have enough information, you may ONLY do:
  (1) ask 1–3 short questions, and
  (2) acknowledge what the user said in 1–2 sentences.
- Never write sections titled "Contexte / Problématique / Objectifs / Hypothèses" before the user provides details.
- Do NOT invent objectives/hypotheses. If missing, ask.
- Keep each assistant message under 120 words while collecting info.

STRICT: If you believe you already have enough information, you MUST still ask for explicit confirmation from the user.
Do not proceed without that confirmation.
Your message asking confirmation MUST end with [[READY_TO_FILL_FORM]].

Language:
- You MUST respond in ${chatLang} only.
- Do NOT switch language mid-conversation.

Information to collect (in this order):
1) Business context (product/service + market)
2) Business problem (symptoms + what changed + when)
3) Objectives (what decisions will be taken with results)
4) Hypotheses (3–5 testable assumptions)
5) Mission name (short title)

When (and only when) you have ALL info above:
- Provide a compact recap (5–8 bullets max)
- Ask: "${confirmQuestion}"
- End that message with exactly: [[READY_TO_FILL_FORM]]
`);

  const hasRenderedField = useRef(false);

  const form = useAssistantForm({
    defaultValues: {
      name: (mission as any)?.name || "",
      problemSummary: (mission as any)?.problemSummary || "",
      objectives: (mission as any)?.objectives || "",
      assumptions: (mission as any)?.assumptions || "",
      audiences: (mission as any)?.audiences || "",
      targetSampleSize: (mission as any)?.targetSampleSize ?? undefined,
      sampleSummary: (mission as any)?.sampleSummary || "",
      preliminaryRecommendations:
        (mission as any)?.preliminaryRecommendations || "",
      studyStructure: (mission as any)?.studyStructure || "",
    },
    assistant: {
      tools: {
        set_form_field: {
          render: () => {
            if (hasRenderedField.current === true) return null;
            hasRenderedField.current = true;
            return (
              <p className="text-center font-mono text-sm font-bold text-blue-500">
                {t("missions.createMission.filedFilled")}
              </p>
            );
          },
        },
      },
    },
  });

  return (
    <Form {...form}>
      <AudiencesFilterProvider
        organizationId={organization.id}
        workspaceId={workspace.id}
        missionId={originalMissionId}
        audiences={(mission as any)?.audiences}
      >
        <div className="flex h-full min-h-0 w-full">
          <div className="flex-1 min-h-0 overflow-y-auto bg-white">
            <UpdateMissionForm
              locale={locale}
              workspace={workspace}
              canEdit={canEdit}
              inComingMission={mission}
              originalMissionId={originalMissionId}
              orgId={organization.id}
              currentUserId={null}
            />
          </div>
        </div>
      </AudiencesFilterProvider>
    </Form>
  );
}
