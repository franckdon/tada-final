// apps/admin/src/app/[locale]/(dashboard)/withdrawals/page.tsx
import { prisma } from "@/lib/prisma";
import { ListWithdrawals } from "@/components/withdrawals/list-withdrawals";

export const metadata = { title: "Withdrawals | Tada" };

type Locale = "fr" | "en";

export default async function WithdrawalsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  const withdrawals = await prisma.withdrawal_request.findMany({
    orderBy: { createdAt: "desc" }, // ⚠️ adapte si ton prisma field est createdAt
    take: 300, // suffisant pour admin list (sinon pagination server après)
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      createdAt: true,
      updatedAt: true,

      // relations
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
          isDefault: true,
        },
      },
      account: { select: { id: true, providerId: true, currency: true } },

      // admin fields (optional)
      reviewedById: true,
      reviewedAt: true,
      rejectionReason: true,
      paidAt: true,
      providerRef: true,
    },
  });

  const items = withdrawals.map((w) => ({
    id: String(w.id),
    status: String(w.status),
    amount:
      typeof w.amount === "bigint"
        ? w.amount.toString()
        : String(w.amount ?? "0"),
    currency: String(w.currency ?? "XOF"),
    createdAt: w.createdAt ?? null,
    updatedAt: w.updatedAt ?? null,

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
          type: w.payoutAccount.type ?? "",
          label: w.payoutAccount.label ?? "",
          provider: w.payoutAccount.provider ?? null,
          country: w.payoutAccount.country ?? null,
          dialCode: w.payoutAccount.dialCode ?? null,
          phone: w.payoutAccount.phone ?? null,
          bankName: w.payoutAccount.bankName ?? null,
          iban: w.payoutAccount.iban ?? null,
          rib: w.payoutAccount.rib ?? null,
          isDefault: Boolean(w.payoutAccount.isDefault),
        }
      : null,

    walletAccount: w.account
      ? {
          id: String(w.account.id),
          providerId: w.account.providerId ?? "",
          currency: w.account.currency ?? "XOF",
        }
      : null,

    reviewedById: w.reviewedById ?? null,
    reviewedAt: w.reviewedAt ?? null,
    rejectionReason: w.rejectionReason ?? null,
    paidAt: w.paidAt ?? null,
    providerRef: w.providerRef ?? null,
  }));

  return (
    <div className="p-5 text-gray-800">
      <ListWithdrawals locale={locale} withdrawals={items} />
    </div>
  );
}
