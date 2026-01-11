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

export default async function Page({
  params,
}: {
  params: { orgId: string; missionId: string };
}) {
  const missionId = params.missionId as string;
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: {
      survey: true,
      name: true,
      problemSummary: true,
      objectives: true,
      assumptions: true,
      audiences: true,
    },
  });

  if (!mission) return redirect("/");

  console.log(mission);

  return (
    <SurveysBuilderProvider
      defaultSurvey={mission.survey[0]?.questions as unknown as Survey}
    >
      <HeaderSurveys
        surveyId={mission.survey[0]?.id as string}
        missionId={missionId}
        problemSummary={mission.problemSummary || ""}
        objectives={mission.objectives || ""}
        assumptions={mission.assumptions || ""}
        audiences={mission.audiences as Record<string, string | number>}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 bg-gray-100 dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700 max-h-screen">
          <QuestionsList surveyId={mission.survey[0]?.id as string} />
        </div>
        <div className="flex-1 overflow-y-auto max-h-screen p-6">
          <SurveyShow />
        </div>
        <AudiencesFilterProvider>
          <div className="w-96 bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
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
