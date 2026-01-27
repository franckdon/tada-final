// src/app/api/workspaces/[workspaceId]/credits/purchase/prepare/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prepareWorkspaceCreditsPurchase } from "@/lib/credits/prepare-workspace-credits-purchase";
import type { PlanCode } from "@/lib/plans/plan-limits";

type Body = {
  credits: number;
  organizationId?: string; // optional, but we won't trust it if it doesn't match workspace
  customerEmail?: string;
  billing?: unknown;
};

function computeActivePlanCode(input: {
  sub:
    | {
        planCode: string;
        status: string;
        startsAt: Date | null;
        endsAt: Date | null;
      }
    | null;
  now: Date;
}): PlanCode | null {
  const sub = input.sub;
  if (!sub) return null;

  const isActive =
    sub.status === "active" &&
    (!sub.startsAt || sub.startsAt <= input.now) &&
    (!sub.endsAt || sub.endsAt > input.now);

  if (!isActive) return null;

  const code = String(sub.planCode);
  if (
    code === "starter" ||
    code === "growth" ||
    code === "business" ||
    code === "entreprise"
  ) {
    return code;
  }
  return null;
}

function asNonEmptyString(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ workspaceId: string }> },
) {
  const startedAt = Date.now();

  try {
    const h = await headers();

    // ---- Session (Better Auth)
    const session = await auth.api.getSession({ headers: h });
    const userId = session?.user?.id ?? null;
    const email = session?.user?.email ?? null;

    console.log("[prepare] session", { userId, email });

    if (!userId) {
      console.log("[prepare] unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ---- Params
    const rawParams = await ctx.params;
    console.log("[prepare] raw params", rawParams);

    const workspaceId = asNonEmptyString(rawParams?.workspaceId);
    console.log("[prepare] workspaceId", workspaceId);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    // ---- Body
    const body = (await req.json().catch(() => ({}))) as Body;
    console.log("[prepare] body", body);

    const credits = Number(body.credits ?? 0);
    if (!Number.isFinite(credits) || credits <= 0) {
      console.log("[prepare] invalid credits", { credits });
      return NextResponse.json(
        { error: "credits must be a positive number" },
        { status: 400 },
      );
    }

    // ---- Workspace snapshot
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        organizationId: true,
        workspacePlanSubscription: {
          select: {
            planCode: true,
            status: true,
            startsAt: true,
            endsAt: true,
          },
        },
      },
    });

    console.log("[prepare] workspace", ws);

    if (!ws) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // IMPORTANT:
    // organizationId in your DB is NOT a UUID (BetterAuth-like id).
    // So we validate as "non-empty string" only.
    const wsOrgId = asNonEmptyString(ws.organizationId);
    const bodyOrgId = asNonEmptyString(body.organizationId);

    // Anti-tampering: if client sends an orgId that doesn't match the workspace, ignore it.
    let organizationId = wsOrgId;

    if (bodyOrgId && wsOrgId && bodyOrgId !== wsOrgId) {
      console.log("[prepare] body.organizationId ignored (mismatch)", {
        bodyOrgId,
        wsOrgId,
      });
    } else if (bodyOrgId && !wsOrgId) {
      // In case workspace has no orgId (rare), allow body to provide it.
      organizationId = bodyOrgId;
      console.log("[prepare] organizationId taken from body (workspace had null)", {
        organizationId,
      });
    }

    console.log("[prepare] resolved organizationId", organizationId);

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is missing on workspace and body" },
        { status: 400 },
      );
    }

    // ---- Email (Paystack needs an email)
    const customerEmail =
      asNonEmptyString(body.customerEmail) || asNonEmptyString(email);

    console.log("[prepare] resolved customerEmail", customerEmail);

    if (!customerEmail) {
      return NextResponse.json(
        { error: "customerEmail is required (Paystack needs an email)" },
        { status: 400 },
      );
    }

    // ---- Active plan
    const now = new Date();
    const planCode = computeActivePlanCode({
      sub: ws.workspacePlanSubscription,
      now,
    });

    console.log("[prepare] planCode", planCode);

    // ---- Origin
    // origin is often null in dev; build a safe fallback
    const origin =
      asNonEmptyString(h.get("origin")) ||
      asNonEmptyString(h.get("x-forwarded-proto")) && asNonEmptyString(h.get("x-forwarded-host"))
        ? `${h.get("x-forwarded-proto")}:${"//"}${h.get("x-forwarded-host")}`
        : null;

    const appOrigin =
      origin ||
      (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");

    console.log("[prepare] origin/appOrigin", { origin, appOrigin });

    // ---- Call lib
    const result = await prepareWorkspaceCreditsPurchase({
      workspaceId,
      organizationId,
      customerEmail,
      credits: Math.trunc(credits),
      workspacePlanCode: planCode,
      pricingTier: null,
      appOrigin: appOrigin || "http://localhost:3000",
    });

    console.log("[prepare] success", {
      purchaseId: result.purchase.id,
      providerRef: result.purchase.providerRef,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json(
      { purchase: result.purchase, paystack: result.paystack },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[prepare] error", err);

    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 },
    );
  }
}
