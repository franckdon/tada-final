import * as repo from "./account.repo";
import type { ServiceResult } from "../mobile.types"; // adapte ton import
import type { BalanceQuery } from "./account.schemas";

export type BalanceData = {
  userId: string;
  accountPkId: string;
  providerId: string;
  balance: number; // attention: BIGINT -> number uniquement si ça reste < 2^53
  balanceRaw: string; // safe
  currency: string;
};

export async function getBalance(
  userId: string,
  q: BalanceQuery,
): Promise<ServiceResult<BalanceData>> {
  const row = await repo.findWalletAccountBalance({ userId, providerId: q.providerId });

  if (!row) {
    // Option: retourner 0 si pas encore de wallet account
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

  // BIGINT: on renvoie string + number (si safe)
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
