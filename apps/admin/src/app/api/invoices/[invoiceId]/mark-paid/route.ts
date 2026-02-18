import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: { invoiceId: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoiceId = params.invoiceId; // ✅ IMPORTANT: invoiceId (pas id)
    if (!invoiceId) {
      return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });
    }

    const inv = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true, status: true },
    });

    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (String(inv.status).toLowerCase() === "paid") {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "paid",
        updatedAt: new Date(),
      },
      select: { id: true, status: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, invoice: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 },
    );
  }
}
