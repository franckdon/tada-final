// src/app/api/invoices/[invoiceId]/pdf/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { renderInvoicePdfBuffer } from "@/lib/billing/invoice-pdf";

export async function GET(
  _req: Request,
  { params }: { params: { invoiceId: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoiceId = params.invoiceId;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        invoiceNumber: true,
        issuedAt: true,
        amountCents: true,
        currency: true,
        metadata: true,
        workspaceId: true,
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
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const pdf = await renderInvoicePdfBuffer({
      invoice: {
        id: String(invoice.id),
        invoiceNumber: invoice.invoiceNumber,
        issuedAt: invoice.issuedAt,
        amountCents: invoice.amountCents,
        currency: invoice.currency,
        metadata: invoice.metadata,
      },
      workspace: {
        id: String(invoice.workspace.id),
        name: invoice.workspace.name,
        country: invoice.workspace.country,
        city: invoice.workspace.city,
        street: invoice.workspace.street,
        owner: invoice.workspace.owner
          ? {
              id: String(invoice.workspace.owner.id),
              name: invoice.workspace.owner.name,
              email: invoice.workspace.owner.email,
            }
          : null,
      },
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
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 },
    );
  }
}
