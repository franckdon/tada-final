// src/lib/billing/invoice-orchestrator.ts
import { prisma } from "@/lib/prisma";

type PaymentProvider = "paystack";
type PaymentStatus = "pending" | "paid" | "failed";

function asInt(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

/**
 * ✅ Crée (si besoin) la creditTx + la facture "paid" pour un purchase Paystack.
 * Idempotent:
 * - si la creditTx existe déjà (uniq_credit_tx_ref) => ne recrédite pas
 * - si la facture existe déjà => renvoie / force paid
 *
 * IMPORTANT: ici on utilise LES BONS MODELS Prisma :
 * - tx.workspaceCreditAccount
 * - tx.workspaceCreditTransaction
 */
export async function createPaidInvoiceForCreditPurchase(args: {
  provider: PaymentProvider;
  providerRef: string; // Paystack reference
  actorUserId?: string | null; // webhook -> null
  paystackVerifyPayload?: any; // audit
}) {
  const { provider, providerRef, actorUserId, paystackVerifyPayload } = args;

  if (!providerRef?.trim()) throw new Error("providerRef is required");
  if (provider !== "paystack") throw new Error("Unsupported provider");

  return prisma.$transaction(
    async (tx) => {
      // 1) Source : purchase
      const purchase = await tx.workspaceCreditPurchase.findFirst({
        where: { provider: "paystack", providerRef },
        select: {
          id: true,
          workspaceId: true,
          credits: true,
          providerStatus: true,
          metadata: true,
          totalAmountXof: true,
          unitPriceXof: true,
        },
      });

      if (!purchase) throw new Error("Purchase not found");

      const status = String(purchase.providerStatus || "")
        .toLowerCase() as PaymentStatus;

      if (status !== "paid") {
        throw new Error(
          `Purchase not paid (status=${purchase.providerStatus})`,
        );
      }

      const creditsQty = asInt(purchase.credits, 0);
      if (creditsQty <= 0) throw new Error("Invalid credits on purchase");

      const amountXof = asInt(purchase.totalAmountXof, 0);
      if (amountXof <= 0) throw new Error("Invalid totalAmountXof on purchase");

      const unitPriceXof = asInt(purchase.unitPriceXof, 0);

      // 2) Ensure credit account (WorkspaceCreditAccount.workspaceId est @unique)
      let account = await tx.workspaceCreditAccount.findUnique({
        where: { workspaceId: purchase.workspaceId },
        select: { id: true, balance: true, currency: true },
      });

      if (!account) {
        account = await tx.workspaceCreditAccount.create({
          data: {
            workspaceId: purchase.workspaceId,
            balance: 0,
            currency: "XOF", // ⚠️ ton default est EUR, donc on force XOF ici
            overdraftAllowed: false,
            overdraftLimit: 0,
          },
          select: { id: true, balance: true, currency: true },
        });
      }

      // 3) Idempotence : une tx existe déjà ? (uniq_credit_tx_ref)
      let creditTx = await tx.workspaceCreditTransaction.findFirst({
        where: {
          credit_account_id: account.id,
          direction: "credit",
          reason: "paid_topup",
          reference_id: providerRef,
        },
        select: {
          id: true,
          balance_after: true,
          metadata: true,
        },
      });

      // 4) Si pas de creditTx, on crédite + create tx
      if (!creditTx) {
        const newBalance = asInt(account.balance, 0) + creditsQty;

        await tx.workspaceCreditAccount.update({
          where: { id: account.id },
          data: { balance: newBalance, updatedAt: new Date() },
          select: { id: true },
        });

        creditTx = await tx.workspaceCreditTransaction.create({
          data: {
            credit_account_id: account.id,
            subscription_id: null,
            direction: "credit",
            amount: creditsQty,
            reason: "paid_topup",
            reference_id: providerRef,
            description: `Paystack credits top-up (+${creditsQty})`,
            balance_after: newBalance,
            actor_user_id: actorUserId ?? null,
            metadata: {
              source: "paystack",
              purchaseId: purchase.id,
              providerRef,
              paystack: { verify: paystackVerifyPayload ?? null },
              billing: {
                creditsQty,
                amountXof,
                unitPriceXof,
                paymentMethod: "mobile_money",
              },
            },
          },
          select: {
            id: true,
            balance_after: true,
            metadata: true,
          },
        });
      }

      // 5) Idempotence facture : d’abord par workspaceCreditTransactionId
      let invoice = await tx.invoice.findFirst({
        where: { workspaceCreditTransactionId: creditTx.id },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          issuedAt: true,
          amountCents: true,
          currency: true,
          workspaceCreditTransactionId: true,
          metadata: true,
        },
      });

      // fallback : facture déjà créée (dev) via metadata.providerRef
      if (!invoice) {
        invoice = await tx.invoice.findFirst({
          where: {
            workspaceId: purchase.workspaceId,
            metadata: { path: ["providerRef"], equals: providerRef },
          },
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            issuedAt: true,
            amountCents: true,
            currency: true,
            workspaceCreditTransactionId: true,
            metadata: true,
          },
        });
      }

      // si invoice existe : forcer paid si besoin
      if (invoice) {
        if (String(invoice.status).toLowerCase() !== "paid") {
          const updated = await tx.invoice.update({
            where: { id: invoice.id },
            data: { status: "paid", updatedAt: new Date() },
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
              issuedAt: true,
              amountCents: true,
              currency: true,
              workspaceCreditTransactionId: true,
              metadata: true,
            },
          });

          return {
            invoice: updated,
            alreadyExisted: true,
            creditTxId: creditTx.id,
            creditBalanceAfter: creditTx.balance_after ?? null,
          };
        }

        return {
          invoice,
          alreadyExisted: true,
          creditTxId: creditTx.id,
          creditBalanceAfter: creditTx.balance_after ?? null,
        };
      }

      // 6) Créer facture (paid) liée à creditTx
      const created = await tx.invoice.create({
        data: {
          workspaceId: purchase.workspaceId,
          workspaceCreditTransactionId: creditTx.id,
          amountCents: amountXof, // chez toi : XOF integer
          currency: "XOF",
          status: "paid",
          metadata: {
            kind: "credits_topup",
            itemLabel: "Credits top-up",
            source: "credits_topup_paystack",
            provider: "paystack",
            providerRef,
            purchaseId: purchase.id,
            billing: {
              paymentMethod: "mobile_money",
              creditsQty,
              unitPriceXof,
              amountXof,
            },
            paystack: { verify: paystackVerifyPayload ?? null },
          },
        },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          issuedAt: true,
          amountCents: true,
          currency: true,
          workspaceCreditTransactionId: true,
          metadata: true,
        },
      });

      // 7) Optional : stocker invoiceId dans metadata de la tx (merge)
      const prevTxMeta =
        creditTx.metadata && typeof creditTx.metadata === "object"
          ? (creditTx.metadata as Record<string, any>)
          : {};

      await tx.workspaceCreditTransaction
        .update({
          where: { id: creditTx.id },
          data: { metadata: { ...prevTxMeta, invoiceId: created.id } },
          select: { id: true },
        })
        .catch(() => null);

      return {
        invoice: created,
        alreadyExisted: false,
        creditTxId: creditTx.id,
        creditBalanceAfter: creditTx.balance_after ?? null,
      };
    },
    { timeout: 20_000, maxWait: 20_000 },
  );
}

/** ✅ Utilitaire générique */
export async function markInvoicePaid(args: { invoiceId: string }) {
  const { invoiceId } = args;
  if (!invoiceId?.trim()) throw new Error("invoiceId is required");

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "paid", updatedAt: new Date() },
    select: { id: true, status: true, invoiceNumber: true, issuedAt: true },
  });
}
