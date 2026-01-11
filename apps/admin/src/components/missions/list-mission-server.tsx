import { prisma } from "@/lib/prisma";
import { NoResults } from "./empty-states";
import { ListMissions } from "./list-missions";
import { MissionFilter } from "./mission-filter";

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
    ...(date && { createdAt: { gte: new Date(date) } }),
    // ...(status && status !== "all" && { status }),
    status: {
      in: ["completed", "live"],
    },
  };

  const orderByClause = sort.map((s) => ({ [s]: "asc" }));

  const skip = from * pageSize;
  const take = (to - from + 1) * pageSize;

  return prisma.mission.findMany({
    where: whereClause,
    orderBy: orderByClause,
    skip,
    take,
    include: {
      survey: {
        include: {
          response: {
            where: {
              status: "completed",
            },
          },
        },
      },
    },
  });
}

export async function ListMissionServer({
  query,
  sort,
  page,
  status,
  date,
}: {
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
      <MissionFilter />
      {missions.length > 0 ? (
        <ListMissions
          missions={missions}
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
