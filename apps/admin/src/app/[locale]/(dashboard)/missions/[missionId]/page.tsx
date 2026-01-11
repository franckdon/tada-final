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

export const metadata = {
  title: "Mission | Tada",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: { missionId: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    notFound();
  }

  const mission = await prisma.mission.findUnique({
    where: { id: params?.missionId },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      survey: true,
    },
  });

  if (!mission) {
    return notFound();
  }

  const { start, end } = getDateRange("last_year");

  const surveyResponses = await prisma.surveyResponse.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });

  const subDashboards = await prisma.subDashboard.findMany({
    where: {
      missionId: params?.missionId,
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

  const data = await getMissionSubmissionData();

  return (
    <div className="w-full border border-gray-100 bg-white dark:bg-gray-900 ">
      <NavigationBarMission mission={mission} />
      {searchParams.tab === "overview" || !searchParams.tab ? (
        <div className="flex flex-col md:flex-row gap-6 w-full px-4 mt-8">
          <ReportView
            barChartData={monthlyCounts || []}
            locations={mapLocations}
            surveys={mission.survey as unknown as TSurvey[]}
            surveyResponses={surveyResponses}
            columns={data.columns}
            subDashboards={subDashboards as unknown as SubDashboard[]}
          />
        </div>
      ) : searchParams.tab === "dashboards" ? (
        <div className="mt-10">
          <ListBoardsServer
            missionId={params.missionId}
            query={(searchParams.query as string) || ""}
            sort={(searchParams.sort as string[]) || []}
            page={Number(searchParams.page) || 0}
            status={(searchParams.status as string) || ""}
            date={(searchParams.date as string) || ""}
          />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 w-full px-4  py-5">
          <MissionSubmission
            rows={data.rows}
            surveys={surveyResponses}
            locations={mapLocations}
            params={params}
          />
        </div>
      )}
    </div>
  );
}
