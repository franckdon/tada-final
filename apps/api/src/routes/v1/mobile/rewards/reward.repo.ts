// apps/api/src/routes/v1/mobile/rewards/profile-modules/rewards.repo.ts
import { db } from "../../../../lib/db";

export async function insertLedgerCredit(params: {
  accountPkId: string; // on le traite comme string, même si c'est un uuid "texte"
  amount: string; // bigint string
  currency: string;
  reason: string;
  description?: string;
  referenceType?: string;
  referenceId: string; // uuid string (valide)
  idempotencyKey: string;
}): Promise<{ kind: "inserted" | "exists"; txId: string; balanceAfter: string }> {
  const {
    accountPkId,
    amount,
    currency,
    reason,
    description,
    referenceType,
    referenceId,
    idempotencyKey,
  } = params;

  const sql = `
    WITH computed AS (
      SELECT
        a.id::text AS account_id,
        $2::bigint AS amount,
        $3::text AS currency,
        $4::text AS reason,
        $5::text AS description,
        $6::text AS reference_type,
        $7::uuid AS reference_id,
        $8::text AS idempotency_key,
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
        account_id,               -- ✅ text
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

  const ins = await db.query<{ txId: string; balanceAfter: string }>(sql, [
    accountPkId,                 // $1::text
    amount,
    currency,
    reason,
    description ?? null,
    referenceType ?? null,
    referenceId,                 // $7::uuid (doit être un vrai uuid)
    idempotencyKey,
  ]);

  const inserted = ins.rows[0];

  if (inserted) {
    // ✅ update balance - même stratégie: comparaison en text
    await db.query(
      `update "account" set "balance" = $2::bigint where id::text = $1::text`,
      [accountPkId, inserted.balanceAfter],
    );

    return { kind: "inserted", txId: inserted.txId, balanceAfter: inserted.balanceAfter };
  }

  const existing = await db.query<{ txId: string; balanceAfter: string }>(
    `select "id"::text as "txId", "balanceAfter"::text as "balanceAfter"
     from "account_balance_transaction"
     where "idempotencyKey" = $1
     limit 1`,
    [idempotencyKey],
  );

  const row = existing.rows[0];
  return { kind: "exists", txId: row?.txId ?? "", balanceAfter: row?.balanceAfter ?? "0" };
}
