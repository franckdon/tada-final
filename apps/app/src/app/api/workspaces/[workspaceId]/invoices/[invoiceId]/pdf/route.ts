// src/app/api/workspaces/[workspaceId]/invoices/[invoiceId]/pdf/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { renderInvoicePdfBuffer } from "@/lib/billing/invoice-pdf";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { workspaceId: string; invoiceId: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.workspaceId;
    const invoiceId = params.invoiceId;

    if (!workspaceId || !invoiceId) {
      return NextResponse.json({ success: false, error: "Missing params" }, { status: 400 });
    }

    // 1) Charge invoice + workspace (le PDF en a besoin)
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
        workspaceId: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    const workspace = await prisma.workspace.findUnique({
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

    if (!workspace) {
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 404 });
    }

    // 2) (Optionnel mais recommandé) contrôle d'accès :
    // - soit owner
    // - soit membre
    // ⚠️ adapte à ton schema (workspaceMember / workspace_user / membership, etc.)
    // Ici: contrôle minimum = owner uniquement
    if (workspace.owner?.id !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // 3) Render PDF
    const pdfBuffer = await renderInvoicePdfBuffer({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        issuedAt: invoice.issuedAt,
        amountCents: invoice.amountCents,
        currency: invoice.currency,
        metadata: invoice.metadata,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        country: workspace.country,
        city: workspace.city,
        street: workspace.street,
        owner: workspace.owner
          ? { id: workspace.owner.id, name: workspace.owner.name, email: workspace.owner.email }
          : null,
      },
    });

    const filename = `${invoice.invoiceNumber || invoice.id}.pdf`;

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message ?? "Unexpected error" },
      { status: 500 },
    );
  }
}
