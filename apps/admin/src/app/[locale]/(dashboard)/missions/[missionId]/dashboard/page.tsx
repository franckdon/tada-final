import { BarChartHorizontalCard } from "@/components/missions/boards/graphs/bar-chart-horizontal";
import { BarChartHorizontalStackedCard } from "@/components/missions/boards/graphs/bar-chart-horizontal-stacked";
import { PieChartCard } from "@/components/missions/boards/graphs/pie-chart";
import { ArrayChartCard } from "@/components/missions/boards/graphs/array-chart";
import { ChartInsightsCard } from "@/components/missions/boards/graphs/chart-insights-card";
import { prisma } from "@/lib/prisma";
import {
  convertPrismaSurveyToSurveyData,
  extractAllQuestionsDataWithConfig,
  QuestionData,
} from "@/lib/utils";
import { notFound } from "next/navigation";
import { MyRuntimeProvider } from "./my-runtime-provider";
import { AssistantModal } from "@tada/ui/components/assistant-ui/assistant-modal";
import FilterChangeChartType from "@/components/missions/boards/modals/filter-change-chart-type";

export const metadata = {
  title: "Mission | Tada",
};

function normalizeQuestionKey(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export default async function Page({
  params,
}: {
  params: { missionId: string; locale: string };
}) {
  const mission = await prisma.mission.findUnique({
    where: { id: params.missionId },
    select: {
      id: true,
      name: true,
      status: true,
      executiveSummary: true,
      missionCharts: {
        where: { status: "published" },
        select: {
          id: true,
          title: true,
          subType: true,
          surveyId: true,
          chartData: true,
          insights: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      surveys: {
        select: {
          id: true,
          questions: true,
          responses: {
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
    },
  });

  if (!mission) {
    return notFound();
  }

  const responseDb = convertPrismaSurveyToSurveyData(mission as any);
  const questionsData: QuestionData[] =
    extractAllQuestionsDataWithConfig(responseDb);

  const findInsightsForQuestion = (question: QuestionData) => {
    const normalizedQuestion = normalizeQuestionKey(question.question);

    const matchedChart = mission.missionCharts.find((chart) => {
      const chartQuestion = normalizeQuestionKey(
        (chart.chartData as any)?.question,
      );
      const chartTitle = normalizeQuestionKey(chart.title);

      return (
        chartQuestion === normalizedQuestion ||
        chartTitle === normalizedQuestion
      );
    });

    const insights = Array.isArray(matchedChart?.insights)
      ? (matchedChart?.insights as any[])
      : [];

    console.log("[PAGE] insight match", {
      question: question.question,
      normalizedQuestion,
      matchedChartId: matchedChart?.id ?? null,
      matchedChartTitle: matchedChart?.title ?? null,
      insightsCount: insights.length,
      rawInsights: matchedChart?.insights ?? null,
    });

    return insights;
  };

  console.log(
    "Mission Charts:",
    mission.missionCharts.map((chart) => ({
      id: chart.id,
      title: chart.title,
      question: (chart.chartData as any)?.question,
      insightsCount: Array.isArray(chart.insights) ? chart.insights.length : 0,
      insights: chart.insights,
    })),
  );

  console.log(
    "[PAGE] questionsData:",
    questionsData.map((q) => ({
      question: q.question,
      chart_type: q.chart_type,
      participants_responded: q.participants_responded,
    })),
  );

  return (
    <div>
      <MyRuntimeProvider
        responses={responseDb}
        mission={{
          id: mission.id,
          status: mission.status || "in_progress",
          executiveSummary: mission.executiveSummary,
        }}
      >
        {questionsData
          .filter((question) => question.chart_type !== "not implemented")
          .map((question: QuestionData, index) => {
            const insights = findInsightsForQuestion(question);

            return (
              <div key={index} className="mb-10 space-y-5">
                {question.chart_type === "BarChartHorizontalCard" && (
                  <BarChartHorizontalCard
                    data={
                      question.data as Array<{ label: string; value: number }>
                    }
                    config={question.config}
                    primaryDataKey="value"
                    categoryKey="label"
                    title={question.question}
                    description=""
                    participationQuestions={`${index + 1} de ${
                      questionsData.length
                    } | ${
                      question.participants_responded
                    } Participants (${Math.round(
                      (question.participants_responded /
                        responseDb.metadata.total_responses) *
                        100,
                    )}%)`}
                  />
                )}

                {question.chart_type === "PieChart" && (
                  <PieChartCard
                    data={
                      question.data as Array<{
                        label: string;
                        value: number;
                      }>
                    }
                    config={question.config}
                    primaryDataKey="value"
                    categoryKey="label"
                    title={question.question}
                    description=""
                    participationQuestions={`${index + 1} de ${
                      questionsData.length
                    } | ${
                      question.participants_responded
                    } Participants (${Math.round(
                      (question.participants_responded /
                        responseDb.metadata.total_responses) *
                        100,
                    )}%)`}
                    participantCount={question.participants_responded}
                  />
                )}

                {question.chart_type === "BarChartHorizontalStackedCard" && (
                  <BarChartHorizontalStackedCard
                    data={
                      question.data as unknown as Array<{
                        label: string;
                        value: number;
                      }>
                    }
                    config={question.config}
                    categoryKey="label"
                    title={question.question}
                    description=""
                    participationQuestions={`${index + 1} de ${
                      questionsData.length
                    } | ${
                      question.participants_responded
                    } Participants (${Math.round(
                      (question.participants_responded /
                        responseDb.metadata.total_responses) *
                        100,
                    )}%)`}
                    participantCount={question.participants_responded}
                    primaryKeys={question.primaryKeys}
                    min={question.min || 0}
                    max={question.max || 100}
                  />
                )}

                {question.chart_type === "ArrayChartCard" && (
                  <ArrayChartCard
                    texts={question.data as string[]}
                    title={question.question}
                    description=""
                    participationQuestions={`${index + 1} de ${
                      questionsData.length
                    } | ${
                      question.participants_responded
                    } Participants (${Math.round(
                      (question.participants_responded /
                        responseDb.metadata.total_responses) *
                        100,
                    )}%)`}
                  />
                )}

                <ChartInsightsCard insights={insights} locale={params.locale} />
              </div>
            );
          })}

        <FilterChangeChartType />
        <AssistantModal />
      </MyRuntimeProvider>
    </div>
  );
}
