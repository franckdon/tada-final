import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prepareWorkspaceCreditsPurchase } from "@/lib/credits/prepare-workspace-credits-purchase";
import type { PlanCode } from "@/lib/plans/plan-limits";

/* ------------------------------------------------------------------ */
/* Utils */
/* ------------------------------------------------------------------ */

function isUuid(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const s = v.trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}

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

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

type Body = {
  credits: number;
  customerEmail?: string;
  billing?: unknown;
};

/* ------------------------------------------------------------------ */
/* Route */
/* ------------------------------------------------------------------ */

export async function POST(
  req: Request,
  ctx: { params: Promise<{ workspaceId: string }> },
) {
  try {
    /* -------------------------------------------------------------- */
    /* Headers & session */
    /* -------------------------------------------------------------- */

    const h = await headers();
    const session = await auth.api.getSession({ headers: h });

    console.log("[prepare] session", {
      userId: session?.user?.id,
      email: session?.user?.email,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* -------------------------------------------------------------- */
    /* Params */
    /* -------------------------------------------------------------- */

    const params = await ctx.params;
    const workspaceId = String(params?.workspaceId || "").trim();

    console.log("[prepare] raw params", params);
    console.log("[prepare] workspaceId", workspaceId);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    if (!isUuid(workspaceId)) {
      return NextResponse.json(
        { error: `workspaceId invalid UUID: "${workspaceId}"` },
        { status: 400 },
      );
    }

    /* -------------------------------------------------------------- */
    /* Body */
    /* -------------------------------------------------------------- */

    const body = (await req.json().catch(() => ({}))) as Body;

    console.log("[prepare] body", body);

    const credits = Number(body.credits ?? 0);
    if (!Number.isFinite(credits) || credits <= 0) {
      return NextResponse.json(
        { error: "credits must be a positive number" },
        { status: 400 },
      );
    }

    /* -------------------------------------------------------------- */
    /* Workspace lookup (source of truth) */
    /* -------------------------------------------------------------- */

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

    const organizationId = ws.organizationId;

    console.log("[prepare] resolved organizationId", organizationId);

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId missing on workspace" },
        { status: 400 },
      );
    }

    if (!isUuid(organizationId)) {
      return NextResponse.json(
        { error: `organizationId invalid UUID: "${organizationId}"` },
        { status: 400 },
      );
    }

    /* -------------------------------------------------------------- */
    /* Email (required by Paystack) */
    /* -------------------------------------------------------------- */

    const customerEmail =
      (body.customerEmail && String(body.customerEmail).trim()) ||
      session.user.email ||
      null;

    console.log("[prepare] customerEmail", customerEmail);

    if (!customerEmail) {
      return NextResponse.json(
        { error: "customerEmail is required (Paystack)" },
        { status: 400 },
      );
    }

    /* -------------------------------------------------------------- */
    /* Plan snapshot */
    /* -------------------------------------------------------------- */

    const planCode = computeActivePlanCode({
      sub: ws.workspacePlanSubscription,
      now: new Date(),
    });

    console.log("[prepare] active planCode", planCode);

    /* -------------------------------------------------------------- */
    /* Origin (callback) */
    /* -------------------------------------------------------------- */

    const origin =
      h.get("origin") ||
      h.get("x-forwarded-host") ||
      h.get("host") ||
      null;

    console.log("[prepare] origin", origin);

    /* -------------------------------------------------------------- */
    /* Prepare purchase */
    /* -------------------------------------------------------------- */

    const result = await prepareWorkspaceCreditsPurchase({
      workspaceId,
      organizationId,
      customerEmail,
      credits: Math.trunc(credits),
      workspacePlanCode: planCode,
      pricingTier: null,
      appOrigin: origin ? String(origin) : null,
      metadata: {
        billing: body.billing ?? null,
        userId: session.user.id,
      },
    });

    console.log("[prepare] purchase created", result.purchase);
    console.log("[prepare] paystack payload", result.paystack);

    return NextResponse.json(
      {
        purchase: result.purchase,
        paystack: result.paystack,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[prepare] FATAL ERROR", err);
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 },
    );
  }
}
