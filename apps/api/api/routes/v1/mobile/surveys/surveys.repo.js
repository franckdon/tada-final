"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSurveysByMission = listSurveysByMission;
exports.getSurveyById = getSurveyById;
exports.getSurveyQuestions = getSurveyQuestions;
const db_1 = require("../../../../lib/db");
function buildOrderBy(q) {
    const sortMap = {
        createdAt: `s."createdAt"`,
        updatedAt: `s."updatedAt"`,
        name: `s."name"`,
    };
    const col = sortMap[q.sortBy];
    const dir = q.sortDir === "asc" ? "ASC" : "DESC";
    return `ORDER BY ${col} ${dir}, s."id" ASC`;
}
function buildWhere(missionId, q) {
    const clauses = [`s."missionId" = $1`];
    const params = [missionId];
    const add = (sql, ...values) => {
        params.push(...values);
        const startIndex = params.length - values.length + 1;
        let i = 0;
        const withPgParams = sql.replace(/\?/g, () => `$${startIndex + i++}`);
        clauses.push(withPgParams);
    };
    if (q.q) {
        add(`(s."name" ILIKE ? OR s."description" ILIKE ?)`, `%${q.q}%`, `%${q.q}%`);
    }
    const whereSql = `WHERE ${clauses.join(" AND ")}`;
    return { whereSql, params };
}
async function listSurveysByMission(missionId, q) {
    const { whereSql, params } = buildWhere(missionId, q);
    const orderBy = buildOrderBy(q);
    const limit = q.pageSize;
    const offset = (q.page - 1) * q.pageSize;
    const countSql = `
    SELECT COUNT(*)::int AS total
    FROM "survey" s
    ${whereSql}
  `;
    const countRes = await db_1.db.query(countSql, params);
    const total = countRes.rows[0]?.total ?? 0;
    const selectQuestions = q.includeQuestions ? `s."questions"` : `NULL::json AS "questions"`;
    const dataSql = `
    SELECT
      s."id",
      s."name",
      s."description",
      s."missionId",
      s."createdAt",
      s."updatedAt",
      ${selectQuestions}
    FROM "survey" s
    ${whereSql}
    ${orderBy}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;
    const dataRes = await db_1.db.query(dataSql, [...params, limit, offset]);
    return { items: dataRes.rows, total };
}
async function getSurveyById(id, includeQuestions) {
    const sql = `
    SELECT
      s."id",
      s."name",
      s."description",
      s."missionId",
      s."createdAt",
      s."updatedAt",
      ${includeQuestions ? `s."questions"` : `NULL::json AS "questions"`}
    FROM "survey" s
    WHERE s."id" = $1
    LIMIT 1
  `;
    const r = await db_1.db.query(sql, [id]);
    return r.rows[0] ?? null;
}
async function getSurveyQuestions(id) {
    const sql = `
    SELECT s."questions"
    FROM "survey" s
    WHERE s."id" = $1
    LIMIT 1
  `;
    const r = await db_1.db.query(sql, [id]);
    return r.rows[0]?.questions ?? null;
}
