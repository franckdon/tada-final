import * as repo from "./missions.repo";
import type { MissionsListQuery } from "./missions.schemas";

export async function listMissions(userId: string, query: MissionsListQuery) {
  // Ici tu peux brancher ta logique d’autorisations (ex: rôle user vs admin)
  // Exemple standard (optionnel):
  // - si user "mobile normal" => forcer isPublic=true et isPublish=true
  // Pour l’instant: pas de restriction supplémentaire.

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
