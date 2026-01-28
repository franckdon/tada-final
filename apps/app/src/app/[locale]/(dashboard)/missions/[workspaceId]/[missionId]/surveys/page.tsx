// src/app/[locale]/(dashboard)/missions/[workspaceId]/[missionId]/surveys/page.tsx
import { HeaderSurveys } from "@/components/surveys/header-surveys";
import { MissionBrief } from "@/components/surveys/mission-brief";
import { QuestionsList } from "@/components/surveys/questions-list";
import { SurveyShow } from "@/components/ui/survey-show";
import { AudiencesFilterProvider } from "@/context/audiences-filter-context";
import {
  type Survey,
  SurveysBuilderProvider,
} from "@/context/surveys-builder-context";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import type { PlanCode } from "@/lib/plans/plan-limits";
import { resolveQuestionsLimit } from "@/lib/plans/resolve-questions-limit";
import { countSurveyQuestions } from "@/lib/surveys/count-questions";

export default async function Page({
  params,
}: {
  params: { locale: string; workspaceId: string; missionId: string };
}) {
  const { locale, workspaceId, missionId } = params;

  const mission = await prisma.mission.findFirst({
    where: { id: missionId, workspaceId },
    select: {
      id: true,
      workspaceId: true,
      surveys: {
        select: {
          id: true,
          questions: true,
        },
        orderBy: { createdAt: "asc" as any },
      },
      name: true,
      problemSummary: true,
      objectives: true,
      assumptions: true,
      audiences: true,
      mode: true,
      workspace: {
        select: {
          workspacePlanSubscription: true,
        },
      },
    },
  });

  if (!mission) {
    return redirect(`/${locale}/missions/${workspaceId}`);
  }

  const firstSurvey = mission.surveys?.[0];
  if (!firstSurvey) {
    return redirect(`/${locale}/missions/${workspaceId}/${missionId}`);
  }

  const wsId = mission.workspaceId;

  const defaultSurvey = firstSurvey.questions as unknown as Survey;

  const planCode = (mission.workspace?.workspacePlanSubscription?.planCode ??
    "starter") as PlanCode;

  const overrideQ =
    (mission.workspace?.workspacePlanSubscription as any)?.overrides
      ?.questionsPerSurvey ?? null;

  const questionsLimit = resolveQuestionsLimit({
    planCode,
    overrideQuestionsPerSurvey: overrideQ,
    fallback: 10,
  });

  const currentQuestionsCount = countSurveyQuestions(defaultSurvey);

  const redirectToMissionsList = `/${locale}/missions/${wsId}`;

  return (
    <SurveysBuilderProvider defaultSurvey={defaultSurvey}>
      <HeaderSurveys
        surveyId={firstSurvey.id}
        missionId={missionId}
        problemSummary={mission.problemSummary || ""}
        objectives={mission.objectives || ""}
        assumptions={mission.assumptions || ""}
        audiences={(mission.audiences as Record<string, any>) || {}}
        isAiMode={mission.mode === "ai"}
        redirectTo={redirectToMissionsList}
        questionsLimit={questionsLimit}
        initialQuestionsCount={currentQuestionsCount}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 bg-gray-100 dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700 h-full">
          <QuestionsList surveyId={firstSurvey.id} />
        </div>

        <div className="flex-1 h-full overflow-y-auto p-6">
          <SurveyShow />
        </div>

        <AudiencesFilterProvider
          audiences={(mission.audiences as Record<string, any>) || undefined}
          organizationId={wsId}
          workspaceId={wsId}
          missionId={missionId}
        >
          <div className="w-96 bg-white h-full dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            <MissionBrief
              mission={{
                id: missionId,
                name: mission.name,
                problemSummary: mission.problemSummary || "",
                objectives: mission.objectives || "",
                assumptions: mission.assumptions || "",
                audiences: (mission.audiences as Record<string, any>) || {},
                workspaceId: wsId,
              }}
            />
          </div>
        </AudiencesFilterProvider>
      </div>
    </SurveysBuilderProvider>
  );
}
