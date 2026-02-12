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

// (optionnel) petit helper pour éviter les crashs si jamais un texte contient
// un caractère exotique non supporté par la police (rare avec Inter).
function safeText(s: string) {
  return (s ?? "").toString();
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

    // 1) Workspace + subscription active
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        workspacePlanSubscription: {
          select: {
            id: true,
            planCode: true,
            status: true,
            startsAt: true,
            endsAt: true,
          },
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

    // 2) Invoice liée à cette subscription
    // IMPORTANT:
    // - côté DB: invoice_number
    // - côté Prisma: si ton modèle a "invoiceNumber String @map("invoice_number")"
    //   alors tu dois sélectionner invoiceNumber (camelCase).
    // - sinon, si tu as gardé invoice_number dans Prisma (pas recommandé),
    //   tu devras sélectionner invoice_number.
    //
    // Ici je pars sur la version propre: invoiceNumber (camelCase Prisma).
    const invoice = await prisma.invoice.findUnique({
      where: { workspacePlanSubscriptionId: sub.id },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issuedAt: true,
        workspaceId: true,
        workspacePlanSubscriptionId: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found for this active subscription" },
        { status: 404 },
      );
    }

    // 3) Génération PDF (Unicode TTF)
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // 👉 adapte le chemin si tu as mis les fonts ailleurs
    const regularPath = path.join(
      process.cwd(),
      "src/assets/fonts/Inter-Regular.otf",
    );
    const boldPath = path.join(process.cwd(), "src/assets/fonts/Inter-Bold.otf");

    if (!fs.existsSync(regularPath) || !fs.existsSync(boldPath)) {
      return NextResponse.json(
        {
          error:
            "Font files not found. Expected Inter-Regular.otf and Inter-Bold.otf in src/assets/fonts",
        },
        { status: 500 },
      );
    }

    const regularBytes = fs.readFileSync(regularPath);
    const boldBytes = fs.readFileSync(boldPath);

    const font = await pdfDoc.embedFont(regularBytes, { subset: true });
    const bold = await pdfDoc.embedFont(boldBytes, { subset: true });

    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width } = page.getSize();

    // ---- Layout simple, propre ----
    const marginX = 50;
    let y = 800;

    // Header
    page.drawText("INVOICE", { x: marginX, y, size: 22, font: bold });
    page.drawText("Tada", {
      x: width - marginX - 60,
      y: y + 2,
      size: 18,
      font: bold,
      color: rgb(0.1, 0.1, 0.1),
    });

    y -= 30;
    page.drawText(`Invoice number: ${safeText(invoice.invoiceNumber)}`, {
      x: marginX,
      y,
      size: 12,
      font,
    });

    y -= 16;
    page.drawText(`Status: ${safeText(invoice.status)}`, {
      x: marginX,
      y,
      size: 12,
      font,
    });

    y -= 16;
    page.drawText(`Issued at: ${fmtDateFR(invoice.issuedAt)}`, {
      x: marginX,
      y,
      size: 12,
      font,
    });

    // Separator
    y -= 22;
    page.drawLine({
      start: { x: marginX, y },
      end: { x: width - marginX, y },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    });

    y -= 24;

    // Workspace block
    page.drawText("Billed to", { x: marginX, y, size: 11, font: bold });
    y -= 14;
    page.drawText(`${safeText(ws.name ?? ws.id)}`, {
      x: marginX,
      y,
      size: 12,
      font,
    });

    y -= 26;

    // Subscription block
    page.drawText("Subscription", { x: marginX, y, size: 11, font: bold });
    y -= 14;
    page.drawText(`Plan: ${String(sub.planCode).toUpperCase()}`, {
      x: marginX,
      y,
      size: 12,
      font,
    });

    y -= 16;
    page.drawText(
      `Period: ${fmtDateFR(sub.startsAt)} → ${fmtDateFR(sub.endsAt)}`,
      {
        x: marginX,
        y,
        size: 12,
        font,
      },
    );

    y -= 30;

    // Footer
    page.drawLine({
      start: { x: marginX, y: 70 },
      end: { x: width - marginX, y: 70 },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    });

    page.drawText("Generated by Tada • This document is for internal billing.", {
      x: marginX,
      y: 50,
      size: 9,
      font,
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
