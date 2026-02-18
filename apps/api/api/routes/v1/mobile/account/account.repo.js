"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findWalletAccountBalance = findWalletAccountBalance;
exports.findAccountForUpdate = findAccountForUpdate;
exports.creditAccountInTx = creditAccountInTx;
// src/routes/v1/mobile/account/account.repo.ts
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
/**
 * Lock FOR UPDATE du compte wallet (dans une transaction)
 */
async function findAccountForUpdate(params) {
    const { userId, providerId } = params;
    if (providerId) {
        const sql = `
      SELECT a."id", a."providerId", a."userId", a."balance"::text AS "balance", a."currency"
      FROM "account" a
      WHERE a."userId" = $1 AND a."providerId" = $2
      FOR UPDATE
      LIMIT 1
    `;
        const res = await db_1.db.query(sql, [userId, providerId]);
        return res.rows[0] ?? null;
    }
    const sql = `
    SELECT a."id", a."providerId", a."userId", a."balance"::text AS "balance", a."currency"
    FROM "account" a
    WHERE a."userId" = $1 AND a."providerId" = ANY($2::text[])
    ORDER BY array_position($2::text[], a."providerId") ASC
    FOR UPDATE
    LIMIT 1
  `;
    const res = await db_1.db.query(sql, [userId, PROVIDER_PRIORITY]);
    return res.rows[0] ?? null;
}
async function creditAccountInTx(params) {
    const { accountPkId, amount, currency, reason, description, referenceType, referenceId, idempotencyKey, } = params;
    // 1) read current balance with lock
    const balRes = await db_1.db.query(`SELECT "balance"::text AS "balance" FROM "account" WHERE "id" = $1::uuid FOR UPDATE`, [accountPkId]);
    const balanceBefore = balRes.rows[0]?.balance ?? "0";
    const insertSql = `
    WITH computed AS (
      SELECT
        $1::uuid AS account_id,
        $2::bigint AS amount,
        $3::text AS currency,
        $4::text AS reason,
        $5::text AS description,
        $6::text AS reference_type,
        $7::uuid AS reference_id,
        $8::text AS idempotency_key,
        ("balance" + $2::bigint)::bigint AS balance_after
      FROM "account"
      WHERE "id" = $1::uuid
      FOR UPDATE
    ),
    ins AS (
      INSERT INTO "account_balance_transaction"
        ("id", "accountPkId", "amount", "currency", "type", "description",
         "referenceType", "referenceId", "idempotencyKey", "balanceAfter", "createdAt")
      SELECT
        gen_random_uuid(),
        account_id::text,
        amount,
        currency,
        'credit',
        NULLIF(description, ''),
        NULLIF(reference_type, ''),
        reference_id,
        idempotency_key,
        balance_after,
        now()
      FROM computed
      ON CONFLICT ("idempotencyKey") DO NOTHING
      RETURNING "id"::text AS "txId", "balanceAfter"::text AS "balanceAfter"
    )
    SELECT * FROM ins
  `;
    // IMPORTANT: si pas de referenceId => NULL (et PAS string vide)
    const referenceIdUuidOrNull = referenceId ?? null;
    const insRes = await db_1.db.query(insertSql, [
        accountPkId,
        amount,
        currency,
        reason,
        description ?? null,
        referenceType ?? null,
        referenceIdUuidOrNull,
        idempotencyKey,
    ]);
    const inserted = insRes.rows[0];
    if (inserted) {
        await db_1.db.query(`UPDATE "account" SET "balance" = $2::bigint WHERE "id" = $1::uuid`, [
            accountPkId,
            inserted.balanceAfter,
        ]);
        return { kind: "inserted", balanceAfter: inserted.balanceAfter, txId: inserted.txId };
    }
    const existingRes = await db_1.db.query(`
    SELECT "id"::text AS "txId", "balanceAfter"::text AS "balanceAfter"
    FROM "account_balance_transaction"
    WHERE "idempotencyKey" = $1
    LIMIT 1
  `, [idempotencyKey]);
    const existing = existingRes.rows[0];
    if (!existing)
        return { kind: "exists", balanceAfter: balanceBefore, txId: "" };
    return { kind: "exists", balanceAfter: existing.balanceAfter, txId: existing.txId };
}
