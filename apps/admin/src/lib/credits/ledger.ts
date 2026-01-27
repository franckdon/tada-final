import { prisma } from "@/lib/prisma";

type CreditDirection = "credit" | "debit";

type ApplyCreditTxInput = {
  workspaceId: string;
  direction: CreditDirection;
  amount: number;
  reason:
    | "manual_grant"
    | "manual_withdraw"
    | "mission_validation_debit"
    | "addon_purchase_paystack"
    | "subscription_grant"
    | "subscription_renew_grant";
  actorUserId?: string | null;
  referenceId?: string | null;
  description?: string | null;
  metadata?: any | null;
};

export async function applyWorkspaceCreditTx(input: ApplyCreditTxInput) {
  const { workspaceId, direction, amount } = input;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("amount must be a positive number");
  }

  return prisma.$transaction(async (tx) => {
    // 1) Ensure credit account
    const ws = await tx.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, workspace_credit_account: { select: { id: true } } },
    });
    if (!ws) throw new Error("Workspace not found");

    const account =
      ws.workspace_credit_account ??
      (await tx.workspace_credit_account.create({
        data: {
          workspace: { connect: { id: workspaceId } },
          balance: 0,
          currency: "EUR",
          overdraft_allowed: false,
          overdraft_limit: 0,
        },
        select: { id: true },
      }));

    // 2) Read current balance & overdraft settings (for debit guard)
    const current = await tx.workspace_credit_account.findUnique({
      where: { id: account.id },
      select: { id: true, balance: true, overdraft_allowed: true, overdraft_limit: true },
    });
    if (!current) throw new Error("Credit account not found");

    const currentBalance = current.balance ?? 0;

    // 3) Compute next balance with guard
    let nextBalance = currentBalance;

    if (direction === "credit") {
      nextBalance = currentBalance + amount;
    } else {
      const allowedFloor = current.overdraft_allowed ? -(current.overdraft_limit ?? 0) : 0;
      const candidate = currentBalance - amount;
      if (candidate < allowedFloor) {
        throw new Error("Insufficient credits");
      }
      nextBalance = candidate;
    }

    await tx.workspace_credit_account.update({
      where: { id: current.id },
      data: {
        balance: nextBalance,
        updated_at: new Date(),
      },
    });

    const row = await tx.workspace_credit_transaction.create({
      data: {
        credit_account_id: current.id,
        subscription_id: null,
        direction,
        amount,
        reason: input.reason,
        reference_id: input.referenceId ?? null,
        description: input.description ?? null,
        balance_after: nextBalance,
        actor_user_id: input.actorUserId ?? null,
        metadata: input.metadata ?? null,
      },
      select: {
        id: true,
        direction: true,
        amount: true,
        reason: true,
        reference_id: true,
        balance_after: true,
        created_at: true,
      },
    });

    return { balanceAfter: nextBalance, transaction: row };
  });
}
