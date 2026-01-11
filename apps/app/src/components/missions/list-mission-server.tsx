import { prisma } from "@/lib/prisma";
import { NoResults } from "./empty-states";
import { ListMissions } from "./list-missions";
import { MissionFilter } from "./mission-filter";

const pageSize = 10;

interface FetchMissionsParams {
  orgId: string;
  workspaceId: string;
  query?: string;
  status?: string;
  date?: string;
  page: number; // 0-based
  pageSize: number;
  sort?: string[];
}

function fetchMissions({
  orgId, // kept for signature consistency (not used in whereClause right now)
  workspaceId,
  query,
  status,
  date,
  page,
  pageSize,
  sort = ["createdAt"],
}: FetchMissionsParams) {
  const whereClause = {
    workspaceId,
    ...(query?.trim()
      ? { name: { contains: query.trim(), mode: "insensitive" as const } }
      : {}),
    ...(status && status !== "all" ? { status } : {}),
    ...(date?.trim() ? { createdAt: { gte: new Date(date) } } : {}),
  };

  const orderByClause = (sort.length ? sort : ["createdAt"]).map((s) => ({
    [s]: "desc" as const,
  }));

  return prisma.mission.findMany({
    where: whereClause,
    orderBy: orderByClause,
    skip: page * pageSize,
    take: pageSize + 1,
    include: {
      missionPermissions: {
        include: { user: true },
      },
      survey: {
        include: {
          response: {
            where: { status: "completed" },
          },
        },
      },
    },
  });
}

export async function ListMissionServer({
  orgId,
  workspaceId,
  query,
  sort,
  page,
  status,
  date,
}: {
  workspaceId: string;
  orgId: string;
  query?: string;
  sort?: string[];
  page: number; // 0-based
  status?: string;
  date?: string;
}) {
  // ✅ Correct filter detection (no more undefined !== null bug)
  const hasFilters =
    (query?.trim()?.length ?? 0) > 0 ||
    (date?.trim()?.length ?? 0) > 0 ||
    (status ?? "all") !== "all";

  // ✅ Always do proper pagination (no maxItems, no huge take)
  const raw = await fetchMissions({
    orgId,
    workspaceId,
    query,
    status,
    date,
    page,
    pageSize,
    sort,
  });

  const hasNextPage = raw.length > pageSize;
  const missions = hasNextPage ? raw.slice(0, pageSize) : raw;

  async function loadMore({ page: nextPage }: { page: number }) {
    "use server";

    const rawNext = await fetchMissions({
      workspaceId,
      orgId,
      query,
      status,
      date,
      page: nextPage,
      pageSize,
      sort,
    });

    const hasNext = rawNext.length > pageSize;
    const items = hasNext ? rawNext.slice(0, pageSize) : rawNext;

    // ✅ return shape you can adapt in ListMissions if needed
    return { missions: items, hasNextPage: hasNext };
  }

  // Note: hasFilters is still useful if you want to change UI behaviour,
  // but it no longer changes how much you fetch (stability)
  void hasFilters;

  return (
    <div className="space-x-4 ">
      <MissionFilter orgId={workspaceId} />
      {missions.length > 0 ? (
        <ListMissions
          missions={missions.map((mission) => ({
            ...mission,
            submissions:
              mission.survey.length > 0
                ? (mission.survey?.[0]?.response.length ?? 0)
                : 0,
          }))}
          hasNextPage={hasNextPage}
          loadMore={loadMore}
          pageSize={pageSize}
          orgId={orgId}
          workspaceId={workspaceId}
        />
      ) : (
        <NoResults />
      )}
    </div>
  );
}
