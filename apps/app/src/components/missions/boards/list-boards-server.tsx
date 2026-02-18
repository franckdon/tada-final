import { prisma } from "@/lib/prisma";
import { NoResults } from "../empty-states";
import { AddBoardButton } from "./add-board-button";
import { ListBoards } from "./list-boards";

const pageSize = 10;

interface FetchMissionsParams {
  workspaceId: string;
  query?: string;
  status?: string;
  date?: string; // ISO string
  page: number; // 0-based
  pageSize: number;
  sort?: string[];
}

async function fetchMissions({
  workspaceId,
  query,
  status,
  date,
  page,
  pageSize,
  sort = [],
}: FetchMissionsParams) {
  const whereClause: any = {
    organizationId: workspaceId,
    ...(query?.trim()
      ? { name: { contains: query.trim(), mode: "insensitive" } }
      : {}),
    ...(status && status !== "all" ? { status } : {}),
    ...(date ? { createdAt: { gte: new Date(date) } } : {}),
  };

  const orderByClause =
    sort.length > 0 ? sort.map((s) => ({ [s]: "asc" as const })) : undefined;

  // ✅ fetch +1 pour déterminer hasNextPage
  const items = await prisma.mission.findMany({
    where: whereClause,
    ...(orderByClause ? { orderBy: orderByClause } : {}),
    skip: page * pageSize,
    take: pageSize + 1,
  });

  const hasNextPage = items.length > pageSize;
  const missions = hasNextPage ? items.slice(0, pageSize) : items;

  return { missions, hasNextPage };
}

export async function ListBoardsServer({
  orgId,
  missionId,
  query,
  sort,
  page,
  status,
  date,
}: {
  orgId: string;
  missionId: string;
  query?: string;
  sort?: string[];
  page: number;
  status?: string;
  date?: string;
}) {
  // ✅ orgId = workspaceId dans ta DB (organizationId)
  const { missions, hasNextPage } = await fetchMissions({
    workspaceId: orgId,
    query,
    status,
    date,
    page,
    pageSize,
    sort,
  });

  async function loadMore({ page: nextPage }: { page: number }) {
    "use server";
    return fetchMissions({
      workspaceId: orgId,
      query,
      status,
      date,
      page: nextPage,
      pageSize,
      sort,
    });
  }

  return (
    <div className="space-x-4">
      <AddBoardButton missionId={missionId} organizationId={orgId} />
      {missions.length > 0 ? (
        <ListBoards
          boards={missions}
          hasNextPage={hasNextPage}
          loadMore={loadMore}
          pageSize={pageSize}
          orgId={orgId}
        />
      ) : (
        <NoResults />
      )}
    </div>
  );
}
