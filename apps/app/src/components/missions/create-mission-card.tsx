"use client";

import {
  AudiencesFilterProvider,
  useAudiencesFilter,
} from "@/context/audiences-filter-context";
import { useI18n } from "@/locales/client";
import { useAssistantInstructions } from "@assistant-ui/react";
import { useAssistantForm } from "@assistant-ui/react-hook-form";
import { Form } from "@tada/ui/components/form";
import { CreateMissionForm } from "./forms/create-mission-form";
import { ProgressSidebar } from "./progress-bar";
import { useEffect, useState } from "react";
import { AudiencesFilterModal } from "./modals/audiences-filter-modal";
import { useAudienceModalStore } from "@/stores/useAudienceModalStore";

function AssistantRules({
  locale,
  confirmQuestion,
}: {
  locale: string;
  confirmQuestion: string;
}) {
  const { activeFiltersCount, suggestions } = useAudiencesFilter();
  const audiencesSelectedCount =
    (activeFiltersCount ?? 0) + (suggestions?.length ?? 0);

  const chatLang = locale === "fr" ? "French" : "English";

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
5) Ask user to click the button to choose audiences
6) Target sample size (how many people to survey)
7) Mission name (short title)

Audience selection:
- Current selected audience count: ${audiencesSelectedCount}
- You MUST ask the user to choose an audience by clicking on the modal audience.
- Do NOT ask for sample size until audience count is >= 1.

Rules for form filling:
- When the user provides the target sample size, you MUST call the tool set_form_field with:
  field="targetSampleSize" and value=<number>
- For the audience step, you MUST call the tool open_audiences_modal to display a "Click here" button.

Form filling behavior (incremental):
- As soon as the user provides a clear answer for a field, you MUST call the tool set_form_field.
- Fields mapping:
  - Business context + problem => problemSummary
  - Objectives => objectives
  - Hypotheses => assumptions
  - Mission name => name
  - Target sample size => targetSampleSize (number)
- If the user is uncertain, ask 1–2 clarifying questions BEFORE setting the field.
- You may revise a field later if the user corrects it (call set_form_field again).
`);

  return null;
}

export function CreateMissionCard({
  organization,
  workspace,
  locale,
}: {
  organization: { status: string | null; id: string };
  workspace: { id: string };
  locale: string;
}) {
  const t = useI18n();

  const isAudiencesFilterModalOpen = useAudienceModalStore((s) => s.open);
  const setIsAudiencesFilterModalOpen = useAudienceModalStore((s) => s.setOpen);

  const confirmQuestion =
    locale === "fr"
      ? "Confirmes-tu que c’est correct pour que je remplisse le formulaire ?"
      : "Can you confirm this is correct so I can fill in the form?";

  const form = useAssistantForm({
    defaultValues: {
      name: "",
      problemSummary: "",
      objectives: "",
      assumptions: "",
      audiences: "",
      targetSampleSize: undefined,
      sampleSummary: "",
      preliminaryRecommendations: "",
      studyStructure: "",
    },
    assistant: {
      tools: {
        show_filled_notice: {
          render: () => (
            <p className="text-center font-mono text-sm font-bold text-blue-500">
              {t("missions.createMission.filedFilled")}
            </p>
          ),
        },
        open_audiences_modal: {
          render: () => (
            <div className="pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  console.log("[open_audiences_modal] click");
                  setIsAudiencesFilterModalOpen(true);
                }}
                className="pointer-events-auto underline text-blue-600 hover:text-blue-700 font-medium"
              >
                {locale === "fr"
                  ? "Sélectionner votre audience"
                  : "Select your audience"}
              </button>
            </div>
          ),
        },
        set_form_field: {
          description: "Set a form field value",
          parameters: {
            type: "object",
            properties: {
              field: { type: "string" },
              value: {},
            },
            required: ["field", "value"],
          },
          execute: async ({ field, value }: { field: string; value: any }) => {
            const allowed = new Set([
              "name",
              "problemSummary",
              "objectives",
              "assumptions",
              "targetSampleSize",
              "sampleSummary",
              "preliminaryRecommendations",
              "studyStructure",
            ]);
            if (!allowed.has(field)) return;

            const normalized =
              field === "targetSampleSize"
                ? value === "" || value == null
                  ? undefined
                  : Number(value)
                : String(value ?? "");

            form.setValue(field as any, normalized, { shouldDirty: true });
          },
          render: ({ field, value }: any) => (
            <p className="text-xs text-gray-500">
              Field updated: <b>{field}</b>
            </p>
          ),
        },
      },
    },
  });

  return (
    <Form {...form}>
      <AudiencesFilterProvider
        organizationId={organization.id}
        workspaceId={workspace.id}
        missionId={null}
      >
        <AssistantRules locale={locale} confirmQuestion={confirmQuestion} />

        <div className="flex h-full min-h-0 w-full">
          {/* Colonne formulaire */}
          <div className="flex flex-col border-r border-gray-200 bg-white flex-1 min-w-0 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <CreateMissionForm
                organization={organization}
                workspaceId={workspace.id}
                locale={locale}
                onOpenAudiencesModal={() => setIsAudiencesFilterModalOpen(true)}
              />
            </div>
          </div>

          {/* Sidebar à droite */}
          <div className="w-60 flex flex-col h-full min-h-0 border-l border-gray-200 bg-white overflow-y-auto">
            <ProgressSidebar />
          </div>
        </div>

        <AudiencesFilterModal
          isOpen={isAudiencesFilterModalOpen}
          onOpenChange={setIsAudiencesFilterModalOpen}
          orgId={organization.id}
          missionId={undefined as any}
          currentUserId={undefined}
        />
      </AudiencesFilterProvider>
    </Form>
  );
}
