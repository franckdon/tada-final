import { db } from "../../../../lib/db";


export type AccountBalanceRow = {
  id: string; // account PK
  providerId: string;
  balance: string; // BIGINT sort en string via pg
  currency: string;
};

const PROVIDER_PRIORITY = ["mobile_credentials", "mobile", "credential", "google"] as const;

export async function findWalletAccountBalance(params: {
  userId: string;
  providerId?: string;
}): Promise<AccountBalanceRow | null> {
  const { userId, providerId } = params;

  if (providerId) {
    const sql = `
      SELECT a."id", a."providerId", a."balance"::text AS "balance", a."currency"
      FROM "account" a
      WHERE a."userId" = $1 AND a."providerId" = $2
      LIMIT 1
    `;
    const res = await db.query<AccountBalanceRow>(sql, [userId, providerId]);
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

  const res = await db.query<AccountBalanceRow>(sql, [userId, PROVIDER_PRIORITY]);
  return res.rows[0] ?? null;
}
