// src/app/api/workspaces/[workspaceId]/credits/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ParamsSchema = z.object({
  workspaceId: z.string().uuid(),
});

type Ctx =
  | { params: { workspaceId: string } }
  | { params: Promise<{ workspaceId: string }> };

function json(
  status: number,
  payload: Record<string, unknown>,
  extraHeaders?: Record<string, string>
) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      ...extraHeaders,
    },
  });
}

function isPrismaKnownError(err: unknown): err is { code?: string; meta?: any } {
  return typeof err === "object" && err !== null && "code" in err;
}

async function ensureAccountWithSqlFallback(workspaceId: string) {
  // 1) Détecte si la colonne est workspace_id ou workspaceId
  const cols = await prisma.$queryRaw<Array<{ column_name: string }>>`
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'workspace_credit_account'
  `;

  const colNames = new Set(cols.map((c) => c.column_name));
  const workspaceCol = colNames.has("workspace_id")
    ? "workspace_id"
    : colNames.has("workspaceId")
      ? "workspaceId"
      : null;

  if (!workspaceCol) {
    throw new Error(
      "workspace_credit_account table exists but workspace id column not found (expected workspace_id or workspaceId)"
    );
  }

  // 2) Upsert SQL (Postgres)
  // NB: on renvoie un shape compatible avec ton frontend
  if (workspaceCol === "workspace_id") {
    const rows = await prisma.$queryRaw<
      Array<{
        workspaceId: string;
        balance: number;
        currency: string;
        updatedAt: Date;
      }>
    >`
      insert into public.workspace_credit_account (workspace_id, balance, currency)
      values (${workspaceId}, 0, 'EUR')
      on conflict (workspace_id)
      do update set workspace_id = excluded.workspace_id
      returning
        workspace_id as "workspaceId",
        balance,
        currency,
        updated_at as "updatedAt"
    `;
    return rows[0]!;
  }

  // workspaceCol === "workspaceId"
  const rows = await prisma.$queryRaw<
    Array<{
      workspaceId: string;
      balance: number;
      currency: string;
      updatedAt: Date;
    }>
  >`
    insert into public.workspace_credit_account ("workspaceId", balance, currency)
    values (${workspaceId}, 0, 'EUR')
    on conflict ("workspaceId")
    do update set "workspaceId" = excluded."workspaceId"
    returning
      "workspaceId" as "workspaceId",
      balance,
      currency,
      updated_at as "updatedAt"
  `;
  return rows[0]!;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    // Next peut fournir params en Promise selon config/runtimes
    const rawParams =
      "then" in (ctx.params as any) ? await (ctx.params as any) : ctx.params;

    const parsed = ParamsSchema.safeParse(rawParams);
    if (!parsed.success) {
      return json(400, {
        success: false,
        error: "Invalid workspaceId",
        details: parsed.error.flatten(),
      });
    }

    const { workspaceId } = parsed.data;

    // Vérifie que le workspace existe (évite de créer un compte orphelin)
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true },
    });

    if (!ws) {
      return json(404, { success: false, error: "Workspace not found", workspaceId });
    }

    // Essai Prisma normal (si mapping OK)
    try {
      const account = await prisma.workspaceCreditAccount.upsert({
        where: { workspaceId },
        create: { workspaceId, balance: 0, currency: "EUR" },
        update: {},
        select: {
          workspaceId: true,
          balance: true,
          currency: true,
          updatedAt: true,
        },
      });

      return json(200, { success: true, data: account });
    } catch (err) {
      // Si Prisma explose sur une colonne manquante (P2022), fallback SQL
      if (isPrismaKnownError(err) && err.code === "P2022") {
        console.warn("[WORKSPACE_CREDITS_GET_WARN] Prisma mapping mismatch, using SQL fallback", {
          workspaceId,
          prismaCode: err.code,
          meta: err.meta,
        });

        const account = await ensureAccountWithSqlFallback(workspaceId);
        return json(200, { success: true, data: account });
      }

      // Autres erreurs Prisma
      throw err;
    }
  } catch (err) {
    console.error("[WORKSPACE_CREDITS_GET_ERROR]", err);
    return json(500, { success: false, error: "Internal server error" });
  }
}
