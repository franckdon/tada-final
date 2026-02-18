import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { renderInvoicePdfBuffer } from "@/lib/billing/invoice-pdf";

function isActiveSubscription(sub: any) {
  if (!sub) return false;
  if (sub.status !== "active") return false;
  if (!sub.endsAt) return true;
  return new Date(sub.endsAt).getTime() > Date.now();
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.id;

    // workspace + owner + subscription
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        country: true,
        city: true,
        street: true,
        owner: { select: { id: true, name: true, email: true } },
        workspacePlanSubscription: {
          select: { id: true, planCode: true, status: true, startsAt: true, endsAt: true },
        },
      },
    });

    if (!ws) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

    const sub = ws.workspacePlanSubscription;
    if (!isActiveSubscription(sub)) {
      return NextResponse.json({ error: "No active subscription for this workspace" }, { status: 400 });
    }

    // invoice by subscriptionId
    const invoice = await prisma.invoice.findUnique({
      where: { workspacePlanSubscriptionId: sub.id },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issuedAt: true,
        amountCents: true,
        currency: true,
        metadata: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found for this active subscription" }, { status: 404 });
    }

    // ✅ inject itemLabel into metadata if missing (optional safety)
    const md: any = invoice.metadata ?? {};
    const billing = md?.billing ?? {};
    const planLabel = `Credits (${String(sub.planCode).toUpperCase()})`;

    const normalizedInvoice = {
      ...invoice,
      metadata: {
        ...md,
        kind: md.kind ?? "subscription",
        itemLabel: md.itemLabel ?? planLabel,
        billing,
      },
    };

    const pdf = await renderInvoicePdfBuffer({
      invoice: normalizedInvoice,
      workspace: ws,
    });

    const filename = `${invoice.invoiceNumber ?? invoice.id}.pdf`;

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unexpected error" }, { status: 500 });
  }
}
