// src/app/api/workspaces/[id]/credits/transactions/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const clampInt = (v: any, def: number, min: number, max: number) => {
  const n = Number.parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, n));
};

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.id;

    const url = new URL(req.url);
    const page = clampInt(url.searchParams.get("page"), 1, 1, 10_000);
    const pageSize = clampInt(url.searchParams.get("pageSize"), 20, 5, 100);

    const direction = url.searchParams.get("direction"); // "credit" | "debit" | null
    const reason = url.searchParams.get("reason"); // string | null

    // 1) Get credit account id for workspace
    const account = await prisma.workspace_credit_account.findUnique({
      where: { workspace_id: workspaceId },
      select: { id: true },
    });

    // Si le workspace n'a pas encore de compte crédits => historique vide
    if (!account) {
      return NextResponse.json({
        items: [],
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      });
    }

    const where: any = {
      credit_account_id: account.id,
    };

    if (direction === "credit" || direction === "debit") {
      where.direction = direction;
    }
    if (reason && String(reason).trim().length > 0) {
      where.reason = String(reason).trim();
    }

    const [total, rows] = await prisma.$transaction([
      prisma.workspace_credit_transaction.count({ where }),
      prisma.workspace_credit_transaction.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          direction: true,
          amount: true,
          reason: true,
          reference_id: true,
          description: true,
          balance_after: true,
          created_at: true,
          actor_user_id: true,
          metadata: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      items: rows,
      page,
      pageSize,
      total,
      totalPages,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 },
    );
  }
}
