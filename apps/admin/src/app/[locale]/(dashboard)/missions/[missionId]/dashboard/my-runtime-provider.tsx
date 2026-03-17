"use client";

import { generateExecutiveSummaryAction } from "@/actions/missions/generate-executive-summary-action";
import { MarkdownPreviewCard } from "@/components/missions/boards/graphs/markdown-preview";
import { ParticipantInfo } from "@/components/missions/boards/graphs/participant-info";
import {
  extractSexAndAge,
  getAverageAge,
  groupParticipantsByAge,
  SurveyData,
} from "@/lib/utils";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { useChat } from "@ai-sdk/react";
import { useAction } from "next-safe-action/hooks";
import React, { useEffect, useMemo, useRef, useState } from "react";

type MissionLite = {
  id: string;
  status: string;
  executiveSummary: string | null;
};

const EMPTY_RESPONSES: SurveyData = {
  survey_title: "",
  questions_responses: {},
  metadata: {
    total_responses: 0,
    collection_period: "",
    locations_covered: [],
    age_range: "",
    gender_distribution: { male: 0, female: 0 },
    response_rate: "",
  },
};

export function MyRuntimeProvider({
  children,
  responses,
  mission,
}: Readonly<{
  children: React.ReactNode;
  responses: SurveyData | null;
  mission: MissionLite;
}>) {
  const [executiveSummary, setExecutiveSummary] = useState<string>(
    mission?.executiveSummary ?? "",
  );

  const safeResponses = responses ?? EMPTY_RESPONSES;

  const chat = useChat({
    api: "/api/chat",
    initialMessages: [],
  });

  const runtime = useAISDKRuntime(chat);

  const generateExecutiveSummary = useAction(generateExecutiveSummaryAction, {
    onSuccess: (result) => {
      const generatedSummary =
        result?.data?.data?.executiveSummary ??
        result?.data?.executiveSummary ??
        result?.data?.summary ??
        "";

      if (generatedSummary && typeof generatedSummary === "string") {
        setExecutiveSummary(generatedSummary);
      }
    },
    onError: (error) => {
      console.error("[EXEC_SUMMARY][onError]", error);
    },
  });

  const hasTriggeredRef = useRef(false);

  const sexAgeData = useMemo(() => {
    const participants = extractSexAndAge(safeResponses);
    return groupParticipantsByAge(participants);
  }, [safeResponses]);

  const averageAge = useMemo(() => {
    const participants = extractSexAndAge(safeResponses);
    return getAverageAge(participants);
  }, [safeResponses]);

  useEffect(() => {
    if (mission?.executiveSummary) {
      setExecutiveSummary(mission.executiveSummary);
      return;
    }

    if (
      !hasTriggeredRef.current &&
      mission?.status === "completed" &&
      !mission?.executiveSummary &&
      safeResponses.metadata.total_responses > 0
    ) {
      hasTriggeredRef.current = true;
      generateExecutiveSummary.execute({ missionId: mission.id });
    }
  }, [
    mission?.id,
    mission?.status,
    mission?.executiveSummary,
    safeResponses.metadata.total_responses,
  ]);

  useEffect(() => {}, [executiveSummary]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="max-w-7xl mx-auto gap-2 space-y-4">
        <div className="w-full mb-12">
          <ParticipantInfo
            data={sexAgeData}
            config={{
              age: { label: "age", color: "hsl(var(--chart-1))" },
              male: { label: "Homme", color: "hsl(var(--chart-6))" },
              female: { label: "Femme", color: "hsl(var(--chart-2))" },
            }}
            categoryKey="age"
            title={safeResponses.survey_title || ""}
            description=""
            participationQuestions=""
            primaryKeys={["male", "female"]}
            label="value"
            participantCount={safeResponses.metadata.total_responses || 0}
            dates={
              safeResponses.metadata.collection_period?.replace(
                " to ",
                " - ",
              ) || ""
            }
            locations={safeResponses.metadata.locations_covered || []}
            averageAge={averageAge}
          />
        </div>

        <div className="mt-8 gap-4 space-y-8">
          {executiveSummary ? (
            <div className="w-full">
              <MarkdownPreviewCard
                title="Résumé Exécutif"
                description=""
                participationQuestions=""
                content={executiveSummary}
              />
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Aucun executive summary à afficher pour le moment.
            </div>
          )}

          {children}
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
