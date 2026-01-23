"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTicket = insertTicket;
exports.listTickets = listTickets;
exports.getTicketById = getTicketById;
exports.insertTicketMessage = insertTicketMessage;
exports.listTicketMessages = listTicketMessages;
const db_1 = require("../../../../lib/db");
function buildWhere(userId, q) {
    const clauses = [];
    const params = [];
    const add = (sql, ...values) => {
        params.push(...values);
        const startIndex = params.length - values.length + 1;
        let i = 0;
        const withPgParams = sql.replace(/\?/g, () => `$${startIndex + i++}`);
        clauses.push(withPgParams);
    };
    // Toujours limiter au user (mobile)
    add(`t."userId" = ?`, userId);
    if (q.q)
        add(`(t."subject" ILIKE ? OR t."message" ILIKE ?)`, `%${q.q}%`, `%${q.q}%`);
    if (q.status)
        add(`t."status" = ?`, q.status);
    if (q.category)
        add(`t."type" = ?`, q.category);
    if (q.priority)
        add(`t."priority" = ?`, q.priority);
    if (q.createdFrom)
        add(`t."createdAt" >= ?::timestamptz`, q.createdFrom.toISOString());
    if (q.createdTo)
        add(`t."createdAt" <= ?::timestamptz`, q.createdTo.toISOString());
    const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    return { whereSql, params };
}
function buildOrderBy(q) {
    const sortMap = {
        createdAt: `t."createdAt"`,
        updatedAt: `t."createdAt"`, // si pas de colonne updatedAt
        subject: `t."subject"`,
        status: `t."status"`,
    };
    const col = sortMap[q.sortBy];
    const dir = q.sortDir === "asc" ? "ASC" : "DESC";
    return `ORDER BY ${col} ${dir}, t."id" ASC`;
}
async function insertTicket(args) {
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
    const r = await db_1.db.query(sql, [
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
async function listTickets(userId, q) {
    const { whereSql, params } = buildWhere(userId, q);
    const orderBy = buildOrderBy(q);
    const limit = q.pageSize;
    const offset = (q.page - 1) * q.pageSize;
    const countSql = `
    SELECT COUNT(*)::int AS total
    FROM "support" t
    ${whereSql}
  `;
    const countRes = await db_1.db.query(countSql, params);
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
    const dataRes = await db_1.db.query(dataSql, [...params, limit, offset]);
    return { items: dataRes.rows, total };
}
async function getTicketById(ticketId) {
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
    const r = await db_1.db.query(sql, [ticketId]);
    return r.rows[0] ?? null;
}
async function insertTicketMessage(args) {
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
    const r = await db_1.db.query(sql, [
        args.id,
        args.ticketId,
        args.userId,
        args.content,
    ]);
    return r.rows[0] ?? null;
}
async function listTicketMessages(ticketId, page, pageSize) {
    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    const countSql = `
    SELECT COUNT(*)::int AS total
    FROM "support_message" m
    WHERE m."ticketId" = $1::uuid
  `;
    const countRes = await db_1.db.query(countSql, [ticketId]);
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
    const dataRes = await db_1.db.query(dataSql, [ticketId, limit, offset]);
    return { items: dataRes.rows, total };
}
