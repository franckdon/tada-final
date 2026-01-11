"use client";

import { generateExecutiveSummaryAction } from "@/actions/missions/generate-executive-summary-action";
import { MarkdownPreviewCard } from "@/components/missions/boards/graphs/markdown-preview";
import { executiveSummaryMock } from "@/components/missions/boards/graphs/mock-generator";
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
import { useEffect, useMemo, useState } from "react";

export function MyRuntimeProvider({
  children,
  responses,
  mission,
}: Readonly<{
  children: React.ReactNode;
  responses: SurveyData | null;
  mission: {
    id: string;
    status: string;
    executiveSummary: string | null;
  };
}>) {
  const [executiveSummary, setExecutiveSummary] =
    useState<string>(executiveSummaryMock);

  const chat = useChat({
    api: "/api/chat",
    initialMessages: [],
  });

  const runtime = useAISDKRuntime(chat);

  const generateExecutiveSummary = useAction(
    generateExecutiveSummaryAction,
    {}
  );

  const sexAgeData = useMemo(
    () => groupParticipantsByAge(extractSexAndAge(responses)),
    [responses]
  );
  const averageAge = useMemo(
    () => getAverageAge(extractSexAndAge(responses)),
    [responses]
  );

  useEffect(() => {
    if (mission?.status === "completed" && !mission?.executiveSummary) {
      generateExecutiveSummary.execute({
        missionId: mission.id,
        responses,
      });
    }
    if (mission?.executiveSummary) {
      setExecutiveSummary(mission.executiveSummary);
    }
  }, [mission, responses, generateExecutiveSummary]);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="max-w-7xl mx-auto  gap-2 space-y-4">
        <div className="w-full mb-12">
          <ParticipantInfo
            data={sexAgeData}
            config={{
              age: {
                label: "age",
                color: "hsl(var(--chart-1))",
              },
              male: {
                label: "Homme",
                color: "hsl(var(--chart-6))",
              },
              female: {
                label: "Femme",
                color: "hsl(var(--chart-2))",
              },
            }}
            categoryKey="age"
            title={responses?.survey_title || ""}
            description=""
            participationQuestions=""
            primaryKeys={["male", "female"]}
            label="value"
            participantCount={responses?.metadata.total_responses || 0}
            dates={
              responses?.metadata.collection_period.replace(" to ", " - ") || ""
            }
            locations={responses?.metadata.locations_covered || []}
            averageAge={averageAge}
          />
        </div>
        <div className="mt-8 gap-4 space-y-8">
          <div className="w-full">
            <MarkdownPreviewCard
              title=""
              description=""
              participationQuestions=""
              content={executiveSummary}
            />
          </div>
          {children}
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
