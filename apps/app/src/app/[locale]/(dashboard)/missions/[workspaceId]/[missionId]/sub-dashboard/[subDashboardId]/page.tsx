import { DashboardGrid } from "@/components/missions/sub-dashboard/dashbaord-grid";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSubDashboardItems } from "@/actions/missions/sub-dashboard/get-subdashboard-items";
import {
  convertPrismaSurveyToSurveyData,
  extractAllQuestionsDataWithConfig,
  QuestionData,
} from "@/lib/utils";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

interface SubDashboardPageProps {
  params: {
    missionId: string;
    subDashboardId: string;
  };
}

export default async function SubDashboardPage({
  params,
}: SubDashboardPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    notFound();
  }

  const mission = await prisma.mission.findUnique({
    where: { id: params.missionId },
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
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {subDashboard.name}
          </h1>
          <p className="text-sm text-muted-foreground">
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
          user={
            {
              ...session.user,
              organizationId: session?.session.activeOrganizationId,
            } as any
          }
        />
      </div>
    </div>
  );
}
