
import { db } from "../../../../lib/db";
import type { ListNotificationsQuery } from "./notifications.schemas";
import type { NotificationRow } from "./notifications.types";

function buildWhere(userId: string, q: ListNotificationsQuery) {
  const clauses: string[] = [`n."userId" = $1`];
  const params: any[] = [userId];

  const add = (sql: string, ...values: any[]) => {
    params.push(...values);
    const startIndex = params.length - values.length + 1;
    let i = 0;
    const withPgParams = sql.replace(/\?/g, () => `$${startIndex + i++}`);
    clauses.push(withPgParams);
  };

  if (q.unreadOnly) add(`n."readAt" IS NULL`);

  if (q.type) add(`n."type" = ?`, q.type);

  if (q.entityType) add(`n."entityType" = ?`, q.entityType);
  if (q.entityId) add(`n."entityId" = ?`, q.entityId);

  if (q.createdFrom) add(`n."createdAt" >= ?::timestamptz`, q.createdFrom.toISOString());
  if (q.createdTo) add(`n."createdAt" <= ?::timestamptz`, q.createdTo.toISOString());

  const whereSql = `WHERE ${clauses.join(" AND ")}`;
  return { whereSql, params };
}

function orderBy(sortDir: "asc" | "desc") {
  const dir = sortDir === "asc" ? "ASC" : "DESC";
  return `ORDER BY n."createdAt" ${dir}, n."id" ASC`;
}

export async function countUnread(userId: string): Promise<number> {
  const sql = `
    SELECT COUNT(*)::int AS total
    FROM "notification" n
    WHERE n."userId" = $1 AND n."readAt" IS NULL
  `;
  const r = await db.query<{ total: number }>(sql, [userId]);
  return r.rows[0]?.total ?? 0;
}

export async function listNotifications(userId: string, q: ListNotificationsQuery) {
  const { whereSql, params } = buildWhere(userId, q);

  const limit = q.pageSize;
  const offset = (q.page - 1) * q.pageSize;

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM "notification" n
    ${whereSql}
  `;
  const countRes = await db.query<{ total: number }>(countSql, params);
  const total = countRes.rows[0]?.total ?? 0;

  const dataSql = `
    SELECT
      n."id",
      n."userId",
      n."type",
      n."title",
      n."body",
      n."data",
      n."entityType",
      n."entityId",
      n."readAt",
      n."createdAt"
    FROM "notification" n
    ${whereSql}
    ${orderBy(q.sortDir)}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;

  const dataRes = await db.query<NotificationRow>(dataSql, [...params, limit, offset]);

  return { rows: dataRes.rows, total };
}

export async function getNotificationById(userId: string, id: string): Promise<NotificationRow | null> {
  const sql = `
    SELECT
      n."id",
      n."userId",
      n."type",
      n."title",
      n."body",
      n."data",
      n."entityType",
      n."entityId",
      n."readAt",
      n."createdAt"
    FROM "notification" n
    WHERE n."userId" = $1 AND n."id" = $2::uuid
    LIMIT 1
  `;
  const r = await db.query<NotificationRow>(sql, [userId, id]);
  return r.rows[0] ?? null;
}

export async function markRead(userId: string, id: string): Promise<boolean> {
  const sql = `
    UPDATE "notification" n
    SET "readAt" = COALESCE(n."readAt", now())
    WHERE n."userId" = $1 AND n."id" = $2::uuid
    RETURNING n."id"
  `;
  const r = await db.query<{ id: string }>(sql, [userId, id]);
  return !!r.rows[0];
}

export async function markReadAll(userId: string): Promise<number> {
  const sql = `
    UPDATE "notification" n
    SET "readAt" = now()
    WHERE n."userId" = $1 AND n."readAt" IS NULL
  `;
  const r = await db.query(sql, [userId]);
  return r.rowCount ?? 0;
}

export async function createNotification(args: {
  userId: string;
  type: string;
  title: string;
  body?: string | null;
  data?: any | null;
  entityType?: string | null;
  entityId?: string | null;
}): Promise<NotificationRow> {
  const {
    userId,
    type,
    title,
    body = null,
    data = null,
    entityType = null,
    entityId = null,
  } = args;

  const sql = `
    INSERT INTO "notification"
      ("userId","type","title","body","data","entityType","entityId","readAt","createdAt")
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,NULL,now())
    RETURNING
      "id","userId","type","title","body","data","entityType","entityId","readAt","createdAt"
  `;

  const r = await db.query<NotificationRow>(sql, [
    userId,
    type,
    title,
    body,
    data,
    entityType,
    entityId,
  ]);

  return r.rows[0]!;
}
