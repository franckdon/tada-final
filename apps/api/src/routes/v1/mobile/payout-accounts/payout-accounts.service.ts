import * as repo from "./payout-accounts.repo";
import type { CreatePayoutAccountBody, ListPayoutAccountsQuery } from "./payout-accounts.schemas";
import type { ServiceResult } from "../mobile.types";

export type PayoutAccountsListData = {
  items: Array<{
    id: string;
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
  }>;
};

export async function listPayoutAccounts(
  userId: string,
  q: ListPayoutAccountsQuery,
): Promise<ServiceResult<PayoutAccountsListData>> {
  const rows = await repo.listByUser({ userId, includeDeleted: q.includeDeleted });

  return {
    ok: true as const,
    data: { items: rows },
  };
}

export async function createPayoutAccount(
  userId: string,
  body: CreatePayoutAccountBody,
): Promise<ServiceResult<{ item: any }>> {
  const row = await repo.createForUser({ userId, body });

  return {
    ok: true as const,
    data: { item: row },
  };
}

export async function setDefaultPayoutAccount(
  userId: string,
  id: string,
): Promise<ServiceResult<{ ok: true }>> {
  try {
    await repo.setDefault({ userId, id });
    return { ok: true as const, data: { ok: true } };
  } catch (e: any) {
    if (e?.code === "NOT_FOUND" || e?.message === "NOT_FOUND") {
      return { ok: false as const, status: 404, message: "Compte introuvable" };
    }
    throw e;
  }
}

export async function deletePayoutAccount(
  userId: string,
  id: string,
): Promise<ServiceResult<{ ok: true }>> {
  try {
    await repo.softDelete({ userId, id });
    return { ok: true as const, data: { ok: true } };
  } catch (e: any) {
    if (e?.code === "NOT_FOUND" || e?.message === "NOT_FOUND") {
      return { ok: false as const, status: 404, message: "Compte introuvable" };
    }
    throw e;
  }
}
