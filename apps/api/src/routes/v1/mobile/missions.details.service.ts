import type { MissionDetailsQuery } from "./missions.details.schemas";
import * as repo from "./missions.details.repo";
import { env } from "../../../env";

function canViewMissionMobilePublic(m: {
  isPublic: boolean;
  isPublish: boolean;
  publishAt: string | null;
  internal: boolean;
  isSuperAdminMission: boolean;
}) {
  if (m.isSuperAdminMission) return { ok: false as const, reason: "SUPERADMIN_ONLY" };
  if (m.internal) return { ok: false as const, reason: "MISSION_INTERNAL" };
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
  // 1) Access info (assignment + flags)
  const accessInfo = await repo.getMissionAccessInfo(id, userId);
  if (!accessInfo) return { ok: false as const, status: 404, message: "Mission introuvable" };

  // 2) Authorization:
  // - if assigned => allow
  // - else apply public policy
  if (!accessInfo.isAssignedToMe) {
    const access = canViewMissionMobilePublic(accessInfo);
    if (!access.ok) {
      const msg =
        env.NODE_ENV === "production" ? "Accès interdit" : `Accès interdit (${access.reason})`;
      return { ok: false as const, status: 403, message: msg };
    }
  }

  // 3) Mission details (includes config + assignment + response status for this user)
  const mission = await repo.getMissionById(id, userId);
  if (!mission) return { ok: false as const, status: 404, message: "Mission introuvable" };

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