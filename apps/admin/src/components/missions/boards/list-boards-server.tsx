import { prisma } from "@/lib/prisma";
import { NoResults } from "../empty-states";
import { ListMissions } from "../list-missions";
import { MissionFilter } from "../mission-filter";
import { AddBoardButton } from "./add-board-button";
import { ListBoards } from "./list-boards";

const pageSize = 10;
const maxItems = 100000;

interface FetchMissionsParams {
  query?: string;
  status?: string;
  date?: string;
  from: number; // Starting page number
  to: number; // Ending page number
  pageSize: number;
  sort?: string[];
}

function fetchMissions({
  query,
  status,
  date,
  from,
  to,
  pageSize,
  sort = [],
}: FetchMissionsParams) {
  const whereClause = {
    ...(query && { name: { contains: query } }),
    ...(status && status !== "all" && { status }),
    ...(date && { createdAt: { gte: new Date(date) } }),
  };

  const orderByClause = sort.map((s) => ({ [s]: "asc" }));

  const skip = from * pageSize;
  const take = (to - from + 1) * pageSize;

  return prisma.mission.findMany({
    where: whereClause,
    orderBy: orderByClause,
    skip,
    take,
  });
}

export async function ListBoardsServer({
  missionId,
  query,
  sort,
  page,
  status,
  date,
}: {
  missionId: string;
  query?: string;
  sort?: string[];
  page: number;
  status?: string;
  date?: string;
}) {
  const hasFilters = Object.values({ query, status, date }).some(
    (value) => value !== null
  );
  const missions = await fetchMissions({
    query,
    status,
    date,
    from: 0,
    to: hasFilters ? maxItems : page > 0 ? pageSize : pageSize - 1,
    pageSize,
    sort,
  });

  async function loadMore({ from, to }: { from: number; to: number }) {
    "use server";

    return fetchMissions({
      query,
      status,
      date,
      from: from + 1,
      to,
      pageSize,
      sort,
    });
  }

  const hasNextPage = Boolean(
    missions.length && missions.length / (page + 1) > pageSize
  );

  return (
    <div className="space-x-4 ">
      <AddBoardButton missionId={missionId} />
      {missions.length > 0 ? (
        <ListBoards
          boards={missions}
          hasNextPage={hasNextPage}
          loadMore={loadMore}
          pageSize={pageSize}
        />
      ) : (
        <NoResults />
      )}
    </div>
  );
}
