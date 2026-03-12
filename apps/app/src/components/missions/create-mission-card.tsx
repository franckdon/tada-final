"use client";

import * as React from "react";
import { AudiencesFilterProvider } from "@/context/audiences-filter-context";
import { useI18n } from "@/locales/client";
import { useAssistantForm } from "@assistant-ui/react-hook-form";
import { Form } from "@tada/ui/components/form";
import { CreateMissionForm } from "./forms/create-mission-form";
import { ProgressSidebar } from "./progress-bar";
import { AudiencesFilterModal } from "./modals/audiences-filter-modal";
import { useAudienceModalStore } from "@/stores/useAudienceModalStore";

function OpenAudienceToolEffect({ open }: { open: (value: boolean) => void }) {
  React.useEffect(() => {
    open(true);
  }, [open]);

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
        set_form_field: {
          execute: async ({
            name,
            value,
          }: {
            name: string;
            value: unknown;
          }) => {
            console.log("[set_form_field][execute] incoming:", { name, value });

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

            if (!allowed.has(name)) {
              console.log(
                "[set_form_field][execute] rejected: invalid field",
                name,
              );
              return { ok: false, reason: "invalid_field", name };
            }

            let normalizedValue: string | number | undefined;

            if (name === "targetSampleSize") {
              if (value === "" || value == null) {
                normalizedValue = undefined;
              } else {
                const parsed =
                  typeof value === "number"
                    ? value
                    : Number(String(value).trim());

                if (!Number.isFinite(parsed)) {
                  console.log(
                    "[set_form_field][execute] rejected: invalid number",
                    value,
                  );
                  return { ok: false, reason: "invalid_number", name, value };
                }

                normalizedValue = parsed;
              }
            } else {
              normalizedValue = String(value ?? "").trim();
            }

            form.setValue(name as any, normalizedValue, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            });

            console.log("[set_form_field][execute] applied:", {
              name,
              normalizedValue,
              currentValue: form.getValues(name as any),
            });

            return { ok: true, name, value: normalizedValue };
          },

          render: () => null,
        },

        open_audiences_modal: {
          execute: async () => {
            console.log("[open_audiences_modal][execute]");
            setIsAudiencesFilterModalOpen(true);
            return { opened: true };
          },

          render: () => (
            <OpenAudienceToolEffect open={setIsAudiencesFilterModalOpen} />
          ),
        },
      },
    },
  });

  React.useEffect(() => {
    const sub = form.watch((value, info) => {
      console.log("[form][watch subscription]", {
        changedField: info.name,
        type: info.type,
        value,
      });
    });

    return () => sub.unsubscribe();
  }, [form]);

  return (
    <Form {...form}>
      <AudiencesFilterProvider
        organizationId={organization.id}
        workspaceId={workspace.id}
        missionId={null}
      >
        <div className="flex h-full min-h-0 w-full">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-gray-200 bg-white">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <CreateMissionForm
                organization={organization}
                workspaceId={workspace.id}
                locale={locale}
                onOpenAudiencesModal={() => {
                  console.log("[ui] manual open audiences modal");
                  setIsAudiencesFilterModalOpen(true);
                }}
              />
            </div>
          </div>

          <div className="flex h-full min-h-0 w-60 flex-col overflow-y-auto border-l border-gray-200 bg-white">
            <ProgressSidebar />
          </div>
        </div>

        <AudiencesFilterModal
          isOpen={isAudiencesFilterModalOpen}
          onOpenChange={(open) => {
            console.log("[ui] audience modal changed:", open);
            setIsAudiencesFilterModalOpen(open);
          }}
          orgId={organization.id}
          missionId={undefined as any}
          currentUserId={undefined}
        />
      </AudiencesFilterProvider>
    </Form>
  );
}
