import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getMonthlyCredits } from "@/lib/plans/credits";
import type { PlanOverrides } from "@/lib/plans/plan-overrides";
import type { PlanCode } from "@/lib/plans/plan-limits";

function planLabelFromCode(code: string | null) {
  if (!code) return null;
  const c = code.toLowerCase();
  if (c === "starter") return "Starter";
  if (c === "growth") return "Growth";
  if (c === "business") return "Business";
  if (c === "entreprise") return "Entreprise";
  return code.charAt(0).toUpperCase() + code.slice(1);
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  if (value && typeof value === "object" && "toNumber" in value) {
    try {
      // @ts-expect-error runtime safe
      const n = value.toNumber();
      return Number.isFinite(n) ? n : 0;
    } catch {
      return 0;
    }
  }
  return 0;
}

function computeSubscriptionStatus(
  sub: { status?: unknown; startsAt?: unknown; endsAt?: unknown } | null,
  now: Date,
) {
  if (!sub) return "inactive";

  const status = String(sub.status ?? "inactive").toLowerCase();
  if (status !== "active") return status;

  const startsAt = sub.startsAt ? new Date(String(sub.startsAt)) : null;
  const endsAt = sub.endsAt ? new Date(String(sub.endsAt)) : null;

  if (startsAt && startsAt > now) return "scheduled";
  if (endsAt && endsAt <= now) return "expired";

  return "active";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<Record<string, string>> },
) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const p = await params;
    const workspaceId = String(p.id ?? p.workspaceId ?? "").trim();

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Missing workspace id" },
        { status: 400 },
      );
    }

    const now = new Date();

    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        creditAccount: {
          select: {
            id: true,
            balance: true,
            currency: true,
            updatedAt: true,
          },
        },
        workspacePlanSubscription: {
          select: {
            id: true,
            planCode: true,
            status: true,
            startsAt: true,
            endsAt: true,
            overrides: true,
          },
        },
      },
    });

    if (!ws) {
      return NextResponse.json(
        { success: false, error: "Workspace not found" },
        { status: 404 },
      );
    }

    const balanceRaw = ws.creditAccount?.balance ?? 0;
    const balance = toNumber(balanceRaw);
    const currency = ws.creditAccount?.currency ?? "EUR";

    const sub = ws.workspacePlanSubscription ?? null;
    const planCode = sub?.planCode ? String(sub.planCode) : null;
    const computedStatus = computeSubscriptionStatus(sub, now);

    const overrides = (sub?.overrides ?? null) as PlanOverrides | null;
    const monthlyCredits =
      planCode != null ? getMonthlyCredits(planCode as PlanCode, overrides) : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          workspaceId,
          balance,
          currency,
          monthlyCredits,
          subscription: {
            id: sub?.id ?? null,
            planCode,
            planLabel: planLabelFromCode(planCode),
            status: computedStatus,
            startsAt: sub?.startsAt ? new Date(sub.startsAt).toISOString() : null,
            endsAt: sub?.endsAt ? new Date(sub.endsAt).toISOString() : null,
          },
          debug: {
            hasCreditAccount: Boolean(ws.creditAccount?.id),
            balanceRawType: typeof balanceRaw,
            subscriptionStatusRaw: sub?.status ?? null,
          },
        },
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message ?? "Unexpected error" },
      { status: 500 },
    );
  }
}
