import { DashboardGrid } from "@/components/missions/sub-dashboard/dashbaord-grid";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSubDashboardItems } from "@/actions/missions/sub-dashboard/get-subdashboard-items";
import {
  convertPrismaSurveyToSurveyData,
  extractAllQuestionsDataWithConfig,
  QuestionData,
} from "@/lib/utils";

interface SubDashboardPageProps {
  params: {
    missionId: string;
    subDashboardId: string;
  };
}

export default async function SubDashboardPage({
  params,
}: SubDashboardPageProps) {
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

  const subDashboard = await prisma.subDashboard.findUnique({
    where: {
      id: params.subDashboardId,
    },
  });

  const items = await getSubDashboardItems(params.subDashboardId);

  if (!subDashboard || !mission) {
    notFound();
  }

  const responseDb = convertPrismaSurveyToSurveyData(mission as any);

  const questionsData: QuestionData[] =
    extractAllQuestionsDataWithConfig(responseDb);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{subDashboard.name}</h1>
        <p className="text-muted-foreground">
          Tableau de bord {subDashboard.isShared ? "partagé" : "privé"} •{" "}
          {items.length} élément(s)
        </p>
      </div>

      <DashboardGrid
        subDashboardId={params.subDashboardId}
        items={items}
        isShared={subDashboard.isShared}
        questionsData={questionsData}
        responseDb={responseDb}
      />
    </div>
  );
}
