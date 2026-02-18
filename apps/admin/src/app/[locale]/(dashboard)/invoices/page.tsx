// apps/admin/src/app/[locale]/(dashboard)/invoices/page.tsx
import { prisma } from "@/lib/prisma";
import { ListInvoices } from "@/components/invoices/list-invoices";

export const metadata = { title: "Invoices | Tada" };

type Locale = "fr" | "en";

export default async function InvoicesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  const invoices = await prisma.invoice.findMany({
    orderBy: { issuedAt: "desc" },
    take: 500,
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      amountCents: true,
      currency: true,
      issuedAt: true,
      createdAt: true,
      updatedAt: true,
      metadata: true,

      workspace: {
        select: {
          id: true,
          name: true,
          country: true,
          city: true,
          street: true,
          owner: { select: { id: true, name: true, email: true } },
        },
      },

      workspaceCreditTransactionId: true,
      workspacePlanSubscriptionId: true,

      workspacePlanSubscription: {
        select: {
          id: true,
          planCode: true,
          status: true,
          startsAt: true,
          endsAt: true,
        },
      },

      workspaceCreditTransaction: {
        select: {
          id: true,
          amount: true,
          reason: true,
          created_at: true,
          metadata: true,
        },
      },
    },
  });

  const items = invoices.map((inv) => {
    const md: any = inv.metadata ?? {};

    const kind =
      md?.kind ??
      (inv.workspacePlanSubscriptionId ? "plan_subscription" : "credits_topup");

    const billing = md?.billing ?? {};
    const paymentMethod = billing?.paymentMethod ?? md?.paymentMethod ?? null;

    const creditsQty =
      Number(
        billing?.creditsQty ??
          md?.creditsQty ??
          inv.workspaceCreditTransaction?.amount ??
          0,
      ) || 0;

    return {
      id: String(inv.id),
      invoiceNumber: inv.invoiceNumber ?? "",
      status: String(inv.status ?? "issued"),
      amountXof: Number(inv.amountCents ?? 0),
      currency: String(inv.currency ?? "XOF"),
      issuedAt: inv.issuedAt ?? null,

      kind: String(kind),
      paymentMethod: paymentMethod ? String(paymentMethod) : null,
      creditsQty,

      workspace: inv.workspace
        ? {
            id: String(inv.workspace.id),
            name: inv.workspace.name ?? "",
            ownerName: inv.workspace.owner?.name ?? "",
            ownerEmail: inv.workspace.owner?.email ?? "",
          }
        : null,

      subscription: inv.workspacePlanSubscription
        ? {
            id: String(inv.workspacePlanSubscription.id),
            planCode: String(inv.workspacePlanSubscription.planCode ?? ""),
            status: String(inv.workspacePlanSubscription.status ?? ""),
            startsAt: inv.workspacePlanSubscription.startsAt ?? null,
            endsAt: inv.workspacePlanSubscription.endsAt ?? null,
          }
        : null,
    };
  });

  return (
    <div className="p-5 text-gray-800">
      <ListInvoices locale={locale} invoices={items} />
    </div>
  );
}
