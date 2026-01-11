import { BarChartCard } from "@/components/missions/boards/graphs/bar-chart";
import { BarChartHorizontalCard } from "@/components/missions/boards/graphs/bar-chart-horizontal";
import { BarChartHorizontalStackedCard } from "@/components/missions/boards/graphs/bar-chart-horizontal-stacked";
import { BarChartStackedCard } from "@/components/missions/boards/graphs/bar-chart-stacked";
import {
  // responses,
  singleChoice,
} from "@/components/missions/boards/graphs/mock-generator";
import { PieChartCard } from "@/components/missions/boards/graphs/pie-chart";
import { RadarChartCard } from "@/components/missions/boards/graphs/radar-chart";
import { ChartConfig } from "@/components/missions/boards/graphs/ui/chart";
import { prisma } from "@/lib/prisma";
import {
  convertPrismaSurveyToSurveyData,
  extractAllQuestionsDataWithConfig,
  QuestionData,
} from "@/lib/utils";
import { notFound } from "next/navigation";
import { MyRuntimeProvider } from "./my-runtime-provider";
import { AssistantModal } from "@tada/ui/components/assistant-ui/assistant-modal";
import { MarkdownPreviewCard } from "@/components/missions/boards/graphs/markdown-preview";
import { ArrayChartCard } from "@/components/missions/boards/graphs/array-chart";
import FilterChangeChartType from "@/components/missions/boards/modals/filter-change-chart-type";

export const metadata = {
  title: "Mission | Tada",
};

export default async function Page({
  params,
}: {
  params: { orgId: string; missionId: string };
}) {
  const missionIdMock = "e7e2c79d-9a07-400b-8aac-458d96e3aae0";
  const mission = await prisma.mission.findUnique({
    where: { id: missionIdMock },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      survey: {
        select: {
          questions: true,
          response: {
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
  return (
    <div>
      <MyRuntimeProvider
        responses={responseDb}
        mission={{
          id: mission.id,
          status: mission.status || "in_progress",
          executiveSummary: null,
        }}
      >
        {questionsData
          .filter((question) => question.chart_type !== "not implemented")
          .map((question: QuestionData, index) => (
            <div key={index}>
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
                      100
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
                      100
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
                      100
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
                      100
                  )}%)`}
                />
              )}
            </div>
          ))}

        {/*    <div className="w-full">
              <MarkdownPreviewCard
                title="Quels sont les facteurs que vous prenez particulièrement en compte lorsque vous achetez des substituts de viande d'origine végétale ?"
                description=""
                participationQuestions="2 de 5 | 1000 Participants (100%)"
                content="Huit groupes comportant chacun quatre caractéristiques de substituts de viande d'origine végétale sont présentés ci-dessous."
              />
            </div>
            <div className=" w-full">
              <BarChartHorizontalCard
                data={MOCK_DATA_SINGLE_CHOICE}
                config={{
                  OUI: { label: "OUI", color: "hsl(var(--chart-1))" },
                  NON: { label: "NON", color: "hsl(var(--chart-2))" },
                  "JE NE SAIS PAS": {
                    label: "JE NE SAIS PAS",
                    color: "hsl(var(--chart-3))",
                  },
                  value: {
                    label: "value",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                primaryDataKey="value"
                categoryKey="name"
                title="[Choix unique] Avez-vous l'intention de partir en vacances cette année ?"
                description=""
                participationQuestions="1 de 16 | 1000 Participants (100%)"
              />
            </div>
            <div className=" w-full">
              <BarChartHorizontalCard
                data={MOCK_DATA}
                config={MOCK_CONFIG}
                primaryDataKey="desktop"
                categoryKey="month"
                title="[Choix multiple] Dans lesquels de ces pays francophones avez-vous déjà passé des vacances ?"
                description="(Réponses à choix multiples)"
                participationQuestions="2 de 16 | 1000 Participants (100%)"
              />
            </div>
            <div className=" w-full">
              <BarChartCard
                data={MOCK_DATA}
                config={MOCK_CONFIG}
                primaryDataKey="desktop"
                categoryKey="month"
                title="[Préférence] Que préférez-vous en vacances ?"
                description="(Réponses à choix multiples)"
                participationQuestions="3 de 16 | 1000 Participants (100%)"
              />
            </div>
            <div className=" w-full">
              <PieChartCard
                data={MOCK_DATA}
                config={MOCK_CONFIG}
                primaryDataKey="desktop"
                categoryKey="month"
                title="[Étoiles] Un hôtel fait de la publicité avec le slogan « Les vacances sont ce qu'il y a de mieux avec nous ! » Comment évaluez-vous ce slogan ?"
                description=""
                participationQuestions="4 de 16 | 1000 Participants (100%)"
                participantCount={1000}
              />
            </div>
            <div>
              <RadarChartCard
                data={MOCK_DATA}
                config={MOCK_CONFIG}
                primaryDataKey="desktop"
                categoryKey="month"
                title="[Choix multiple] Dans lesquels de ces pays francophones avez-vous déjà passé des vacances ?"
                description="(Réponses à choix multiples)"
                participationQuestions="2 de 16 | 1000 Participants (100%)"
              />
            </div>
            <div>
              <BarChartHorizontalStackedCard
                data={MOCK_DATA_NPS}
                config={MOCK_CONFIG_NPS}
                categoryKey="category"
                title="[Curseur numérique] Quelle est la probabilité que vous recommandiez à un ami ou à un collègue de partir en vacances en France ?"
                description="Instructions pour les participants: 0 = Très improbable // 10 = Très probable"
                participationQuestions="6 de 16 | 1000 Participants (100%)"
                primaryKeys={getNumericKeysDescending(MOCK_DATA_NPS)}
              />
            </div>

            <div>
              <BarChartCard
                data={MOCK_DATA}
                config={MOCK_CONFIG}
                primaryDataKey="desktop"
                categoryKey="month"
                title="[Choix multiple] Dans lesquels de ces pays francophones avez-vous déjà
          passé des vacances ?"
                description="(Réponses à choix multiples)"
                participationQuestions="2 de 16 | 1000 Participants (100%)"
                primaryKeys={["desktop", "mobile"]}
              />
            </div>
            <div>
              <BarChartStackedCard
                data={MOCK_DATA}
                config={MOCK_CONFIG}
                categoryKey="month"
                title="[Choix multiple] Dans lesquels de ces pays francophones avez-vous déjà
          passé des vacances ?"
                description="(Réponses à choix multiples)"
                participationQuestions="2 de 16 | 1000 Participants (100%)"
                primaryKeys={["desktop", "mobile"]}
              />
            </div> */}
        <FilterChangeChartType />
        <AssistantModal />
      </MyRuntimeProvider>
    </div>
  );
}
