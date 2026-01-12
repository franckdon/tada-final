import { db } from "../../../lib/db";

export type MissionDetailsRow = {
  id: string;
  name: string;
  problemSummary: string | null;
  objectives: string | null;
  assumptions: string | null;

  createdAt: string;
  updatedAt: string | null;

  status: string | null;
  internal: boolean; // normalized
  type: string | null;

  isPublic: boolean; // normalized
  isSuperAdminMission: boolean; // normalized
  isPublish: boolean;

  publishAt: string | null;

  mode: string;
  validationStatus: string | null;
  validationComment: string | null;
  validatedAt: string | null;

  executiveSummary: string | null;
  sampleSummary: string | null;

  audiences: any | null;

  organizationId: string | null;
  workspaceId: string | null;

  image: string | null;
};

export async function getMissionById(id: string): Promise<MissionDetailsRow | null> {
  const sql = `
    SELECT
      m."id",
      m."name",
      m."problemSummary",
      m."objectives",
      m."assumptions",
      m."createdAt",
      m."updatedAt",
      m."status",

      COALESCE(m."internal", false) AS "internal",
      m."type",

      COALESCE(m."isPublic", true) AS "isPublic",
      COALESCE(m."isSuperAdminMission", false) AS "isSuperAdminMission",

      m."isPublish",
      m."publishAt",
      m."mode",
      m."validationStatus",
      m."validationComment",
      m."validatedAt",
      m."executiveSummary",
      m."sampleSummary",
      m."audiences",
      m."organizationId",
      m."workspaceId",
      m."image"
    FROM "mission" m
    WHERE m."id" = $1
    LIMIT 1
  `;
  const r = await db.query<MissionDetailsRow>(sql, [id]);
  return r.rows[0] ?? null;
}

export async function getOrganizationMini(id: string) {
  const sql = `
    SELECT o."id", o."name"
    FROM "organization" o
    WHERE o."id" = $1
    LIMIT 1
  `;
  const r = await db.query<{ id: string; name: string }>(sql, [id]);
  return r.rows[0] ?? null;
}

export async function getWorkspaceMini(id: string) {
  const sql = `
    SELECT w."id", w."name"
    FROM "workspace" w
    WHERE w."id" = $1
    LIMIT 1
  `;
  const r = await db.query<{ id: string; name: string }>(sql, [id]);
  return r.rows[0] ?? null;
}

export async function getMissionCharts(missionId: string) {
  const sql = `
    SELECT
      c."id",
      c."type",
      c."title",
      c."data",
      c."createdAt"
    FROM "mission_chart" c
    WHERE c."missionId" = $1
    ORDER BY c."createdAt" DESC
    LIMIT 200
  `;
  try {
    const r = await db.query<any>(sql, [missionId]);
    return r.rows;
  } catch {
    return [];
  }
}

export async function getMissionCommentsMini(missionId: string, limit = 20) {
  const sql = `
    SELECT
      c."id",
      c."content",
      c."createdAt",
      c."userId"
    FROM "comment" c
    WHERE c."missionId" = $1
    ORDER BY c."createdAt" DESC
    LIMIT $2
  `;
  try {
    const r = await db.query<any>(sql, [missionId, limit]);
    return r.rows;
  } catch {
    return [];
  }
}
