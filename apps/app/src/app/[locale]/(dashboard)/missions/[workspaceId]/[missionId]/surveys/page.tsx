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
  params: { orgId: string; missionId: string };
}) {
  const missionId = params.missionId as string;
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: {
      surveys: true,
      name: true,
      problemSummary: true,
      objectives: true,
      assumptions: true,
      audiences: true,
      mode: true,
      workspaceId: true,
      workspace: {
        select: {
          workspacePlanSubscription: true,
        },
      },
    },
  });

  if (!mission) return redirect("/");

  const defaultSurvey = mission.surveys[0]?.questions as unknown as Survey;

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

  const redirectToMissionsList = `/missions?workspaceId=${mission.workspaceId}`;
  return (
    <SurveysBuilderProvider
      defaultSurvey={mission.surveys[0]?.questions as unknown as Survey}
    >
      <HeaderSurveys
        surveyId={mission.surveys[0]?.id as string}
        missionId={missionId}
        problemSummary={mission.problemSummary || ""}
        objectives={mission.objectives || ""}
        assumptions={mission.assumptions || ""}
        audiences={mission.audiences as Record<string, string | number>}
        isAiMode={mission.mode === "ai"}
        redirectTo={redirectToMissionsList}
        questionsLimit={questionsLimit}
        initialQuestionsCount={currentQuestionsCount}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 bg-gray-100 dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700 h-full">
          <QuestionsList surveyId={mission.surveys[0]?.id as string} />
        </div>
        <div className="flex-1 h-full overflow-y-auto p-6">
          <SurveyShow />
        </div>
        <AudiencesFilterProvider
          audiences={
            (mission.audiences as unknown as Record<string, any>) || undefined
          }
          organizationId={params.orgId}
          workspaceId={mission.workspaceId}
          missionId={missionId}
        >
          <div className="w-96 bg-white h-full dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            <MissionBrief
              mission={{
                id: missionId,
                name: mission.name,
                orgId: params?.orgId,
                problemSummary: mission.problemSummary || "",
                objectives: mission.objectives || "",
                assumptions: mission.assumptions || "",
                audiences:
                  (mission.audiences as Record<string, string | number>) || {},
              }}
            />
          </div>
        </AudiencesFilterProvider>
      </div>
    </SurveysBuilderProvider>
  );
}
