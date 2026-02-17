import type { ServiceResult } from "../mobile.types";
import { db } from "../../../../lib/db";

import * as accountRepo from "../account/account.repo";
import * as repo from "./withdrawals.repo";
import type { CreateWithdrawalBody, ListWithdrawalsQuery } from "./withdrawals.schemas";

const MIN_WITHDRAWAL_XOF = 3000;

export type CreateWithdrawalResult = {
  id: string;
  userId: string;
  accountPkId: string;
  payoutAccountId: string;
  amountRaw: string;
  currency: string;
  status: string;
  createdAt: string;
};

export async function createWithdrawalRequest(
  userId: string,
  body: CreateWithdrawalBody,
): Promise<ServiceResult<CreateWithdrawalResult>> {
  if (body.amount < MIN_WITHDRAWAL_XOF) {
    return {
      ok: false as const,
      status: 400,
      message: `Le montant minimum de retrait est ${MIN_WITHDRAWAL_XOF} XOF`,
    };
  }

  // idempotency: si fourni, renvoyer la demande existante
  if (body.idempotencyKey) {
    const existing = await repo.findWithdrawalByIdempotencyKey({
      userId,
      idempotencyKey: body.idempotencyKey,
    });
    if (existing) {
      return {
        ok: true as const,
        data: {
          id: existing.id,
          userId: existing.userId,
          accountPkId: existing.accountPkId,
          payoutAccountId: existing.payoutAccountId,
          amountRaw: existing.amount,
          currency: existing.currency,
          status: existing.status,
          createdAt: existing.createdAt,
        },
      };
    }
  }

  await db.query("BEGIN");

  try {
    // 1) lock wallet account (anti-race)
    const acc = await accountRepo.findAccountForUpdate({
      userId,
      providerId: body.providerId,
    });

    if (!acc) {
      await db.query("ROLLBACK");
      return { ok: false as const, status: 404, message: "Aucun compte wallet trouvé pour cet utilisateur" };
    }

    const currency = body.currency ?? acc.currency ?? "XOF";

    if (currency !== "XOF") {
      await db.query("ROLLBACK");
      return { ok: false as const, status: 400, message: "Seuls les retraits en XOF sont supportés pour le moment" };
    }

    // 2) payout account belongs to user
    const payout = await repo.findPayoutAccountForUser({
      userId,
      payoutAccountId: body.payoutAccountId,
    });

    if (!payout) {
      await db.query("ROLLBACK");
      return { ok: false as const, status: 404, message: "Compte de paiement introuvable" };
    }

    // 3) available = balance - reserved(pending+approved)
    const balanceRaw = acc.balance ?? "0";
    const reservedRaw = await repo.sumReservedWithdrawalsInTx({
      userId,
      accountPkId: acc.id,
    });

    const balance = BigInt(balanceRaw);
    const reserved = BigInt(reservedRaw ?? "0");
    const amount = BigInt(String(body.amount));

    const available = balance - reserved;

    if (amount > available) {
      await db.query("ROLLBACK");
      return {
        ok: false as const,
        status: 409,
        message: "Solde insuffisant",
      };
    }

    // 4) create request pending + snapshot payout
    const payoutSnapshot = {
      type: payout.type,
      label: payout.label,
      provider: payout.provider,
      country: payout.country,
      dialCode: payout.dialCode,
      phone: payout.phone,
      bankName: payout.bankName,
      rib: payout.rib,
      iban: payout.iban,
      bic: payout.bic,
      isDefault: payout.isDefault,
    };

    const w = await repo.insertWithdrawalRequestInTx({
      userId,
      accountPkId: acc.id,
      payoutAccountId: payout.id,
      amount: amount.toString(),
      currency: "XOF",
      idempotencyKey: body.idempotencyKey,
      payoutSnapshot,
    });

    await db.query("COMMIT");

    return {
      ok: true as const,
      data: {
        id: w.id,
        userId: w.userId,
        accountPkId: w.accountPkId,
        payoutAccountId: w.payoutAccountId,
        amountRaw: w.amount,
        currency: w.currency,
        status: w.status,
        createdAt: w.createdAt,
      },
    };
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  }
}

export type CancelWithdrawalResult = {
  id: string;
  status: string;
  updatedAt: string;
};

export async function cancelWithdrawalRequest(
  userId: string,
  withdrawalId: string,
): Promise<ServiceResult<CancelWithdrawalResult>> {
  await db.query("BEGIN");

  try {
    const w = await repo.findWithdrawalByIdForUpdate({ id: withdrawalId, userId });

    if (!w) {
      await db.query("ROLLBACK");
      return { ok: false as const, status: 404, message: "Demande de retrait introuvable" };
    }

    if (w.status !== "pending") {
      await db.query("ROLLBACK");
      return {
        ok: false as const,
        status: 409,
        message: "Annulation impossible: seule une demande en statut pending peut être annulée",
      };
    }

    const canceled = await repo.cancelWithdrawalInTx({ id: withdrawalId, userId });

    await db.query("COMMIT");

    return {
      ok: true as const,
      data: {
        id: canceled.id,
        status: canceled.status,
        updatedAt: canceled.updatedAt,
      },
    };
  } catch (e) {
    await db.query("ROLLBACK");
    throw e;
  }
}

export type WithdrawalListItem = {
  id: string;
  amountRaw: string;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  payoutAccountId: string;
};

export async function listUserWithdrawals(
  userId: string,
  q: ListWithdrawalsQuery,
): Promise<ServiceResult<{ items: WithdrawalListItem[]; limit: number; offset: number }>> {
  const rows = await repo.listWithdrawals({
    userId,
    status: q.status,
    limit: q.limit,
    offset: q.offset,
  });

  return {
    ok: true as const,
    data: {
      items: rows.map((r) => ({
        id: r.id,
        amountRaw: r.amount,
        currency: r.currency,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        payoutAccountId: r.payoutAccountId,
      })),
      limit: q.limit,
      offset: q.offset,
    },
  };
}
