import * as repo from "./missions.repo";
import type { MissionsListQuery } from "./missions.schemas";
import { ServiceResult } from "./mobile.types";

type MissionListItem = Awaited<ReturnType<typeof repo.listMissions>>["items"][number];

export type MissionsListData = {
  items: MissionListItem[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export async function listMissions(
  userId: string,
  query: MissionsListQuery,
): Promise<ServiceResult<MissionsListData>> {
  const { items, total } = await repo.listMissions(userId, query);

  const page = query.page;
  const pageSize = query.pageSize;
  const pageCount = Math.ceil(total / pageSize);

  return {
    ok: true as const,
    data: {
      items,
      meta: {
        total,
        page,
        pageSize,
        pageCount,
        hasNextPage: page < pageCount,
        hasPrevPage: page > 1,
      },
    },
  };
}
