// apps/admin/src/components/invoices/type.ts
export type InvoiceKind = "credits_topup" | "plan_subscription" | string;

export type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  status: string; // "issued" | "paid" | ...
  amountXof: number;
  currency: string;
  issuedAt: Date | string | null;

  kind: InvoiceKind;
  paymentMethod: string | null;
  creditsQty: number;

  workspace: {
    id: string;
    name: string;
    ownerName: string;
    ownerEmail: string;
  } | null;

  subscription:
    | {
        id: string;
        planCode: string;
        status: string;
        startsAt: Date | string | null;
        endsAt: Date | string | null;
      }
    | null;
};
