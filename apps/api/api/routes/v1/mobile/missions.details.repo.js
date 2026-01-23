"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMissionById = getMissionById;
exports.getOrganizationMini = getOrganizationMini;
exports.getWorkspaceMini = getWorkspaceMini;
exports.getMissionCharts = getMissionCharts;
exports.getMissionCommentsMini = getMissionCommentsMini;
const db_1 = require("../../../lib/db");
async function getMissionById(id) {
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
    const r = await db_1.db.query(sql, [id]);
    return r.rows[0] ?? null;
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
