import { db } from "../../../../../lib/db";

export async function findLedgerCreditByReference(params: {
  referenceType: string;
  referenceId: string; // uuid string
}): Promise<{ txId: string } | null> {
  const r = await db.query<{ txId: string }>(
    `
    select
      "id"::text as "txId"
    from "account_balance_transaction"
    where "referenceType" = $1::text
      and "referenceId" = $2::uuid
      and "type" = 'credit'
    order by "createdAt" desc
    limit 1
    `,
    [params.referenceType, params.referenceId],
  );

  return r.rows[0] ?? null;
}
