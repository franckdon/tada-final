import { prisma } from "@/lib/prisma";
import {
  convertPrismaSurveyToSurveyData,
  extractAllQuestionsDataWithConfig,
  QuestionData,
} from "@/lib/utils";
import {
  extractResponsesForQuestion,
  formatChartDataFromResponses,
  generateChartConfigFromData,
  extractPrimaryKeysFromRatingData,
  extractRatingRange,
} from "@/lib/chart-data-formatter";
import { notFound } from "next/navigation";
import MissionDashboardClient from "./mission-dashboard-client";
import { MyRuntimeProvider } from "./my-runtime-provider";
import { AssistantModal } from "@tada/ui/components/assistant-ui/assistant-modal";
import type { VisualizationId } from "@/lib/chart-types";
import { MissionCommentsDrawer } from "./mission-comments-drawer";

import { getCurrentUser } from "@/lib/current-user";

export const metadata = {
  title: "Mission | Tada",
};

export default async function Page({
  params,
}: {
  params: { locale: string; workspaceId: string; missionId: string };
}) {
  const { missionId, workspaceId } = params;

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      executiveSummary: true,
      executiveSummaryUpdatedAt: true,
      survey: {
        select: {
          id: true,
          questions: true,
          response: {
            where: { status: "completed" },
            select: {
              id: true,
              responses: true,
              age: true,
              gender: true,
              location: true,
              status: true,
            },
          },
        },
      },
      missionCharts: {
        where: { status: "published" },
        orderBy: { dashboardOrder: "asc" },
      },
    },
  });

  if (!mission) notFound();

  const surveyResponses = mission.survey?.[0]?.response ?? [];
  if (surveyResponses.length === 0) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold">Aucune réponse disponible</h1>
        <p className="text-gray-500 mt-2">
          Il n’y a pas encore de réponses pour cette mission.
        </p>
      </div>
    );
  }

  const comments = await prisma.comment.findMany({
    where: { missionId, parentId: null },
    include: {
      createdBy: true,
      resolvedBy: {
        select: { id: true, name: true, email: true, image: true },
      },
      replies: {
        include: {
          createdBy: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const commentCountsByQuestion = comments.reduce(
    (acc: Record<string, number>, c) => {
      if (c.questionKey) {
        acc[c.questionKey] = (acc[c.questionKey] || 0) + 1;
      }
      return acc;
    },
    {}
  );

  const [workspace, currentUser] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        members: {
          where: { status: "active" },
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    }),
    getCurrentUser(),
  ]);

  const workspaceMembers =
    workspace?.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
    })) ?? [];

  const responseDb = convertPrismaSurveyToSurveyData(mission as any);
  let questionsData: QuestionData[] = [];

  if (mission.missionCharts?.length) {
    questionsData = mission.missionCharts
      .map((chart): QuestionData | null => {
        const chartData = chart.chartData as any;
        if (!chartData?.question || !chartData?.type) return null;

        const qResponses = extractResponsesForQuestion(
          surveyResponses,
          chartData.question
        );
        const realData = formatChartDataFromResponses(
          qResponses,
          chartData.type
        );
        const realConfig = generateChartConfigFromData(
          realData,
          chartData.type
        );

        let primaryKeys: string[] | undefined;
        let min: number | undefined;
        let max: number | undefined;

        if (chartData.type === "rating" && Array.isArray(realData)) {
          primaryKeys = extractPrimaryKeysFromRatingData(realData);
          const range = extractRatingRange(realData);
          min = range.min;
          max = range.max;
        }

        return {
          question: chartData.question,
          type: chartData.type,
          chart_type: chartData.chart_type as VisualizationId,
          allowed_chart: chartData.allowed_chart ?? [],
          participants_responded: qResponses.length,
          data: realData,
          config: realConfig,
          primaryKeys,
          min,
          max,
          insights: chart.insights ?? null,
          insightsUpdatedAt: chart.insightsUpdatedAt,
          chartId: chart.id,
          rawResponses: qResponses,
        };
      })
      .filter((q): q is QuestionData => q !== null);
  }

  if (questionsData.length === 0) {
    questionsData = extractAllQuestionsDataWithConfig(responseDb);
  }

  const totalResponses = responseDb.metadata.total_responses;

  console.log(extractAllQuestionsDataWithConfig(responseDb));
  // console.log(
  //   "Questions rawResponses:",
  //   questionsData.map((q) => ({
  //     question: q.question,
  //     rawCount: q.rawResponses?.length,
  //     data: Array.isArray(q.data) ? q.data.length : null,
  //   }))
  // );
  return (
    <div>
      <MissionCommentsDrawer
        missionId={missionId}
        workspaceId={workspaceId}
        currentUserId={currentUser?.id ?? ""}
        workspaceMembers={workspaceMembers.filter(
          (m) => m.id !== currentUser?.id
        )}
        initialComments={comments as any}
      />

      <MyRuntimeProvider
        responses={responseDb}
        mission={{
          id: mission.id,
          status: mission.status || "in_progress",
          executiveSummary: mission.executiveSummary,
          executiveSummaryUpdatedAt: mission.executiveSummaryUpdatedAt,
        }}
      >
        <MissionDashboardClient
          missionId={missionId}
          initialQuestions={questionsData}
          totalResponses={totalResponses}
          missionStatus={mission.status || "in_progress"}
          commentCountsByQuestion={commentCountsByQuestion}
          currentUserId={currentUser?.id ?? ""}
          workspaceMembers={workspaceMembers.filter(
            (m) => m.id !== currentUser?.id
          )}
        />
        <AssistantModal />
      </MyRuntimeProvider>
    </div>
  );
}
