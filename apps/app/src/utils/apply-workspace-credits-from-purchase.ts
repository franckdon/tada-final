// apps/app/src/utils/apply-workspace-credits-from-purchase.ts
import { prisma } from "@/lib/prisma";

type ApplyArgs = {
  purchaseId: string;
  reference: string; // providerRef
  actorUserId?: string | null;
  paystackVerifyPayload?: any;
};

export async function applyWorkspaceCreditsFromPurchase({
  purchaseId,
  reference,
  actorUserId,
  paystackVerifyPayload,
}: ApplyArgs) {
  return prisma.$transaction(async (tx) => {
    // 1) Recharger la purchase dans la transaction
    const purchase = await tx.workspaceCreditPurchase.findUnique({
      where: { id: purchaseId },
      select: {
        id: true,
        workspaceId: true,
        credits: true,
        providerStatus: true,
        metadata: true,
      },
    });

    if (!purchase) throw new Error("Purchase not found");

    // Sécurité: on crédite uniquement si paid
    if (purchase.providerStatus !== "paid") {
      throw new Error(`Purchase not paid (status=${purchase.providerStatus})`);
    }

    // 2) Upsert du compte crédits (1 par workspace)
    const account = await tx.workspaceCreditAccount.upsert({
      where: { workspaceId: purchase.workspaceId },
      create: {
        workspaceId: purchase.workspaceId,
        balance: 0,
        currency: "EUR", // ⚠️ tu peux laisser, ou mettre "XOF" / "USD" mais ici c'est un compte "credits" pas une devise
      },
      update: {},
      select: { id: true, balance: true },
    });

    // 3) Idempotence (sans migration) : on check s’il existe déjà une transaction pour ce reference
    // (Tu peux rendre ça “hard” avec un @@unique plus tard)
    const existing = await tx.workspaceCreditTransaction.findFirst({
      where: {
        credit_account_id: account.id,
        direction: "credit",
        reason: "credits_purchase",
        reference_id: reference,
      },
      select: { id: true },
    });

    if (existing) {
      return { ok: true, alreadyApplied: true, accountId: account.id };
    }

    // 4) Nouveau solde
    const newBalance = account.balance + purchase.credits;

    // 5) Créer transaction + update balance
    await tx.workspaceCreditTransaction.create({
      data: {
        credit_account_id: account.id,
        direction: "credit",
        amount: purchase.credits,
        reason: "credits_purchase",
        reference_id: reference,
        description: `Paystack credits purchase (${purchase.credits})`,
        balance_after: newBalance,
        actor_user_id: actorUserId ?? null,
        metadata: {
          purchaseId: purchase.id,
          paystack: paystackVerifyPayload ?? null,
        },
      },
    });

    await tx.workspaceCreditAccount.update({
      where: { id: account.id },
      data: { balance: newBalance },
    });

    return { ok: true, alreadyApplied: false, accountId: account.id, newBalance };
  });
}
