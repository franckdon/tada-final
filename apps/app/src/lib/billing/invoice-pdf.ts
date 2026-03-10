import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "node:fs";
import path from "node:path";

type PaymentMethod = "cash" | "cheque" | "bank_transfer" | "mobile_money";

function fmtDateFR(d?: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR");
}

function safeText(s: any) {
  return (s ?? "").toString();
}

// XOF: pas de décimales
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

export type InvoicePdfInput = {
  invoice: {
    id: string;
    invoiceNumber?: string | null;
    issuedAt?: Date | string | null;
    amountCents?: number | null; // XOF integer
    currency?: string | null;
    metadata?: any;
  };
  workspace: {
    id: string;
    name?: string | null;
    country?: string | null;
    city?: string | null;
    street?: string | null;
    owner?: { id: string; name?: string | null; email?: string | null } | null;
  };
};

export async function renderInvoicePdfBuffer(input: InvoicePdfInput): Promise<Buffer> {
  const { invoice, workspace } = input;

  const md: any = invoice.metadata ?? {};
  const billing = md?.billing ?? {};

  const creditsQty = Number(billing?.creditsQty ?? 1);
  const unitPriceXof = Number(billing?.unitPriceXof ?? 0);
  const amountXof = Number(billing?.amountXof ?? invoice.amountCents ?? 0);
  const payMethod = billing?.paymentMethod as PaymentMethod | undefined;

  const billedCompanyName = workspace.name || "Company name";
  const billedOwnerName = workspace.owner?.name || "Workspace owner";
  const billedEmail = workspace.owner?.email || "email@example.com";
  const billedAddressParts = [workspace.street, workspace.city, workspace.country].filter(Boolean);
  const billedAddress = billedAddressParts.length ? billedAddressParts.join(", ") : "Address";

  const paymentDate = fmtDateFR(invoice.issuedAt);
  const paymentRef = safeText(md?.providerRef || "—");

  const itemLabelFromMd = safeText(md?.itemLabel || "Credits");
  const qtyLabel = Number.isFinite(creditsQty) && creditsQty > 0 ? String(creditsQty) : "—";
  const unitPriceLabel =
    Number.isFinite(unitPriceXof) && unitPriceXof > 0 ? formatXof(unitPriceXof) : "—";

  // PDF
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const boldPath = path.join(process.cwd(), "src/assets/fonts/Inter-Bold.ttf");
  if (!fs.existsSync(boldPath)) {
    throw new Error(
      "Fonts not found. Expected Inter-Bold.ttf in src/assets/fonts",
    );
  }

  const fontAll = await pdfDoc.embedFont(fs.readFileSync(boldPath), { subset: true });

  const logoPath = path.join(process.cwd(), "src/assets/logos/icon-tada.png");
  if (!fs.existsSync(logoPath)) {
    throw new Error("Logo not found. Expected src/assets/logos/icon-tada.png");
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

  drawTextRight(page, fontAll, S_H, rightX, yr, `${safeText(billedCompanyName)}`);
  yr -= 14;
  drawTextRight(page, fontAll, S_B, rightX, yr, `${safeText(billedOwnerName)}`);
  yr -= 14;

  drawTextRight(page, fontAll, S_B, rightX, yr, `${safeText(billedEmail)}`, rgb(0.1, 0.3, 0.8));
  yr -= 14;
  drawTextRight(page, fontAll, S_B, rightX, yr, `${safeText(billedAddress)}`);

  yr -= 22;
  drawTextRight(page, fontAll, S_B, rightX, yr, `Invoice #: ${safeText(invoice.invoiceNumber ?? invoice.id)}`);
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

  page.drawText(itemLabelFromMd, {
    x: tableX + 10,
    y: rowY,
    size: S_B,
    font: fontAll,
  });

  drawTextCenter(page, fontAll, S_B, x1 + col2 / 2, rowY, qtyLabel);
  drawTextCenter(page, fontAll, S_B, x2 + col3 / 2, rowY, unitPriceLabel);
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
  return Buffer.from(pdfBytes);
}
