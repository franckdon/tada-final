import type { MissionDetailsQuery } from "./missions.details.schemas";
import * as repo from "./missions.details.repo";
import { env } from "../../../env";

function canViewMissionMobile(m: {
  isPublic: boolean;
  isPublish: boolean;
  publishAt: string | null;
  //internal: boolean;
  isSuperAdminMission: boolean;
}) {
  //if (m.internal) return { ok: false as const, reason: "MISSION_INTERNAL" };
  if (m.isSuperAdminMission) return { ok: false as const, reason: "SUPERADMIN_ONLY" };
  if (!m.isPublic) return { ok: false as const, reason: "NOT_PUBLIC" };
  if (!m.isPublish) return { ok: false as const, reason: "NOT_PUBLISHED" };

  if (m.publishAt) {
    const t = new Date(m.publishAt).getTime();
    if (!Number.isNaN(t) && t > Date.now()) {
      return { ok: false as const, reason: "PUBLISH_AT_IN_FUTURE" };
    }
  }

  return { ok: true as const };
}

export async function getMissionDetails(userId: string, id: string, query: MissionDetailsQuery) {
  const mission = await repo.getMissionById(id);
  if (!mission) return { ok: false as const, status: 404, message: "Mission introuvable" };

  const access = canViewMissionMobile(mission);
  if (!access.ok) {
    const msg =
      env.NODE_ENV === "production"
        ? "Accès interdit"
        : `Accès interdit (${access.reason})`; // très utile en dev
    return { ok: false as const, status: 403, message: msg };
  }

  const [organization, workspace, charts, comments] = await Promise.all([
    query.includeOrganization && mission.organizationId
      ? repo.getOrganizationMini(mission.organizationId)
      : Promise.resolve(null),

    query.includeWorkspace && mission.workspaceId
      ? repo.getWorkspaceMini(mission.workspaceId)
      : Promise.resolve(null),

    query.includeCharts ? repo.getMissionCharts(id) : Promise.resolve([]),

    query.includeComments ? repo.getMissionCommentsMini(id, 20) : Promise.resolve([]),
  ]);

  return {
    ok: true as const,
    data: {
      mission: {
        ...mission,
        isPublished: mission.isPublish,
      },
      organization,
      workspace,
      charts,
      comments,
    },
  };
}
