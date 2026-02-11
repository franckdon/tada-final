import * as repo from "./account.repo";
import type { ServiceResult } from "../mobile.types";
import type { BalanceQuery, CreditBody } from "./account.schemas";
import { db } from "../../../../lib/db";

export type BalanceData = {
  userId: string;
  accountPkId: string;
  providerId: string;
  balance: number;
  balanceRaw: string;
  currency: string;
};

export async function getBalance(
  userId: string,
  q: BalanceQuery,
): Promise<ServiceResult<BalanceData>> {
  const row = await repo.findWalletAccountBalance({ userId, providerId: q.providerId });

  if (!row) {
    return {
      ok: true as const,
      data: {
        userId,
        accountPkId: "",
        providerId: q.providerId ?? "none",
        balance: 0,
        balanceRaw: "0",
        currency: "XOF",
      },
    };
  }

  const balanceRaw = row.balance ?? "0";
  const asNumber = Number(balanceRaw);
  const safeNumber = Number.isSafeInteger(asNumber) ? asNumber : 0;

  return {
    ok: true as const,
    data: {
      userId,
      accountPkId: row.id,
      providerId: row.providerId,
      balance: safeNumber,
      balanceRaw,
      currency: row.currency ?? "XOF",
    },
  };
}

export type CreditResult = {
  userId: string;
  accountPkId: string;
  providerId: string;
  currency: string;
  amountRaw: string;
  balanceAfterRaw: string;
  txId: string;
  idempotencyKey: string;
  kind: "inserted" | "exists";
};

export async function creditUserWallet(
  userId: string,
  body: CreditBody,
): Promise<ServiceResult<CreditResult>> {
  // amount en bigint string
  const amountRaw = String(body.amount);



  await db.query("BEGIN");

  try {
    const acc = await repo.findAccountForUpdate({
      userId,
      providerId: body.providerId,
    });

    if (!acc) {
      await db.query("ROLLBACK");
      return { ok: false as const, status: 404, message: "Aucun compte wallet trouvé pour cet utilisateur" };
    }

    const r = await repo.creditAccountInTx({
      accountPkId: acc.id,
      amount: amountRaw,
      currency: body.currency ?? acc.currency ?? "XOF",
      reason: body.reason,
      description: body.description,
      referenceType: body.referenceType,
      referenceId: body.referenceId,
      idempotencyKey: body.idempotencyKey,
    });

    await db.query("COMMIT");

    return {
      ok: true as const,
      data: {
        userId,
        accountPkId: acc.id,
        providerId: acc.providerId,
        currency: body.currency ?? acc.currency ?? "XOF",
        amountRaw,
        balanceAfterRaw: r.balanceAfter,
        txId: r.txId,
        idempotencyKey: body.idempotencyKey,
        kind: r.kind,
      },
    };
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  }
}
