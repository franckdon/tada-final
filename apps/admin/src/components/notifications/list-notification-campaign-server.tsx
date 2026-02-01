import { prisma } from "@/lib/prisma";
import { NotificationCampaignFilter } from "./notification-campaign-filter";
import { ListNotificationCampaigns } from "./list-notification-campaigns";
import { NoResults } from "./no-results";

const pageSize = 10;
const maxItems = 100000;

type CampaignRow = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  channels: any;
  targeting: any;
  status: string;
  scheduledAt: Date | null;
  createdAt: Date;
  createdById: string | null;
  _count: { recipients: number };
};

interface FetchParams {
  query?: string;
  status?: string;
  channel?: string;
  from: number;
  to: number;
  pageSize: number;
}

function fetchCampaigns({
  query,
  status,
  channel,
  from,
  to,
  pageSize,
}: FetchParams) {
  const where: any = {
    ...(query && {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { body: { contains: query, mode: "insensitive" } },
      ],
    }),
    ...(status && status !== "all" ? { status } : {}),
  };

  // Filtre canal (push/web) stocké dans JSON channels: { push: true, web: true }
  if (channel && channel !== "all") {
    where.channels = {
      path: [channel],
      equals: true,
    };
  }

  const skip = from * pageSize;
  const take = (to - from + 1) * pageSize;

  return prisma.notificationCampaign.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    skip,
    take,
    select: {
      id: true,
      title: true,
      body: true,
      type: true,
      channels: true,
      targeting: true,
      status: true,
      scheduledAt: true,
      createdAt: true,
      createdById: true,
      _count: { select: { recipients: true } },
    },
  }) as any as Promise<CampaignRow[]>;
}

export async function ListNotificationCampaignServer({
  query,
  page,
  status,
  channel,
}: {
  query?: string;
  page: number;
  status?: string;
  channel?: string;
}) {
  const hasFilters = Object.values({ query, status, channel }).some(
    (v) => v !== null,
  );

  const campaigns = await fetchCampaigns({
    query,
    status,
    channel,
    from: 0,
    to: hasFilters ? maxItems : page > 0 ? pageSize : pageSize - 1,
    pageSize,
  });

  async function loadMore({ from, to }: { from: number; to: number }) {
    "use server";
    return fetchCampaigns({
      query,
      status,
      channel,
      from: from + 1,
      to,
      pageSize,
    });
  }

  const hasNextPage = Boolean(
    campaigns.length && campaigns.length / (page + 1) > pageSize,
  );

  return (
    <div className="space-y-4">
      <NotificationCampaignFilter />
      {campaigns.length > 0 ? (
        <ListNotificationCampaigns
          campaigns={campaigns}
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
