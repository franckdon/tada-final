import { ListBoardsServer } from "@/components/missions/boards/list-boards-server";
import { NavigationBarMission } from "@/components/missions/navigation-bar-mission";
import { ReportView } from "@/components/missions/report-view";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { getI18n } from "@/locales/server";

import { auth } from "@/lib/auth";
import { MissionSubmission } from "@/components/missions/mission-submission";
import { getMissionSubmissionData } from "@/lib/get-mission-submission-data";

import type {
  MapLocation,
  MonthlySurveyCount,
  TSurvey,
} from "@/types/survey-response";
import type { SubDashboard } from "@/types/sub-dashboard";

import {
  eachMonthOfInterval,
  format,
  startOfMonth,
  endOfMonth,
} from "date-fns";

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

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) notFound();

  const mission = await prisma.mission.findUnique({
    where: { id: resolvedParams.missionId },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      surveys: {
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          questions: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

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

  const surveyId = mission.surveys?.[0]?.id;

  if (!surveyId) {
    return (
      <div className="w-full h-full border border-gray-100 bg-white dark:bg-gray-900">
        <NavigationBarMission
          mission={mission as any}
          workspaceId={resolvedParams.workspaceId}
        />
        <div className="p-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold">
              {t("missions.addSubDashboard.notFound.title")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Aucune enquête (survey) n’est rattachée à cette mission.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Tout charger (pas de timeframe)
  const surveyResponses = await prisma.surveyResponse.findMany({
    where: { surveyId, status: "completed" },
    select: {
      id: true,
      createdAt: true,
      location: true,
      responses: true,
      age: true,
      gender: true,
      status: true,
      surveyId: true,
      userId: true,
      submittedAt: true,
      updatedAt: true,
      ipAddress: true,
      userAgent: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const subDashboards = await prisma.subDashboard.findMany({
    where: {
      missionId: resolvedParams.missionId,
      OR: [{ isShared: true }, { userId: session.user.id }],
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  // ✅ MonthlySurveyCount[] attendu par ReportView : { month: "01".."12", count }
  let monthlyCounts: MonthlySurveyCount[] = [];

  if (surveyResponses.length > 0) {
    const minDate = startOfMonth(surveyResponses[0].createdAt);
    const maxDate = endOfMonth(
      surveyResponses[surveyResponses.length - 1].createdAt,
    );

    const months = eachMonthOfInterval({ start: minDate, end: maxDate });

    monthlyCounts = months.map((d) => ({
      month: format(d, "MM"),
      count: 0,
    }));

    for (const r of surveyResponses) {
      const m = format(r.createdAt, "MM");
      const entry = monthlyCounts.find((x) => x.month === m);
      if (entry) entry.count += 1;
    }
  }

  // ✅ Locations : JSON coords ou string
  const locationMap = new Map<string, MapLocation>();

  for (const resp of surveyResponses) {
    const loc: any = resp.location;

    // cas JSON {label,lng,lat}
    if (loc && typeof loc === "object") {
      const label = loc.label;
      const lng = loc.lng ?? loc.lon;
      const lat = loc.lat;

      if (!label || lng == null || lat == null) continue;

      const prev = locationMap.get(label);
      if (prev) prev.count += 1;
      else {
        locationMap.set(label, {
          id: crypto.randomUUID(),
          coordinates: [Number(lng), Number(lat)],
          count: 1,
          location: label,
        });
      }
      continue;
    }

    // cas string "Koumassi"
    if (typeof loc === "string" && loc.trim()) {
      const label = loc.trim();
      const prev = locationMap.get(label);
      if (prev) prev.count += 1;
      else {
        locationMap.set(label, {
          id: crypto.randomUUID(),
          coordinates: null as any,
          count: 1,
          location: label,
        });
      }
    }
  }

  const mapLocations: MapLocation[] = Array.from(locationMap.values());

  const submissionData = await getMissionSubmissionData(surveyId);

  const tab = resolvedSearchParams.tab;

  return (
    <div className="w-full h-full border border-gray-100 bg-white dark:bg-gray-900">
      <NavigationBarMission
        mission={mission as any}
        workspaceId={resolvedParams.workspaceId}
      />

      {tab === "overview" || !tab ? (
        <div className="flex flex-col md:flex-row gap-6 w-full px-4 mt-8">
          <ReportView
            barChartData={monthlyCounts}
            // ton MapboxMap utilise locations[0]?.coordinates → filtre ceux sans coords
            locations={mapLocations.filter((l) => Array.isArray(l.coordinates))}
            surveys={mission.surveys as unknown as TSurvey[]}
            surveyResponses={surveyResponses as any}
            columns={submissionData.columns}
            workspaceId={resolvedParams.workspaceId}
            subDashboards={subDashboards as unknown as SubDashboard[]}
          />
        </div>
      ) : tab === "dashboards" ? (
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
        <div className="flex flex-col md:flex-row gap-6 w-full px-4 py-5">
          <MissionSubmission
            rows={submissionData.rows}
            surveys={surveyResponses as any}
            locations={mapLocations.filter((l) => Array.isArray(l.coordinates))}
            params={resolvedParams}
          />
        </div>
      )}
    </div>
  );
}
