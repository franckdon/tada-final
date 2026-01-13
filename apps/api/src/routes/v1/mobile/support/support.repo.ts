import { db } from "../../../../lib/db";
import type { ListTicketsQuery } from "./support.schemas";

export type TicketRow = {
  id: string;
  subject: string | null;
  message: string | null; // initial message (legacy field)
  type: string | null; // category
  priority: string | null;
  status: string;
  userId: string | null;
  createdAt: string;
  // si tu n'as pas updatedAt sur support, on le simulera par createdAt
};

export type TicketMessageRow = {
  id: string;
  ticketId: string;
  userId: string | null;
  content: string;
  createdAt: string;
};

function buildWhere(userId: string, q: ListTicketsQuery) {
  const clauses: string[] = [];
  const params: any[] = [];

  const add = (sql: string, ...values: any[]) => {
    params.push(...values);
    const startIndex = params.length - values.length + 1;
    let i = 0;
    const withPgParams = sql.replace(/\?/g, () => `$${startIndex + i++}`);
    clauses.push(withPgParams);
  };

  // Toujours limiter au user (mobile)
  add(`t."userId" = ?`, userId);

  if (q.q) add(`(t."subject" ILIKE ? OR t."message" ILIKE ?)`, `%${q.q}%`, `%${q.q}%`);
  if (q.status) add(`t."status" = ?`, q.status);
  if (q.category) add(`t."type" = ?`, q.category);
  if (q.priority) add(`t."priority" = ?`, q.priority);

  if (q.createdFrom) add(`t."createdAt" >= ?::timestamptz`, q.createdFrom.toISOString());
  if (q.createdTo) add(`t."createdAt" <= ?::timestamptz`, q.createdTo.toISOString());

  const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { whereSql, params };
}

function buildOrderBy(q: ListTicketsQuery) {
  const sortMap: Record<ListTicketsQuery["sortBy"], string> = {
    createdAt: `t."createdAt"`,
    updatedAt: `t."createdAt"`, // si pas de colonne updatedAt
    subject: `t."subject"`,
    status: `t."status"`,
  };
  const col = sortMap[q.sortBy];
  const dir = q.sortDir === "asc" ? "ASC" : "DESC";
  return `ORDER BY ${col} ${dir}, t."id" ASC`;
}

export async function insertTicket(args: {
  id: string;
  userId: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
}) {
  const sql = `
    INSERT INTO "support" (
      "id",
      "userId",
      "subject",
      "message",
      "type",
      "priority",
      "status"
    )
    VALUES ($1::uuid, $2, $3, $4, $5, $6, $7)
    RETURNING
      "id",
      "subject",
      "message",
      "type",
      "priority",
      "status",
      "userId",
      "createdAt"
  `;
  const r = await db.query<TicketRow>(sql, [
    args.id,
    args.userId,
    args.subject,
    args.message,
    args.category,
    args.priority,
    args.status,
  ]);
  return r.rows[0] ?? null;
}

export async function listTickets(userId: string, q: ListTicketsQuery) {
  const { whereSql, params } = buildWhere(userId, q);
  const orderBy = buildOrderBy(q);

  const limit = q.pageSize;
  const offset = (q.page - 1) * q.pageSize;

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM "support" t
    ${whereSql}
  `;
  const countRes = await db.query<{ total: number }>(countSql, params);
  const total = countRes.rows[0]?.total ?? 0;

  const dataSql = `
    SELECT
      t."id",
      t."subject",
      t."message",
      t."type",
      t."priority",
      t."status",
      t."userId",
      t."createdAt"
    FROM "support" t
    ${whereSql}
    ${orderBy}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;
  const dataRes = await db.query<TicketRow>(dataSql, [...params, limit, offset]);

  return { items: dataRes.rows, total };
}

export async function getTicketById(ticketId: string) {
  const sql = `
    SELECT
      t."id",
      t."subject",
      t."message",
      t."type",
      t."priority",
      t."status",
      t."userId",
      t."createdAt"
    FROM "support" t
    WHERE t."id" = $1::uuid
    LIMIT 1
  `;
  const r = await db.query<TicketRow>(sql, [ticketId]);
  return r.rows[0] ?? null;
}

export async function insertTicketMessage(args: {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
}) {
  const sql = `
    INSERT INTO "support_message" (
      "id",
      "ticketId",
      "userId",
      "content"
    )
    VALUES ($1::uuid, $2::uuid, $3, $4)
    RETURNING
      "id",
      "ticketId",
      "userId",
      "content",
      "createdAt"
  `;
  const r = await db.query<TicketMessageRow>(sql, [
    args.id,
    args.ticketId,
    args.userId,
    args.content,
  ]);
  return r.rows[0] ?? null;
}

export async function listTicketMessages(ticketId: string, page: number, pageSize: number) {
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM "support_message" m
    WHERE m."ticketId" = $1::uuid
  `;
  const countRes = await db.query<{ total: number }>(countSql, [ticketId]);
  const total = countRes.rows[0]?.total ?? 0;

  const dataSql = `
    SELECT
      m."id",
      m."ticketId",
      m."userId",
      m."content",
      m."createdAt"
    FROM "support_message" m
    WHERE m."ticketId" = $1::uuid
    ORDER BY m."createdAt" ASC, m."id" ASC
    LIMIT $2
    OFFSET $3
  `;
  const dataRes = await db.query<TicketMessageRow>(dataSql, [ticketId, limit, offset]);

  return { items: dataRes.rows, total };
}
