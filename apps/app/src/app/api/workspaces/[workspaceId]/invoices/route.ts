//src/app/api/workspaces/[workspaceId]/invoices/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

function toInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100) : fallback;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId = params.id;
  const url = new URL(req.url);

  const limit = toInt(url.searchParams.get("limit"), 25);
  const cursor = url.searchParams.get("cursor"); // invoice.id

  // (optionnel) check workspace exists
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true },
  });
  if (!ws) {
    return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 404 });
  }

  const rows = await prisma.invoice.findMany({
    where: { workspaceId },
    orderBy: [{ issuedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    select: {
      id: true,
      status: true,
      issuedAt: true,
      createdAt: true,
      workspacePlanSubscriptionId: true,
      workspaceCreditTransactionId: true,
      // IMPORTANT: ton champ prisma s’appelle invoiceNumber (pas invoice_number)
      invoiceNumber: true,
    },
  });

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;

  const nextCursor = hasMore ? data[data.length - 1]?.id ?? null : null;

  return NextResponse.json({
    success: true,
    data,
    nextCursor,
  });
}
