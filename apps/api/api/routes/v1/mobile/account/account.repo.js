"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findWalletAccountBalance = findWalletAccountBalance;
const db_1 = require("../../../../lib/db");
const PROVIDER_PRIORITY = ["mobile_credentials", "mobile", "credential", "google"];
async function findWalletAccountBalance(params) {
    const { userId, providerId } = params;
    if (providerId) {
        const sql = `
      SELECT a."id", a."providerId", a."balance"::text AS "balance", a."currency"
      FROM "account" a
      WHERE a."userId" = $1 AND a."providerId" = $2
      LIMIT 1
    `;
        const res = await db_1.db.query(sql, [userId, providerId]);
        return res.rows[0] ?? null;
    }
    // fallback priorité providers
    const sql = `
    SELECT a."id", a."providerId", a."balance"::text AS "balance", a."currency"
    FROM "account" a
    WHERE a."userId" = $1 AND a."providerId" = ANY($2::text[])
    ORDER BY array_position($2::text[], a."providerId") ASC
    LIMIT 1
  `;
    const res = await db_1.db.query(sql, [userId, PROVIDER_PRIORITY]);
    return res.rows[0] ?? null;
}
