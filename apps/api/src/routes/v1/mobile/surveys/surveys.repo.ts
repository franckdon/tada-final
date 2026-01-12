import { db } from "../../../../lib/db";
import type { SurveysListQuery } from "./surveys.schemas";

export type SurveyRow = {
  id: string;
  name: string;
  description: string | null;
  missionId: string | null;
  createdAt: string;
  updatedAt: string | null;
  questions: any | null; // json
};

function buildOrderBy(q: SurveysListQuery) {
  const sortMap: Record<SurveysListQuery["sortBy"], string> = {
    createdAt: `s."createdAt"`,
    updatedAt: `s."updatedAt"`,
    name: `s."name"`,
  };
  const col = sortMap[q.sortBy];
  const dir = q.sortDir === "asc" ? "ASC" : "DESC";
  return `ORDER BY ${col} ${dir}, s."id" ASC`;
}

function buildWhere(missionId: string, q: SurveysListQuery) {
  const clauses: string[] = [`s."missionId" = $1`];
  const params: any[] = [missionId];

  const add = (sql: string, ...values: any[]) => {
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

export async function listSurveysByMission(missionId: string, q: SurveysListQuery) {
  const { whereSql, params } = buildWhere(missionId, q);
  const orderBy = buildOrderBy(q);

  const limit = q.pageSize;
  const offset = (q.page - 1) * q.pageSize;

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM "survey" s
    ${whereSql}
  `;
  const countRes = await db.query<{ total: number }>(countSql, params);
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
  const dataRes = await db.query<SurveyRow>(dataSql, [...params, limit, offset]);

  return { items: dataRes.rows, total };
}

export async function getSurveyById(id: string, includeQuestions: boolean) {
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
  const r = await db.query<SurveyRow>(sql, [id]);
  return r.rows[0] ?? null;
}

export async function getSurveyQuestions(id: string) {
  const sql = `
    SELECT s."questions"
    FROM "survey" s
    WHERE s."id" = $1
    LIMIT 1
  `;
  const r = await db.query<{ questions: any | null }>(sql, [id]);
  return r.rows[0]?.questions ?? null;
}
