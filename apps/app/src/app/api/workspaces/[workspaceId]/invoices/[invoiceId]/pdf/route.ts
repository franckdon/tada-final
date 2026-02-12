//src/app/api/workspaces/[workspaceId]/invoices/[invoiceId]/pdf/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";

function fmtDateFR(d?: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR");
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string; invoiceId: string } },
) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = params.id;
  const invoiceId = params.invoiceId;

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, workspaceId },
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      issuedAt: true,
      workspaceId: true,
      workspacePlanSubscriptionId: true,
      workspaceCreditTransactionId: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true },
  });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;

  page.drawText("INVOICE", { x: 50, y, size: 22, font: bold });
  y -= 35;

  page.drawText(`Invoice number: ${invoice.invoiceNumber}`, { x: 50, y, size: 12, font });
  y -= 18;

  page.drawText(`Status: ${invoice.status}`, { x: 50, y, size: 12, font });
  y -= 18;

  page.drawText(`Issued at: ${fmtDateFR(invoice.issuedAt)}`, { x: 50, y, size: 12, font });
  y -= 30;

  page.drawText(`Workspace: ${ws?.name ?? ws?.id ?? invoice.workspaceId}`, {
    x: 50,
    y,
    size: 12,
    font,
  });
  y -= 18;

  // On évite "→" pour éviter WinAnsi
  page.drawText(
    `Source: ${
      invoice.workspacePlanSubscriptionId
        ? "Plan subscription"
        : invoice.workspaceCreditTransactionId
          ? "Credit transaction"
          : "—"
    }`,
    { x: 50, y, size: 12, font },
  );

  const pdfBytes = await pdfDoc.save();
  const filename = `${invoice.invoiceNumber}.pdf`;

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
