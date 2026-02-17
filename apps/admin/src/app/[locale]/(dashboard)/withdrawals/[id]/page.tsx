// apps/admin/src/app/[locale]/(dashboard)/withdrawals/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ViewWithdrawal } from "@/components/withdrawals/view-withdrawal";

export const metadata = { title: "Withdrawal details | Tada" };

type Locale = "fr" | "en";

export default async function WithdrawalDetailsPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;

  const w = await prisma.withdrawal_request.findUnique({
    where: { id },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      createdAt: true,
      updatedAt: true,

      payoutSnapshot: true,

      reviewedById: true,
      reviewedAt: true,
      rejectionReason: true,

      paidAt: true,
      providerRef: true,

      idempotencyKey: true,

      user: { select: { id: true, name: true, email: true } },
      payoutAccount: {
        select: {
          id: true,
          type: true,
          label: true,
          provider: true,
          country: true,
          dialCode: true,
          phone: true,
          bankName: true,
          iban: true,
          rib: true,
          bic: true,
          isDefault: true,
        },
      },
      account: {
        select: { id: true, providerId: true, currency: true, balance: true },
      },
    },
  });

  if (!w) return notFound();

  const item = {
    id: String(w.id),
    status: String(w.status),
    amount:
      typeof w.amount === "bigint"
        ? w.amount.toString()
        : String(w.amount ?? "0"),
    currency: String(w.currency ?? "XOF"),
    createdAt: w.createdAt ?? null,
    updatedAt: w.updatedAt ?? null,

    idempotencyKey: w.idempotencyKey ?? null,

    payoutSnapshot: w.payoutSnapshot ?? null,

    reviewedById: w.reviewedById ?? null,
    reviewedAt: w.reviewedAt ?? null,
    rejectionReason: w.rejectionReason ?? null,

    paidAt: w.paidAt ?? null,
    providerRef: w.providerRef ?? null,

    user: w.user
      ? {
          id: String(w.user.id),
          name: w.user.name ?? "",
          email: w.user.email ?? "",
        }
      : null,

    payoutAccount: w.payoutAccount
      ? {
          id: String(w.payoutAccount.id),
          type: String(w.payoutAccount.type ?? ""),
          label: String(w.payoutAccount.label ?? ""),
          provider: w.payoutAccount.provider ?? null,
          country: w.payoutAccount.country ?? null,
          dialCode: w.payoutAccount.dialCode ?? null,
          phone: w.payoutAccount.phone ?? null,
          bankName: w.payoutAccount.bankName ?? null,
          iban: w.payoutAccount.iban ?? null,
          rib: w.payoutAccount.rib ?? null,
          bic: w.payoutAccount.bic ?? null,
          isDefault: Boolean(w.payoutAccount.isDefault),
        }
      : null,

    walletAccount: w.account
      ? {
          id: String(w.account.id),
          providerId: String(w.account.providerId ?? ""),
          currency: String(w.account.currency ?? "XOF"),
          balance:
            typeof w.account.balance === "bigint"
              ? w.account.balance.toString()
              : String(w.account.balance ?? "0"),
        }
      : null,
  };

  return (
    <div className="p-5 text-gray-800">
      <ViewWithdrawal locale={locale} withdrawal={item} />
    </div>
  );
}
