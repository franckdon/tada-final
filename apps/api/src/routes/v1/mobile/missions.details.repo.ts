import { db } from "../../../lib/db";

export type MissionAccessInfo = {
  // mission flags
  isPublic: boolean;
  isPublish: boolean;
  publishAt: string | null;
  internal: boolean;
  isSuperAdminMission: boolean;

  // assignment for this user
  isAssignedToMe: boolean;
};

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

  // ---- expose for contributor mobile
  contributorConfig: null | {
    title: string;
    description: string;
    gain: string;
    duration: string;
    imageUrl: string | null;
    deadline: string | null;
    geoZones: string[];
    targetSampleSize: number;
  };

  assignment: null | {
    id: string;
    status: string;
    progress: number;
    priority: string;
    assignedAt: string;
    acceptedAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    dueDate: string | null;
  };

  isAssignedToMe: boolean;

  hasResponded: boolean;
  responseCount: number;
  lastRespondedAt: string | null;
};

export async function getMissionAccessInfo(missionId: string, userId: string): Promise<MissionAccessInfo | null> {
  const sql = `
    SELECT
      COALESCE(m."isPublic", true) AS "isPublic",
      m."isPublish" AS "isPublish",
      m."publishAt" AS "publishAt",
      COALESCE(m."internal", false) AS "internal",
      COALESCE(m."isSuperAdminMission", false) AS "isSuperAdminMission",
      (ma."id" IS NOT NULL) AS "isAssignedToMe"
    FROM "mission" m
    LEFT JOIN "mission_assignment" ma
      ON ma."missionId" = m."id"
     AND ma."contributorId" = $2
    WHERE m."id" = $1
    LIMIT 1
  `;
  const r = await db.query<MissionAccessInfo>(sql, [missionId, userId]);
  return r.rows[0] ?? null;
}

export async function getMissionById(missionId: string, userId: string): Promise<MissionDetailsRow | null> {
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
      m."image",

      -- MissionConfigContributor
      mcc."title" AS "mcc_title",
      mcc."description" AS "mcc_description",
      mcc."gain"::text AS "mcc_gain",
      mcc."duration"::text AS "mcc_duration",
      mcc."imageUrl" AS "mcc_imageUrl",
      mcc."deadline" AS "mcc_deadline",
      COALESCE(mcc."geo_zones", ARRAY[]::text[]) AS "mcc_geoZones",
      COALESCE(mcc."targetSampleSize", 0) AS "mcc_targetSampleSize",

      -- MissionAssignment for this user
      ma."id" AS "ma_id",
      ma."status" AS "ma_status",
      ma."progress" AS "ma_progress",
      ma."priority" AS "ma_priority",
      ma."assignedAt" AS "ma_assignedAt",
      ma."acceptedAt" AS "ma_acceptedAt",
      ma."startedAt" AS "ma_startedAt",
      ma."completedAt" AS "ma_completedAt",
      ma."dueDate" AS "ma_dueDate",

      -- SurveyResponse aggregate for this user
      COALESCE(sr."responseCount", 0) AS "sr_responseCount",
      sr."lastRespondedAt" AS "sr_lastRespondedAt"

    FROM "mission" m
    LEFT JOIN "mission_config_contributor" mcc
      ON mcc."missionId" = m."id"
    LEFT JOIN "mission_assignment" ma
      ON ma."missionId" = m."id"
     AND ma."contributorId" = $2

    LEFT JOIN LATERAL (
      SELECT
        COUNT(sr."id")::int AS "responseCount",
        MAX(COALESCE(sr."submittedAt", sr."createdAt")) AS "lastRespondedAt"
      FROM "survey" s
      INNER JOIN "survey_response" sr
        ON sr."surveyId" = s."id"
       AND sr."userId" = $2
      WHERE s."missionId" = m."id"
    ) sr ON true

    WHERE m."id" = $1
    LIMIT 1
  `;

  const r = await db.query<any>(sql, [missionId, userId]);
  const row = r.rows[0];
  if (!row) return null;

  const hasConfig = !!row.mcc_title;
  const isAssignedToMe = !!row.ma_id;
  const responseCount = row.sr_responseCount ?? 0;

  const mission: MissionDetailsRow = {
    id: row.id,
    name: row.name,
    problemSummary: row.problemSummary,
    objectives: row.objectives,
    assumptions: row.assumptions,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    status: row.status,
    internal: row.internal,
    type: row.type,
    isPublic: row.isPublic,
    isSuperAdminMission: row.isSuperAdminMission,
    isPublish: row.isPublish,
    publishAt: row.publishAt,
    mode: row.mode,
    validationStatus: row.validationStatus,
    validationComment: row.validationComment,
    validatedAt: row.validatedAt,
    executiveSummary: row.executiveSummary,
    sampleSummary: row.sampleSummary,
    audiences: row.audiences,
    organizationId: row.organizationId,
    workspaceId: row.workspaceId,
    image: row.image,

    contributorConfig: hasConfig
      ? {
          title: row.mcc_title,
          description: row.mcc_description ?? "",
          gain: row.mcc_gain ?? "0",
          duration: row.mcc_duration ?? "0",
          imageUrl: row.mcc_imageUrl,
          deadline: row.mcc_deadline,
          geoZones: row.mcc_geoZones ?? [],
          targetSampleSize: row.mcc_targetSampleSize ?? 0,
        }
      : null,

    assignment: isAssignedToMe
      ? {
          id: row.ma_id,
          status: row.ma_status ?? "assigned",
          progress: row.ma_progress ?? 0,
          priority: row.ma_priority ?? "medium",
          assignedAt: row.ma_assignedAt,
          acceptedAt: row.ma_acceptedAt,
          startedAt: row.ma_startedAt,
          completedAt: row.ma_completedAt,
          dueDate: row.ma_dueDate,
        }
      : null,

    isAssignedToMe,

    hasResponded: responseCount > 0,
    responseCount,
    lastRespondedAt: row.sr_lastRespondedAt,
  };

  return mission;
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