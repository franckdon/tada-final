// src/app/api/workspaces/[id]/subscription/invoice/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "node:fs";
import path from "node:path";

function isActiveSubscription(sub: any) {
  if (!sub) return false;
  if (sub.status !== "active") return false;
  if (!sub.endsAt) return true;
  return new Date(sub.endsAt).getTime() > Date.now();
}

function fmtDateFR(d?: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR");
}

function safeText(s: any) {
  return (s ?? "").toString();
}

// XOF: pas de décimales, pas de /100
function formatXof(amountXof: number) {
  const amount = Number.isFinite(amountXof) ? amountXof : 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}

function textWidth(font: any, size: number, text: string) {
  return font.widthOfTextAtSize(text, size);
}

function drawTextRight(
  page: any,
  font: any,
  size: number,
  xRight: number,
  y: number,
  text: string,
  color = rgb(0, 0, 0),
) {
  const w = textWidth(font, size, text);
  page.drawText(text, { x: xRight - w, y, size, font, color });
}

function drawTextCenter(
  page: any,
  font: any,
  size: number,
  centerX: number,
  y: number,
  text: string,
  color = rgb(0, 0, 0),
) {
  const w = textWidth(font, size, text);
  page.drawText(text, { x: centerX - w / 2, y, size, font, color });
}

type PaymentMethod = "cash" | "cheque" | "bank_transfer" | "mobile_money";

function paymentLabel(m?: PaymentMethod) {
  switch (m) {
    case "cash":
      return "Espece";
    case "cheque":
      return "Cheque";
    case "bank_transfer":
      return "Virement";
    case "mobile_money":
      return "Mobile Money";
    default:
      return "—";
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.id;

    // 1) Workspace + owner + subscription active
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

    if (!ws) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const sub = ws.workspacePlanSubscription;
    if (!isActiveSubscription(sub)) {
      return NextResponse.json(
        { error: "No active subscription for this workspace" },
        { status: 400 },
      );
    }

    // 2) Invoice
    const invoice = await prisma.invoice.findUnique({
      where: { workspacePlanSubscriptionId: sub.id },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issuedAt: true,
        amountCents: true, // traite comme XOF entier
        currency: true,
        metadata: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found for this active subscription" },
        { status: 404 },
      );
    }

    const md: any = invoice.metadata ?? {};
    const billing = md?.billing ?? {};
    const creditsQty = Number(billing?.creditsQty ?? 1);
    const unitPriceXof = Number(billing?.unitPriceXof ?? 9000);
    const amountXof = Number(billing?.amountXof ?? invoice.amountCents ?? 0);
    const payMethod = billing?.paymentMethod as PaymentMethod | undefined;

    // Billed to
    const billedCompanyName = ws.name || "Company name";
    const billedOwnerName = ws.owner?.name || "Workspace owner";
    const billedEmail = ws.owner?.email || "email@example.com";
    const billedAddressParts = [ws.street, ws.city, ws.country].filter(Boolean);
    const billedAddress = billedAddressParts.length
      ? billedAddressParts.join(", ")
      : "Address";

    const paymentDate = fmtDateFR(invoice.issuedAt);
    const paymentRef = safeText(md?.providerRef || "—");

    // 3) PDF (TTF + bold partout)
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const regularPath = path.join(process.cwd(), "src/assets/fonts/Inter-Regular.ttf");
    const boldPath = path.join(process.cwd(), "src/assets/fonts/Inter-Bold.ttf");

    if (!fs.existsSync(regularPath) || !fs.existsSync(boldPath)) {
      return NextResponse.json(
        { error: "Fonts not found. Expected Inter-Regular.ttf and Inter-Bold.ttf in src/assets/fonts" },
        { status: 500 },
      );
    }

    // ✅ subset OK en TTF (plus stable). Si tu veux encore plus safe: subset: false
    const bold = await pdfDoc.embedFont(fs.readFileSync(boldPath), { subset: true });
    const fontAll = bold; // ✅ tout en gras

    const logoPath = path.join(process.cwd(), "src/assets/logos/icon-tada.png");
    if (!fs.existsSync(logoPath)) {
      return NextResponse.json(
        { error: "Logo not found. Expected src/assets/logos/icon-tada.png" },
        { status: 500 },
      );
    }
    const logoImg = await pdfDoc.embedPng(fs.readFileSync(logoPath));

    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // --- tailles réduites ---
    const S_TITLE = 18;
    const S_H = 10;
    const S_B = 9;
    const S_SMALL = 8;

    const marginX = 60;
    const top = height - 70;

    // Header centered
    const logoW = 56;
    const logoH = (logoImg.height / logoImg.width) * logoW;

    page.drawImage(logoImg, {
      x: width / 2 - logoW / 2,
      y: top - logoH,
      width: logoW,
      height: logoH,
    });

    drawTextCenter(page, fontAll, S_TITLE, width / 2, top - logoH - 28, "INVOICE", rgb(0.1, 0.1, 0.1));

    // Company (left)
    let y = top - logoH - 88;

    page.drawText("TADA IQ SARL", { x: marginX, y, size: S_H, font: fontAll });
    y -= 14;
    page.drawText("support@tadaiq.com", { x: marginX, y, size: S_B, font: fontAll });
    y -= 12;
    page.drawText("RCCM: CI-ABJ-03-2025-B12-03673", { x: marginX, y, size: S_B, font: fontAll });
    y -= 12;
    page.drawText("Abidjan, Cote d'Ivoire", { x: marginX, y, size: S_B, font: fontAll });

    // Billed to (right)
    const rightX = width - marginX;
    let yr = top - logoH - 104;

    drawTextRight(page, fontAll, S_H, rightX, yr, "BILLED TO:");
    yr -= 16;

    drawTextRight(page, fontAll, S_H, rightX, yr, `${safeText(billedCompanyName)} (Company name)`);
    yr -= 14;
    drawTextRight(page, fontAll, S_B, rightX, yr, `${safeText(billedOwnerName)} (workspace owner)`);
    yr -= 14;

    drawTextRight(page, fontAll, S_B, rightX, yr, `${safeText(billedEmail)} (email)`, rgb(0.1, 0.3, 0.8));
    yr -= 14;
    drawTextRight(page, fontAll, S_B, rightX, yr, `${safeText(billedAddress)} (adresse)`);

    yr -= 22;
    drawTextRight(page, fontAll, S_B, rightX, yr, `Invoice #: ${safeText(invoice.invoiceNumber)}`);
    yr -= 12;
    drawTextRight(page, fontAll, S_B, rightX, yr, `Date: ${fmtDateFR(invoice.issuedAt)}`);

    // Table
    const tableTopY = 420;
    const tableX = marginX;
    const tableW = width - marginX * 2;
    const tableH = 90;

    const col1 = tableW * 0.40;
    const col2 = tableW * 0.20;
    const col3 = tableW * 0.20;
    const col4 = tableW * 0.20;

    page.drawRectangle({
      x: tableX,
      y: tableTopY - tableH,
      width: tableW,
      height: tableH,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1.2,
    });

    const headerRowH = 28;
    page.drawLine({
      start: { x: tableX, y: tableTopY - headerRowH },
      end: { x: tableX + tableW, y: tableTopY - headerRowH },
      thickness: 1.0,
      color: rgb(0, 0, 0),
    });

    const x1 = tableX + col1;
    const x2 = x1 + col2;
    const x3 = x2 + col3;

    [x1, x2, x3].forEach((vx) => {
      page.drawLine({
        start: { x: vx, y: tableTopY },
        end: { x: vx, y: tableTopY - tableH },
        thickness: 1.0,
        color: rgb(0, 0, 0),
      });
    });

    const headerY = tableTopY - 19;
    drawTextCenter(page, fontAll, S_B, tableX + col1 / 2, headerY, "Item");
    drawTextCenter(page, fontAll, S_B, x1 + col2 / 2, headerY, "Quantity");
    drawTextCenter(page, fontAll, S_B, x2 + col3 / 2, headerY, "Unit Price");
    drawTextCenter(page, fontAll, S_B, x3 + col4 / 2, headerY, "Total");

    const rowY = tableTopY - headerRowH - 23;

    page.drawText(`Credits (${String(sub.planCode).toUpperCase()})`, {
      x: tableX + 10,
      y: rowY,
      size: S_B,
      font: fontAll,
    });

    drawTextCenter(page, fontAll, S_B, x1 + col2 / 2, rowY, String(creditsQty));
    drawTextCenter(page, fontAll, S_B, x2 + col3 / 2, rowY, formatXof(unitPriceXof));
    drawTextCenter(page, fontAll, S_B, x3 + col4 / 2, rowY, formatXof(amountXof));

    // Totals
    const totalsXRight = width - marginX;
    const totalsY = 300;

    drawTextRight(page, fontAll, S_H, totalsXRight, totalsY, `Subtotal: ${formatXof(amountXof)}`);
    drawTextRight(page, fontAll, S_H, totalsXRight, totalsY - 16, `Tax: ${formatXof(0)}`);
    drawTextRight(page, fontAll, 16, totalsXRight, totalsY - 54, `Total Amount: ${formatXof(amountXof)}`);

    // Payment block
    const payY = 240;

    page.drawText("Payment method:", { x: marginX, y: payY, size: S_B, font: fontAll });
    page.drawText(paymentLabel(payMethod), { x: marginX + 120, y: payY, size: S_B, font: fontAll });

    page.drawText("Payment date:", { x: marginX, y: payY - 14, size: S_B, font: fontAll });
    page.drawText(paymentDate, { x: marginX + 120, y: payY - 14, size: S_B, font: fontAll });

    page.drawText("Reference ID:", { x: marginX, y: payY - 28, size: S_B, font: fontAll });
    page.drawText(paymentRef, { x: marginX + 120, y: payY - 28, size: S_B, font: fontAll });

    // Footer
    page.drawText("Generated by Tada", {
      x: marginX,
      y: 48,
      size: S_SMALL,
      font: fontAll,
      color: rgb(0.4, 0.4, 0.4),
    });

    const pdfBytes = await pdfDoc.save();
    const filename = `${invoice.invoiceNumber}.pdf`;

    return new Response(Buffer.from(pdfBytes), {
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
