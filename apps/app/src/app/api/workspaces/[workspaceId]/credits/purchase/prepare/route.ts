import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prepareWorkspaceCreditsPurchase } from "@/lib/credits/prepare-workspace-credits-purchase";
import type { PlanCode } from "@/lib/plans/plan-limits";

type Body = {
  credits: number;
  // optional: you can pass organizationId if you want to avoid resolving it
  organizationId?: string;
  // optional: override email if needed
  customerEmail?: string;
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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.id;
    const body = (await req.json().catch(() => ({}))) as Body;

    const credits = Number(body.credits ?? 0);
    if (!Number.isFinite(credits) || credits <= 0) {
      return NextResponse.json(
        { error: "credits must be a positive number" },
        { status: 400 },
      );
    }

    // Resolve workspace + org + subscription snapshot
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

    if (!ws) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const organizationId = body.organizationId ?? ws.organizationId;
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 },
      );
    }

    // customer email (paystack requires email)
    const customerEmail =
      (body.customerEmail && String(body.customerEmail).trim()) ||
      session.user.email ||
      null;

    if (!customerEmail) {
      return NextResponse.json(
        { error: "customerEmail is required (Paystack needs an email)" },
        { status: 400 },
      );
    }

    const now = new Date();
    const planCode = computeActivePlanCode({
      sub: ws.workspacePlanSubscription,
      now,
    });

    // Determine origin for callback URL
    const h = headers();
    const origin =
      h.get("x-forwarded-proto") && h.get("x-forwarded-host")
        ? `${h.get("x-forwarded-proto")}://${h.get("x-forwarded-host")}`
        : new URL(req.url).origin;

    const result = await prepareWorkspaceCreditsPurchase({
      workspaceId,
      organizationId,
      customerEmail,
      credits: Math.trunc(credits),
      workspacePlanCode: planCode,
      pricingTier: null,
      appOrigin: origin,
    });

    return NextResponse.json(
      {
        purchase: result.purchase,
        paystack: result.paystack,
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 },
    );
  }
}
