"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMissionAccessInfo = getMissionAccessInfo;
exports.getMissionById = getMissionById;
exports.getOrganizationMini = getOrganizationMini;
exports.getWorkspaceMini = getWorkspaceMini;
exports.getMissionCharts = getMissionCharts;
exports.getMissionCommentsMini = getMissionCommentsMini;
const db_1 = require("../../../lib/db");
async function getMissionAccessInfo(missionId, userId) {
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
    const r = await db_1.db.query(sql, [missionId, userId]);
    return r.rows[0] ?? null;
}
async function getMissionById(missionId, userId) {
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
      ma."dueDate" AS "ma_dueDate"

    FROM "mission" m
    LEFT JOIN "mission_config_contributor" mcc
      ON mcc."missionId" = m."id"
    LEFT JOIN "mission_assignment" ma
      ON ma."missionId" = m."id"
     AND ma."contributorId" = $2
    WHERE m."id" = $1
    LIMIT 1
  `;
    const r = await db_1.db.query(sql, [missionId, userId]);
    const row = r.rows[0];
    if (!row)
        return null;
    const hasConfig = !!row.mcc_title;
    const isAssignedToMe = !!row.ma_id;
    const mission = {
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
    };
    return mission;
}
async function getOrganizationMini(id) {
    const sql = `
    SELECT o."id", o."name"
    FROM "organization" o
    WHERE o."id" = $1
    LIMIT 1
  `;
    const r = await db_1.db.query(sql, [id]);
    return r.rows[0] ?? null;
}
async function getWorkspaceMini(id) {
    const sql = `
    SELECT w."id", w."name"
    FROM "workspace" w
    WHERE w."id" = $1
    LIMIT 1
  `;
    const r = await db_1.db.query(sql, [id]);
    return r.rows[0] ?? null;
}
async function getMissionCharts(missionId) {
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
        const r = await db_1.db.query(sql, [missionId]);
        return r.rows;
    }
    catch {
        return [];
    }
}
async function getMissionCommentsMini(missionId, limit = 20) {
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
        const r = await db_1.db.query(sql, [missionId, limit]);
        return r.rows;
    }
    catch {
        return [];
    }
}
