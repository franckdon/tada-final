"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPayoutAccountForUser = findPayoutAccountForUser;
exports.sumReservedWithdrawalsInTx = sumReservedWithdrawalsInTx;
exports.insertWithdrawalRequestInTx = insertWithdrawalRequestInTx;
exports.findWithdrawalByIdForUpdate = findWithdrawalByIdForUpdate;
exports.cancelWithdrawalInTx = cancelWithdrawalInTx;
exports.findWithdrawalByIdempotencyKey = findWithdrawalByIdempotencyKey;
exports.listWithdrawals = listWithdrawals;
// src/routes/v1/mobile/withdrawals/withdrawals.repo.ts
const db_1 = require("../../../../lib/db");
/**
 * NOTE:
 * - payout_account semble être en camelCase chez toi ("userId", "deletedAt", etc.)
 * - si en DB c'est snake_case, adapte ici aussi.
 *
 * Robust: comparaison en ::text pour éviter uuid/text mismatch.
 */
async function findPayoutAccountForUser(params) {
    const { userId, payoutAccountId } = params;
    const sql = `
    SELECT
      p."id"::text AS "id",
      p."userId"::text AS "userId",
      p."type"::text AS "type",
      p."label"::text AS "label",
      p."provider"::text AS "provider",
      p."country"::text AS "country",
      p."dialCode"::text AS "dialCode",
      p."phone"::text AS "phone",
      p."bankName"::text AS "bankName",
      p."rib"::text AS "rib",
      p."iban"::text AS "iban",
      p."bic"::text AS "bic",
      p."isDefault" AS "isDefault",
      p."deletedAt"::text AS "deletedAt"
    FROM "payout_account" p
    WHERE p."id"::text = $1::text
      AND p."userId"::text = $2::text
      AND p."deletedAt" IS NULL
    LIMIT 1
  `;
    const res = await db_1.db.query(sql, [payoutAccountId, userId]);
    return res.rows[0] ?? null;
}
async function sumReservedWithdrawalsInTx(params) {
    const { userId, accountPkId } = params;
    // reserved = pending + approved
    // Robust: comparaison en ::text
    const sql = `
    SELECT COALESCE(SUM(w.amount), 0)::text AS "sum"
    FROM public.withdrawal_request w
    WHERE w.user_id::text = $1::text
      AND w.account_pk_id::text = $2::text
      AND w.status IN ('pending','approved')
  `;
    const res = await db_1.db.query(sql, [userId, accountPkId]);
    return res.rows[0]?.sum ?? "0";
}
async function insertWithdrawalRequestInTx(params) {
    const { userId, accountPkId, payoutAccountId, amount, currency, idempotencyKey, payoutSnapshot, } = params;
    /**
     * IMPORTANT:
     * - on évite les ::uuid ici pour ne pas casser si certaines colonnes sont TEXT
     * - Postgres va caster automatiquement selon le type réel de la colonne
     */
    const sql = `
    INSERT INTO public.withdrawal_request
      (id, user_id, account_pk_id, payout_account_id, amount, currency, status, idempotency_key, payout_snapshot, created_at, updated_at)
    VALUES
      (gen_random_uuid(), $1, $2, $3, $4::bigint, $5::text, 'pending', $6::text, $7::jsonb, now(), now())
    RETURNING
      id::text AS "id",
      user_id::text AS "userId",
      account_pk_id::text AS "accountPkId",
      payout_account_id::text AS "payoutAccountId",
      amount::text AS "amount",
      currency::text AS "currency",
      status::text AS "status",
      created_at::text AS "createdAt",
      updated_at::text AS "updatedAt"
  `;
    const res = await db_1.db.query(sql, [
        userId,
        accountPkId,
        payoutAccountId,
        amount,
        currency,
        idempotencyKey ?? null,
        JSON.stringify(payoutSnapshot ?? {}),
    ]);
    return res.rows[0];
}
async function findWithdrawalByIdForUpdate(params) {
    const { id, userId } = params;
    // ✅ FIX PRINCIPAL: comparaison en ::text (évite text = uuid)
    const sql = `
    SELECT
      w.id::text AS "id",
      w.user_id::text AS "userId",
      w.account_pk_id::text AS "accountPkId",
      w.payout_account_id::text AS "payoutAccountId",
      w.amount::text AS "amount",
      w.currency::text AS "currency",
      w.status::text AS "status",
      w.created_at::text AS "createdAt",
      w.updated_at::text AS "updatedAt"
    FROM public.withdrawal_request w
    WHERE w.id::text = $1::text
      AND w.user_id::text = $2::text
    FOR UPDATE
    LIMIT 1
  `;
    const res = await db_1.db.query(sql, [id, userId]);
    return res.rows[0] ?? null;
}
async function cancelWithdrawalInTx(params) {
    const { id, userId } = params;
    // ✅ Robust: comparaison en ::text + status pending
    const sql = `
    UPDATE public.withdrawal_request
    SET status = 'canceled',
        updated_at = now()
    WHERE id::text = $1::text
      AND user_id::text = $2::text
      AND status = 'pending'
    RETURNING
      id::text AS "id",
      user_id::text AS "userId",
      account_pk_id::text AS "accountPkId",
      payout_account_id::text AS "payoutAccountId",
      amount::text AS "amount",
      currency::text AS "currency",
      status::text AS "status",
      created_at::text AS "createdAt",
      updated_at::text AS "updatedAt"
  `;
    const res = await db_1.db.query(sql, [id, userId]);
    return res.rows[0];
}
async function findWithdrawalByIdempotencyKey(params) {
    const { userId, idempotencyKey } = params;
    const sql = `
    SELECT
      w.id::text AS "id",
      w.user_id::text AS "userId",
      w.account_pk_id::text AS "accountPkId",
      w.payout_account_id::text AS "payoutAccountId",
      w.amount::text AS "amount",
      w.currency::text AS "currency",
      w.status::text AS "status",
      w.created_at::text AS "createdAt",
      w.updated_at::text AS "updatedAt"
    FROM public.withdrawal_request w
    WHERE w.user_id::text = $1::text
      AND w.idempotency_key = $2::text
    LIMIT 1
  `;
    const res = await db_1.db.query(sql, [userId, idempotencyKey]);
    return res.rows[0] ?? null;
}
async function listWithdrawals(params) {
    const { userId, status, limit, offset } = params;
    /**
     * status est enum withdrawal_status en DB
     * - on check NULL via $2::text IS NULL
     * - sinon cast en withdrawal_status
     */
    const sql = `
    SELECT
      w.id::text AS "id",
      w.user_id::text AS "userId",
      w.account_pk_id::text AS "accountPkId",
      w.payout_account_id::text AS "payoutAccountId",
      w.amount::text AS "amount",
      w.currency::text AS "currency",
      w.status::text AS "status",
      w.created_at::text AS "createdAt",
      w.updated_at::text AS "updatedAt"
    FROM public.withdrawal_request w
    WHERE w.user_id::text = $1::text
      AND ($2::text IS NULL OR w.status = $2::withdrawal_status)
    ORDER BY w.created_at DESC
    LIMIT $3 OFFSET $4
  `;
    const res = await db_1.db.query(sql, [
        userId,
        status ?? null,
        limit,
        offset,
    ]);
    return res.rows;
}
