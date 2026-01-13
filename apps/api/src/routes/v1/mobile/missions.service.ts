import * as repo from "./missions.repo";
import type { MissionsListQuery } from "./missions.schemas";
import { ServiceResult } from "./mobile.types";

// Types de données retournées par la fonction listMissions
export async function listMissions(
  userId: string,
  query: MissionsListQuery,
): Promise<ServiceResult<MissionsListData>> {
  // Ici tu peux brancher ta logique d’autorisations (ex: rôle user vs admin)

  const { items, total } = await repo.listMissions(query);

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
