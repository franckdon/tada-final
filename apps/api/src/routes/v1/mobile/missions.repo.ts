import { db } from "../../../lib/db";
import type { MissionsListQuery } from "./missions.schemas";

type MissionRow = {
  id: string;
  name: string;
  status: string | null;
  type: string | null;

  internal: boolean; // normalized
  isPublic: boolean; // normalized
  isSuperAdminMission: boolean; // normalized

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
};

function buildWhere(q: MissionsListQuery) {
  const clauses: string[] = [];
  const params: any[] = [];

  const add = (sql: string, ...values: any[]) => {
    params.push(...values);
    const startIndex = params.length - values.length + 1;

    let i = 0;
    const withPgParams = sql.replace(/\?/g, () => `$${startIndex + i++}`);
    clauses.push(withPgParams);
  };

  // ----------------------------------------------------
  // Default mobile visibility policy (PUBLIC)
  // Apply ONLY when caller did not explicitly request the filter.
  // ----------------------------------------------------
  if (typeof q.isPublic !== "boolean") {
    add(`COALESCE(m."isPublic", true) = true`);
  }
  if (typeof q.isPublished !== "boolean") {
    add(`m."isPublish" = true`);
  }
  if (typeof q.internal !== "boolean") {
    add(`COALESCE(m."internal", false) = false`);
  }
  if (typeof q.isSuperAdminMission !== "boolean") {
    add(`COALESCE(m."isSuperAdminMission", false) = false`);
  }
  if (!q.publishAt && !q.publishFrom && !q.publishTo) {
    add(`(m."publishAt" IS NULL OR m."publishAt" <= now())`);
  }

  // ----------------------------------------------------
  // Search
  // ----------------------------------------------------
  if (q.q) {
    add(`(m."name" ILIKE ? OR m."problemSummary" ILIKE ?)`, `%${q.q}%`, `%${q.q}%`);
  }

  // ----------------------------------------------------
  // Explicit filters (override policy because they are added AFTER policy)
  // NOTE: They will narrow results further when combined.
  // If you want "override" behavior instead of AND, we can implement a different strategy.
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

export async function listMissions(q: MissionsListQuery) {
  const { whereSql, params } = buildWhere(q);
  const orderBy = buildOrderBy(q);

  const limit = q.pageSize;
  const offset = (q.page - 1) * q.pageSize;

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM "mission" m
    ${whereSql}
  `;
  const countRes = await db.query<{ total: number }>(countSql, params);
  const total = countRes.rows[0]?.total ?? 0;

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
      m."executiveSummary"
    FROM "mission" m
    ${whereSql}
    ${orderBy}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  const dataRes = await db.query<MissionRow>(dataSql, [...params, limit, offset]);

  const items = dataRes.rows.map((m) => ({
    ...m,
    isPublished: m.isPublish, // API normalisation
  }));

  return { items, total };
}
