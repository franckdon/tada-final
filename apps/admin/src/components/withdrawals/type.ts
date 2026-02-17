// apps/admin/src/components/withdrawals/type.ts
export type WithdrawalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "paid"
  | "canceled";

export type WithdrawalListItem = {
  id: string;
  status: string; // garde string, on caste côté UI
  amount: string; // bigint string
  currency: string;

  createdAt: Date | string | null;
  updatedAt: Date | string | null;

  user: { id: string; name: string; email: string } | null;

  payoutAccount: {
    id: string;
    type: string;
    label: string;
    provider: string | null;
    country: string | null;
    dialCode: string | null;
    phone: string | null;
    bankName: string | null;
    iban: string | null;
    rib: string | null;
    isDefault: boolean;
  } | null;

  walletAccount: {
    id: string;
    providerId: string;
    currency: string;
  } | null;

  reviewedById: string | null;
  reviewedAt: Date | string | null;
  rejectionReason: string | null;
  paidAt: Date | string | null;
  providerRef: string | null;
};
