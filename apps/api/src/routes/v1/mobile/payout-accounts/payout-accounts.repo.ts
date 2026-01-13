import { db } from "../../../../lib/db";
import type { CreatePayoutAccountBody } from "./payout-accounts.schemas";

export type PayoutAccountRow = {
  id: string;
  userId: string;
  type: "mobile_money" | "bank";
  label: string;

  provider: string | null;
  country: string | null;
  dialCode: string | null;
  phone: string | null;

  bankName: string | null;
  rib: string | null;
  iban: string | null;
  bic: string | null;

  isDefault: boolean;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export async function listByUser(params: {
  userId: string;
  includeDeleted?: boolean;
}): Promise<PayoutAccountRow[]> {
  const { userId, includeDeleted } = params;

  const whereDeleted = includeDeleted ? "" : `AND p."deletedAt" IS NULL`;

  const sql = `
    SELECT
      p."id",
      p."userId",
      p."type",
      p."label",
      p."provider",
      p."country",
      p."dialCode",
      p."phone",
      p."bankName",
      p."rib",
      p."iban",
      p."bic",
      p."isDefault",
      p."createdAt",
      p."updatedAt",
      p."deletedAt"
    FROM "payout_account" p
    WHERE p."userId" = $1
    ${whereDeleted}
    ORDER BY p."isDefault" DESC, p."createdAt" DESC, p."id" ASC
  `;

  const res = await db.query<PayoutAccountRow>(sql, [userId]);
  return res.rows;
}

export async function findOwnedById(params: {
  userId: string;
  id: string;
}): Promise<PayoutAccountRow | null> {
  const sql = `
    SELECT
      p."id",
      p."userId",
      p."type",
      p."label",
      p."provider",
      p."country",
      p."dialCode",
      p."phone",
      p."bankName",
      p."rib",
      p."iban",
      p."bic",
      p."isDefault",
      p."createdAt",
      p."updatedAt",
      p."deletedAt"
    FROM "payout_account" p
    WHERE p."id" = $1
      AND p."userId" = $2
    LIMIT 1
  `;
  const res = await db.query<PayoutAccountRow>(sql, [params.id, params.userId]);
  return res.rows[0] ?? null;
}

export async function createForUser(params: {
  userId: string;
  body: CreatePayoutAccountBody;
}): Promise<PayoutAccountRow> {
  const { userId, body } = params;

  // Transaction: if isDefault => unset others then insert
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    if (body.isDefault === true) {
      await client.query(
        `UPDATE "payout_account" SET "isDefault" = false, "updatedAt" = now()
         WHERE "userId" = $1 AND "deletedAt" IS NULL`,
        [userId],
      );
    }

    const insertSql = `
      INSERT INTO "payout_account"
      (
        "userId","type","label",
        "provider","country","dialCode","phone",
        "bankName","rib","iban","bic",
        "isDefault","createdAt","updatedAt"
      )
      VALUES
      (
        $1,$2,$3,
        $4,$5,$6,$7,
        $8,$9,$10,$11,
        $12, now(), now()
      )
      RETURNING
        "id","userId","type","label",
        "provider","country","dialCode","phone",
        "bankName","rib","iban","bic",
        "isDefault","createdAt","updatedAt","deletedAt"
    `;

    const values = [
      userId,
      body.type,
      body.label,
      body.provider ?? null,
      body.country ?? null,
      body.dialCode ?? null,
      body.phone ?? null,
      body.bankName ?? null,
      body.rib ?? null,
      body.iban ?? null,
      body.bic ?? null,
      body.isDefault === true,
    ];

    const res = await client.query<PayoutAccountRow>(insertSql, values);

    await client.query("COMMIT");
    return res.rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function setDefault(params: { userId: string; id: string }): Promise<void> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Ensure record exists, owned, not deleted
    const owned = await client.query<{ id: string }>(
      `SELECT "id" FROM "payout_account"
       WHERE "id" = $1 AND "userId" = $2 AND "deletedAt" IS NULL
       LIMIT 1`,
      [params.id, params.userId],
    );
    if (!owned.rows[0]) {
      await client.query("ROLLBACK");
      throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
    }

    await client.query(
      `UPDATE "payout_account" SET "isDefault" = false, "updatedAt" = now()
       WHERE "userId" = $1 AND "deletedAt" IS NULL`,
      [params.userId],
    );

    await client.query(
      `UPDATE "payout_account" SET "isDefault" = true, "updatedAt" = now()
       WHERE "id" = $1 AND "userId" = $2 AND "deletedAt" IS NULL`,
      [params.id, params.userId],
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function softDelete(params: { userId: string; id: string }): Promise<void> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const row = await client.query<{ isDefault: boolean }>(
      `SELECT "isDefault"
       FROM "payout_account"
       WHERE "id" = $1 AND "userId" = $2 AND "deletedAt" IS NULL
       LIMIT 1`,
      [params.id, params.userId],
    );

    if (!row.rows[0]) {
      await client.query("ROLLBACK");
      throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
    }

    const wasDefault = row.rows[0].isDefault;

    await client.query(
      `UPDATE "payout_account"
       SET "deletedAt" = now(), "isDefault" = false, "updatedAt" = now()
       WHERE "id" = $1 AND "userId" = $2 AND "deletedAt" IS NULL`,
      [params.id, params.userId],
    );

    // Si on a supprimé le default, on peut promote automatiquement le plus récent restant
    if (wasDefault) {
      const next = await client.query<{ id: string }>(
        `SELECT "id"
         FROM "payout_account"
         WHERE "userId" = $1 AND "deletedAt" IS NULL
         ORDER BY "createdAt" DESC
         LIMIT 1`,
        [params.userId],
      );

      if (next.rows[0]) {
        await client.query(
          `UPDATE "payout_account"
           SET "isDefault" = true, "updatedAt" = now()
           WHERE "id" = $1 AND "userId" = $2`,
          [next.rows[0].id, params.userId],
        );
      }
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
