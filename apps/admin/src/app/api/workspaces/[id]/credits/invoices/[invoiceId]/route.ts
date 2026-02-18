import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { renderInvoicePdfBuffer } from "@/lib/billing/invoice-pdf";

export async function GET(
  _req: Request,
  { params }: { params: { id: string; invoiceId: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.id;
    const invoiceId = params.invoiceId;

    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        country: true,
        city: true,
        street: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    if (!ws) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, workspaceId },
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

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    // normalize metadata
    const md: any = invoice.metadata ?? {};
    const billing = md?.billing ?? {};

    const normalizedInvoice = {
      ...invoice,
      metadata: {
        ...md,
        kind: md.kind ?? "credits_topup",
        itemLabel: md.itemLabel ?? "Credits top-up",
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
