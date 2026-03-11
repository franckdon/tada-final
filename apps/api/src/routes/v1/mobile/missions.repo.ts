import { db } from "../../../lib/db";
import type { MissionsListQuery } from "./missions.schemas";

type MissionRow = {
  id: string;
  name: string;
  status: string | null;
  type: string | null;

  internal: boolean;
  isPublic: boolean;
  isSuperAdminMission: boolean;

  isPublish: boolean;
  publishAt: string | null;

  mode: string;
  validationStatus: string | null;
  validationComment: string | null;

  createdAt: string;
  updatedAt: string | null;

  organizationId: string | null;
  workspaceId: string | null;

  image: string | null;
  executiveSummary: string | null;

  zone: string | null;

  // ---- MissionConfigContributor
  mcc_title: string | null;
  mcc_description: string | null;
  mcc_gain: string | null; // bigint->text
  mcc_duration: string | null; // bigint->text
  mcc_imageUrl: string | null;
  mcc_deadline: string | null;
  mcc_geoZones: string[] | null;
  mcc_targetSampleSize: number | null;

  // ---- MissionAssignment (for this user)
  ma_id: string | null;
  ma_status: string | null;
  ma_progress: number | null;
  ma_priority: string | null;
  ma_assignedAt: string | null;
  ma_acceptedAt: string | null;
  ma_startedAt: string | null;
  ma_completedAt: string | null;
  ma_dueDate: string | null;

  // ---- Survey responses (for this user)
  sr_responseCount: number | null;
  sr_lastRespondedAt: string | null;
};

function buildWhere(q: MissionsListQuery) {
  const clauses: string[] = [];
  const params: any[] = [];

  const add = (sql: string, ...values: any[]) => {
    params.push(...values);
    const startIndex = params.length - values.length + 1;
    let i = 0;
    clauses.push(sql.replace(/\?/g, () => `$${startIndex + i++}`));
  };

  const isAssignedFeed = q.assigned === "assigned";

  // ----------------------------------------------------
  // Default mobile visibility policy (PUBLIC)
  // Apply ONLY for public feeds (all/unassigned).
  // For assigned=assigned, we want all assigned missions even if not published/internal/future/etc.
  // ----------------------------------------------------
  if (!isAssignedFeed) {
    if (typeof q.isPublic !== "boolean") add(`COALESCE(m."isPublic", true) = true`);
    if (typeof q.isPublished !== "boolean") add(`m."isPublish" = true`);
    if (typeof q.internal !== "boolean") add(`COALESCE(m."internal", false) = false`);
    if (typeof q.isSuperAdminMission !== "boolean") add(`COALESCE(m."isSuperAdminMission", false) = false`);
    if (!q.publishAt && !q.publishFrom && !q.publishTo)
      add(`(m."publishAt" IS NULL OR m."publishAt" <= now())`);

    // default status for available missions feed
    if (!q.status) add(`m."status" = 'live'`);
  }

  // ----------------------------------------------------
  // Search
  // ----------------------------------------------------
  if (q.q) add(`(m."name" ILIKE ? OR m."problemSummary" ILIKE ?)`, `%${q.q}%`, `%${q.q}%`);

  // ----------------------------------------------------
  // Explicit filters (always respected)
  // ----------------------------------------------------
  if (q.status) add(`m."status" = ?`, q.status);
  if (typeof q.internal === "boolean") add(`COALESCE(m."internal", false) = ?`, q.internal);
  if (q.type) add(`m."type" = ?`, q.type);

  if (typeof q.isPublic === "boolean") add(`COALESCE(m."isPublic", true) = ?`, q.isPublic);
  if (typeof q.isSuperAdminMission === "boolean")
    add(`COALESCE(m."isSuperAdminMission", false) = ?`, q.isSuperAdminMission);

  if (typeof q.isPublished === "boolean") add(`m."isPublish" = ?`, q.isPublished);

  if (q.mode) add(`m."mode" = ?`, q.mode);
  if (q.validationStatus) add(`m."validationStatus" = ?`, q.validationStatus);

  if (q.organizationId) add(`m."organizationId" = ?`, q.organizationId);
  if (q.workspaceId) add(`m."workspaceId" = ?`, q.workspaceId);

  // publishAt filters
  if (q.publishAt) {
    add(`m."publishAt" = ?::timestamptz`, q.publishAt.toISOString());
  } else if (q.publishFrom || q.publishTo) {
    if (q.publishFrom) add(`m."publishAt" >= ?::timestamptz`, q.publishFrom.toISOString());
    if (q.publishTo) add(`m."publishAt" <= ?::timestamptz`, q.publishTo.toISOString());
  }

  if (q.zone) add(`m."zone" = ?`, q.zone);

  const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { whereSql, params };
}

function buildOrderBy(q: MissionsListQuery) {
  const sortMap: Record<MissionsListQuery["sortBy"], string> = {
    createdAt: `m."createdAt"`,
    updatedAt: `m."updatedAt"`,
    publishAt: `m."publishAt"`,
    name: `m."name"`,
  };

  const col = sortMap[q.sortBy];
  const dir = q.sortDir === "asc" ? "ASC" : "DESC";

  return `ORDER BY ${col} ${dir}, m."id" ASC`;
}

export async function listMissions(userId: string, q: MissionsListQuery) {
  const { whereSql, params } = buildWhere(q);
  const orderBy = buildOrderBy(q);

  const limit = q.pageSize;
  const offset = (q.page - 1) * q.pageSize;

  // ----------------------------------------------------
  // APPLY assigned filter
  // ----------------------------------------------------
  const joinMa = q.assigned === "assigned" ? "INNER JOIN" : "LEFT JOIN";
  const extraAssignedWhere = q.assigned === "unassigned" ? `AND ma."id" IS NULL` : "";
  const whereFinal = whereSql ? `${whereSql} ${extraAssignedWhere}` : `WHERE 1=1 ${extraAssignedWhere}`;

  // ----------------------------------------------------
  // count (must include the same join if you filter on ma)
  // ----------------------------------------------------
  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM "mission" m
    LEFT JOIN "mission_config_contributor" mcc
      ON mcc."missionId" = m."id"
    ${joinMa} "mission_assignment" ma
      ON ma."missionId" = m."id"
     AND ma."contributorId" = $${params.length + 1}
    ${whereFinal}
  `;
  const countRes = await db.query<{ total: number }>(countSql, [...params, userId]);
  const total = countRes.rows[0]?.total ?? 0;

  // ----------------------------------------------------
  // data
  // ----------------------------------------------------
  const dataSql = `
    SELECT
      m."id",
      m."name",
      m."problemSummary",
      m."status",
      m."type",
      COALESCE(m."internal", false) AS "internal",
      COALESCE(m."isPublic", true) AS "isPublic",
      COALESCE(m."isSuperAdminMission", false) AS "isSuperAdminMission",
      m."isPublish",
      m."publishAt",
      m."mode",
      m."validationStatus",
      m."validationComment",
      m."createdAt",
      m."updatedAt",
      m."organizationId",
      m."workspaceId",
      m."image",
      m."executiveSummary",
      m."zone",

      -- MissionConfigContributor
      mcc."title" AS "mcc_title",
      mcc."description" AS "mcc_description",
      mcc."gain"::text AS "mcc_gain",
      mcc."duration"::text AS "mcc_duration",
      mcc."imageUrl" AS "mcc_imageUrl",
      mcc."deadline" AS "mcc_deadline",
      COALESCE(mcc."geo_zones", ARRAY[]::text[]) AS "mcc_geoZones",
      COALESCE(mcc."targetSampleSize", 0) AS "mcc_targetSampleSize",

      -- MissionAssignment for this contributor
      ma."id" AS "ma_id",
      ma."status" AS "ma_status",
      ma."progress" AS "ma_progress",
      ma."priority" AS "ma_priority",
      ma."assignedAt" AS "ma_assignedAt",
      ma."acceptedAt" AS "ma_acceptedAt",
      ma."startedAt" AS "ma_startedAt",
      ma."completedAt" AS "ma_completedAt",
      ma."dueDate" AS "ma_dueDate",

      -- SurveyResponse aggregate for this contributor
      COALESCE(sr."responseCount", 0) AS "sr_responseCount",
      sr."lastRespondedAt" AS "sr_lastRespondedAt"

    FROM "mission" m
    LEFT JOIN "mission_config_contributor" mcc
      ON mcc."missionId" = m."id"
    ${joinMa} "mission_assignment" ma
      ON ma."missionId" = m."id"
     AND ma."contributorId" = $${params.length + 1}

    LEFT JOIN LATERAL (
      SELECT
        COUNT(sr."id")::int AS "responseCount",
        MAX(COALESCE(sr."submittedAt", sr."createdAt")) AS "lastRespondedAt"
      FROM "survey" s
      INNER JOIN "survey_response" sr
        ON sr."surveyId" = s."id"
       AND sr."userId" = $${params.length + 1}
      WHERE s."missionId" = m."id"
    ) sr ON true

    ${whereFinal}
    ${orderBy}
    LIMIT $${params.length + 2}
    OFFSET $${params.length + 3}
  `;

  const dataRes = await db.query<MissionRow>(dataSql, [...params, userId, limit, offset]);

  const items = dataRes.rows.map((m) => {
    const hasConfig = !!m.mcc_title;
    const isAssignedToMe = !!m.ma_id;
    const responseCount = m.sr_responseCount ?? 0;

    return {
      id: m.id,
      name: m.name,
      status: m.status,
      type: m.type,
      image: m.image,
      publishAt: m.publishAt,
      zone: m.zone,

      isPublished: m.isPublish, // API compat

      contributorConfig: hasConfig
        ? {
            title: m.mcc_title!,
            description: m.mcc_description ?? "",
            gain: m.mcc_gain ?? "0",
            duration: m.mcc_duration ?? "0",
            imageUrl: m.mcc_imageUrl,
            deadline: m.mcc_deadline,
            geoZones: m.mcc_geoZones ?? [],
            targetSampleSize: m.mcc_targetSampleSize ?? 0,
          }
        : null,

      assignment: isAssignedToMe
        ? {
            id: m.ma_id!,
            status: m.ma_status ?? "assigned",
            progress: m.ma_progress ?? 0,
            priority: m.ma_priority ?? "medium",
            assignedAt: m.ma_assignedAt!,
            acceptedAt: m.ma_acceptedAt,
            startedAt: m.ma_startedAt,
            completedAt: m.ma_completedAt,
            dueDate: m.ma_dueDate,
          }
        : null,

      isAssignedToMe,

      hasResponded: responseCount > 0,
      responseCount,
      lastRespondedAt: m.sr_lastRespondedAt,
    };
  });

  return { items, total };
}