"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertLedgerCredit = insertLedgerCredit;
const db_1 = require("../../../../../lib/db");
async function insertLedgerCredit(params) {
    const { accountPkId, amount, currency, description, referenceType, referenceId, idempotencyKey } = params;
    const sql = `
    WITH computed AS (
      SELECT
        a.id::text AS account_id,
        $2::bigint AS amount,
        $3::text AS currency,
        $4::text AS description,
        $5::text AS reference_type,
        $6::uuid AS reference_id,
        $7::text AS idempotency_key,
        (a.balance + $2::bigint)::bigint AS balance_after
      FROM "account" a
      WHERE a.id::text = $1::text
      FOR UPDATE
    ),
    ins AS (
      INSERT INTO "account_balance_transaction"
        ("id", "accountPkId", "amount", "currency", "type", "description",
         "referenceType", "referenceId", "idempotencyKey", "balanceAfter", "createdAt")
      SELECT
        gen_random_uuid(),
        account_id,
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
    const ins = await db_1.db.query(sql, [
        accountPkId, // $1::text
        amount, // $2::bigint
        currency, // $3::text
        description ?? null, // $4::text
        referenceType ?? null, // $5::text
        referenceId, // $6::uuid
        idempotencyKey, // $7::text
    ]);
    const inserted = ins.rows[0];
    if (inserted) {
        await db_1.db.query(`update "account" set "balance" = $2::bigint where id::text = $1::text`, [accountPkId, inserted.balanceAfter]);
        return { kind: "inserted", txId: inserted.txId, balanceAfter: inserted.balanceAfter };
    }
    const existing = await db_1.db.query(`select "id"::text as "txId", "balanceAfter"::text as "balanceAfter"
     from "account_balance_transaction"
     where "idempotencyKey" = $1
     limit 1`, [idempotencyKey]);
    const row = existing.rows[0];
    return { kind: "exists", txId: row?.txId ?? "", balanceAfter: row?.balanceAfter ?? "0" };
}
