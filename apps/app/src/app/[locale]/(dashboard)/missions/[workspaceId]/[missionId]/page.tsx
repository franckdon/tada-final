import { ListBoardsServer } from "@/components/missions/boards/list-boards-server";
import { NavigationBarMission } from "@/components/missions/navigation-bar-mission";
import { ReportView } from "@/components/missions/report-view";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { eachMonthOfInterval, format } from "date-fns";
import { getDateRange } from "@/utils/get-survey-date-range";
import { MapLocation, TSurvey } from "@/types/survey-response";
import { MissionSubmission } from "@/components/missions/mission-submission";
import { getMissionSubmissionData } from "@/lib/get-mission-submission-data";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SubDashboard } from "@/types/sub-dashboard";
import { getI18n } from "@/locales/server";
import Link from "next/link";

export const metadata = {
  title: "Mission | Tada",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string; missionId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getI18n();

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  console.log("[MISSION_PAGE] params =", resolvedParams);
  console.log("[MISSION_PAGE] searchParams =", resolvedSearchParams);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    notFound();
  }

  const mission = await prisma.mission.findUnique({
    where: { id: resolvedParams.missionId },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      survey: true,
    },
  });

  console.log("[MISSION_PAGE] params =", resolvedParams);
  console.log("[MISSION_PAGE] searchParams =", resolvedSearchParams);

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("missions.addSubDashboard.notFound.title")}
        </h1>
        <p className="mt-2 text-gray-500">
          {t("missions.addSubDashboard.notFound.description")}
        </p>
        <Link
          href={`/missions/${resolvedParams.workspaceId}`}
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-white transition-colors"
        >
          {t("missions.addSubDashboard.notFound.backToMission")}
        </Link>
      </div>
    );
  }

  const { start, end } = getDateRange("this_year");

  const surveyResponses = await prisma.surveyResponse.findMany({
    where: {
      surveyId: mission?.survey[0]?.id,
      createdAt: {
        gte: start,
        lte: end,
      },
      status: "completed",
    },
  });

  const subDashboards = await prisma.subDashboard.findMany({
    where: {
      missionId: resolvedParams.missionId,
      OR: [{ isShared: true }, { userId: session.user.id }],
    },
    include: {
      user: true,
    },
  });

  const monthsInRange = eachMonthOfInterval({ start, end });

  const monthlyCounts = monthsInRange.map((date) => ({
    month: format(date, "MM"),
    label: format(date, "MMM"),
    count: 0,
  }));

  surveyResponses.forEach(({ createdAt }) => {
    const month = format(createdAt, "MM");
    const entry = monthlyCounts.find((m) => m.month === month);
    if (entry) entry.count += 1;
  });

  const locationMap = new Map<string, MapLocation>();

  surveyResponses.forEach((resp) => {
    const loc = resp.location as any;
    const label = loc.label;
    const lng = loc.lng;
    const lat = loc.lat;

    if (!label || lng === undefined || lat === undefined) return;

    if (locationMap.has(label)) {
      locationMap.get(label)!.count += 1;
    } else {
      locationMap.set(label, {
        id: crypto.randomUUID(),
        coordinates: [lng, lat],
        count: 1,
        location: label,
      });
    }
  });

  const mapLocations: MapLocation[] = Array.from(locationMap.values());

  const data = await getMissionSubmissionData(mission?.survey[0]?.id || "");

  return (
    <div className="w-full h-full border border-gray-100 bg-white dark:bg-gray-900 ">
      <NavigationBarMission
        mission={mission}
        workspaceId={resolvedParams.workspaceId}
      />
      {resolvedSearchParams.tab === "overview" || !resolvedSearchParams.tab ? (
        <div className="flex flex-col md:flex-row gap-6 w-full px-4 mt-8">
          <ReportView
            barChartData={monthlyCounts || []}
            locations={mapLocations}
            surveys={mission.survey as unknown as TSurvey[]}
            surveyResponses={surveyResponses}
            columns={data.columns}
            workspaceId={resolvedParams.workspaceId}
            subDashboards={subDashboards as unknown as SubDashboard[]}
          />
        </div>
      ) : resolvedSearchParams.tab === "dashboards" ? (
        <div className="mt-10">
          <ListBoardsServer
            orgId={resolvedParams.workspaceId}
            missionId={resolvedParams.missionId}
            query={(resolvedSearchParams.query as string) || ""}
            sort={(resolvedSearchParams.sort as string[]) || []}
            page={Number(resolvedSearchParams.page) || 0}
            status={(resolvedSearchParams.status as string) || ""}
            date={(resolvedSearchParams.date as string) || ""}
          />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 w-full px-4  py-5">
          <MissionSubmission
            rows={data.rows}
            surveys={surveyResponses}
            locations={mapLocations}
            params={resolvedParams}
          />
        </div>
      )}
    </div>
  );
}
