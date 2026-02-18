// src/app/api/workspaces/[workspaceId]/invoices/[invoiceId]/pdf/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { renderInvoicePdfBuffer } from "@/lib/billing/invoice-pdf";

export const runtime = "nodejs";

function safeId(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function safeFilename(name: string) {
  return name.replace(/[^\w\-\.]+/g, "_").slice(0, 80);
}

export async function GET(
  _req: Request,
  { params }: { params: { workspaceId: string; invoiceId: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    const userId = session?.user?.id ?? null;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const workspaceId = safeId(params.workspaceId);
    const invoiceId = safeId(params.invoiceId);

    if (!workspaceId || !invoiceId) {
      return NextResponse.json(
        { success: false, error: "Missing params" },
        { status: 400 },
      );
    }

    // 1) Invoice (scopée workspace)
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
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 },
      );
    }

    // ✅ Only allow download for paid invoices
    const invoiceStatus = String(invoice.status ?? "").toLowerCase();
    if (invoiceStatus !== "paid") {
      return NextResponse.json(
        { success: false, error: "Invoice not paid" },
        { status: 403 },
      );
    }

    // 2) Workspace
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
      return NextResponse.json(
        { success: false, error: "Workspace not found" },
        { status: 404 },
      );
    }

    // 3) Access control: owner OR active member
    const isOwner = workspace.owner?.id === userId;

    const isMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
        status: "active",
      },
      select: { id: true },
    });

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // 4) Render PDF
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
          ? {
              id: workspace.owner.id,
              name: workspace.owner.name,
              email: workspace.owner.email,
            }
          : null,
      },
    });

    const base = invoice.invoiceNumber || invoice.id;
    const filename = safeFilename(`${base}.pdf`);

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
