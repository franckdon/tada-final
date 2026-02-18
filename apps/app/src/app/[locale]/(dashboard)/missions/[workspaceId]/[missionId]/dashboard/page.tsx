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

export const metadata = { title: "Mission | Tada" };

type PageParams = {
  locale: string;
  workspaceId: string;
  missionId: string;
};

const VALID_VIZ: VisualizationId[] = [
  "bar",
  "column",
  "stacked_bar",
  "stacked_column",
  "pie",
  "table",
  "turf",
];

function isValidViz(v: unknown): v is VisualizationId {
  return typeof v === "string" && (VALID_VIZ as string[]).includes(v);
}

function normalizeVizId(
  input: unknown,
  questionType?: string,
): VisualizationId {
  if (isValidViz(input)) return input;

  const byComponentName: Record<string, VisualizationId> = {
    BarChartCard: "column",
    BarChartHorizontalCard: "bar",
    BarChartStackedCard: "stacked_column",
    BarChartHorizontalStackedCard: "stacked_bar",
    PieChartCard: "pie",
    RadarChartCard: "turf",
    ArrayChartCard: "table",
    Table: "table",
  };

  if (typeof input === "string" && byComponentName[input]) {
    return byComponentName[input];
  }

  const t = String(questionType || "").toLowerCase();

  if (t === "boolean") return "pie";
  if (t === "dropdown" || t === "single_choice" || t === "radiogroup")
    return "bar";
  if (t === "checkbox" || t === "multiple_choice") return "bar";
  if (t === "rating") return "column";
  if (t === "text" || t === "comment") return "table";
  if (t === "file") return "table";

  return "bar";
}

export default async function Page({ params }: { params: PageParams }) {
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
      surveys: {
        select: {
          id: true,
          questions: true,
          responses: {
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

  const surveyResponses = (mission.surveys ?? []).flatMap(
    (s) => s.responses ?? [],
  );

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
        include: { createdBy: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const commentCountsByQuestion = comments.reduce(
    (acc: Record<string, number>, c) => {
      if (c.questionKey) acc[c.questionKey] = (acc[c.questionKey] || 0) + 1;
      return acc;
    },
    {},
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

  const totalResponses = surveyResponses.length;

  const safeResponseDb = {
    ...responseDb,
    metadata: {
      ...responseDb.metadata,
      total_responses: totalResponses,
    },
  };

  // -------------------------------------------------------
  // ✅ 1) Tenter missionCharts, MAIS on ne garde que ceux qui matchent réellement
  // -------------------------------------------------------
  let questionsDataFromCharts: QuestionData[] = [];

  if (mission.missionCharts?.length) {
    questionsDataFromCharts = mission.missionCharts
      .map((chart): QuestionData | null => {
        const chartData = chart.chartData as any;
        if (!chartData?.question || !chartData?.type) return null;

        const qResponses = extractResponsesForQuestion(
          surveyResponses,
          chartData.question,
        );

        // ✅ IMPORTANT: si aucune réponse => graph vide => on SKIP ce chart
        if (!qResponses || qResponses.length === 0) return null;

        const realData = formatChartDataFromResponses(
          qResponses,
          chartData.type,
        );
        const realConfig = generateChartConfigFromData(
          realData,
          chartData.type,
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

        const normalizedChartType = normalizeVizId(
          chartData.chart_type,
          chartData.type,
        );

        const allowed =
          Array.isArray(chartData.allowed_chart) &&
          chartData.allowed_chart.length
            ? (chartData.allowed_chart
                .map((v: any) => normalizeVizId(v, chartData.type))
                .filter(isValidViz) as VisualizationId[])
            : [normalizedChartType];

        return {
          question: chartData.question,
          type: chartData.type,
          chart_type: normalizedChartType,
          allowed_chart: allowed,
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

  // -------------------------------------------------------
  // ✅ 2) Si les missionCharts ne matchent pas (ou presque pas), on fallback sur les VRAIES réponses
  // -------------------------------------------------------
  const questionsData =
    questionsDataFromCharts.length > 0
      ? questionsDataFromCharts
      : extractAllQuestionsDataWithConfig(safeResponseDb).map((q) => {
          const normalized = normalizeVizId((q as any).chart_type, q.type);
          const allowed =
            Array.isArray(q.allowed_chart) && q.allowed_chart.length
              ? (q.allowed_chart
                  .map((v: any) => normalizeVizId(v, q.type))
                  .filter(isValidViz) as VisualizationId[])
              : [normalized];

          return {
            ...q,
            chart_type: normalized,
            allowed_chart: allowed,
          };
        });

  console.log("[MissionDashboard] built", {
    totalResponses,
    missionChartsCount: mission.missionCharts?.length ?? 0,
    usedMissionCharts: questionsDataFromCharts.length,
    finalQuestionsCount: questionsData.length,
    sample: questionsData[0]
      ? {
          question: questionsData[0].question,
          type: questionsData[0].type,
          chart_type: questionsData[0].chart_type,
          participants_responded: questionsData[0].participants_responded,
          dataLen: Array.isArray(questionsData[0].data)
            ? questionsData[0].data.length
            : 0,
        }
      : null,
  });

  return (
    <div>
      <MissionCommentsDrawer
        missionId={missionId}
        workspaceId={workspaceId}
        currentUserId={currentUser?.id ?? ""}
        workspaceMembers={workspaceMembers.filter(
          (m) => m.id !== currentUser?.id,
        )}
        initialComments={comments as any}
      />

      <MyRuntimeProvider
        responses={safeResponseDb}
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
            (m) => m.id !== currentUser?.id,
          )}
        />
        <AssistantModal />
      </MyRuntimeProvider>
    </div>
  );
}
