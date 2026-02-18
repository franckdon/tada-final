// src/app/[locale]/pricing/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@tada/ui/lib/utils";
import { Button } from "@tada/ui/components/button";

import { auth } from "@/lib/auth";
import {
  PLAN_LIMITS,
  formatLimit,
  type PlanCode,
} from "@/lib/plans/plan-limits";
import { headers } from "next/headers";

// ✅ ajout : composant client (liste + download)
import { WorkspaceInvoicesClient } from "@/components/invoices/workspace-invoices-client";

type Locale = "fr" | "en";

function splitBullets(text: string | null | undefined) {
  return (text ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^\-\s*/, ""));
}

function isPlanCode(value: string): value is PlanCode {
  return (
    value === "starter" ||
    value === "growth" ||
    value === "business" ||
    value === "entreprise"
  );
}

function prettifyPlanCode(code: string) {
  const c = (code ?? "").trim();
  if (!c) return "—";
  return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
}

function formatDateShort(date: Date, locale: Locale) {
  try {
    return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale = "fr" } = await params;

  // 1) Plans visibles (cards)
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      bulletsFr: true,
      bulletsEn: true,
      sortOrder: true,
    },
  });

  const maxSortOrder = plans.reduce(
    (acc, p) => Math.max(acc, p.sortOrder ?? 0),
    0,
  );

  // 2) Session + workspaceId du user (pour plan actif + factures)
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Non authentifié");

  let workspaceIdForUser: string | null = null;

  let activePlanCode: string | null = null;
  let activePlanStatus: string | null = null;
  let activePlanEndsAt: Date | null = null;
  let activePlanStartsAt: Date | null = null;
  let activePlanLabel: string | null = null;

  if (session?.user?.id) {
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id, status: "active" },
      orderBy: [{ createdAt: "asc" }],
      select: { workspaceId: true },
    });

    if (membership?.workspaceId) {
      workspaceIdForUser = membership.workspaceId;

      const sub = await prisma.workspacePlanSubscription.findUnique({
        where: { workspaceId: membership.workspaceId },
        select: {
          planCode: true,
          status: true,
          startsAt: true,
          endsAt: true,
        },
      });

      const now = new Date();
      const isActive =
        !!sub &&
        (sub.status ?? "").toLowerCase() === "active" &&
        (!sub.endsAt || sub.endsAt > now);

      if (isActive) {
        activePlanCode = sub!.planCode ?? null;
        activePlanStatus = sub!.status ?? null;
        activePlanEndsAt = sub!.endsAt ?? null;
        activePlanStartsAt = sub!.startsAt ?? null;

        const planRow = activePlanCode
          ? await prisma.plan.findFirst({
              where: { code: activePlanCode },
              select: { name: true },
            })
          : null;

        activePlanLabel =
          planRow?.name ?? prettifyPlanCode(activePlanCode ?? "");
      }
    }
  }

  // Helper: Plan limits
  const getPlanLimits = (rawCode: string) => {
    const code: PlanCode = isPlanCode(rawCode) ? rawCode : "starter";
    return PLAN_LIMITS[code];
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {locale === "fr"
            ? "Choisissez le plan adapté à vos décisions."
            : "Choose the plan that fits your decisions."}
        </h1>
        <p className="text-sm text-gray-600">
          {locale === "fr"
            ? "Comparez nos offres et accédez aux fonctionnalités qui accélèrent vos études."
            : "Compare plans and access features that accelerate your research."}
        </p>
      </div>

      {/* Current Plan */}
      {activePlanCode ? (
        <div className="mb-8">
          <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{activePlanLabel}</h2>
                </div>

                <div className="text-sm text-gray-600">
                  {activePlanEndsAt ? (
                    <>
                      {locale === "fr"
                        ? "Prochaine échéance :"
                        : "Next billing:"}{" "}
                      <span className="font-medium">
                        {formatDateShort(activePlanEndsAt, locale)}
                      </span>
                    </>
                  ) : (
                    <>
                      {locale === "fr"
                        ? "Abonnement en cours"
                        : "Subscription in progress"}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                  {locale === "fr" ? "Actif" : "Active"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const bullets = splitBullets(
            locale === "fr" ? plan.bulletsFr : plan.bulletsEn,
          );

          const isFeatured =
            plan.sortOrder === maxSortOrder ||
            plan.name.toLowerCase().includes("enterprise");

          const limits = getPlanLimits(plan.code);

          const isCurrent =
            !!activePlanCode &&
            plan.code?.toLowerCase() === activePlanCode.toLowerCase();

          return (
            <PlanCard
              key={plan.id}
              plan={{
                name: plan.name,
                description: plan.description,
                respondentCompletesLabel: formatLimit(
                  limits.respondentCompletes,
                ),
                bullets,
              }}
              featured={isFeatured}
              locale={locale}
              isCurrent={isCurrent}
            />
          );
        })}
      </div>

      {/* ✅ Invoices list (juste en dessous) */}
      <div className="mt-10">
        {workspaceIdForUser ? (
          <WorkspaceInvoicesClient workspaceId={workspaceIdForUser} />
        ) : (
          <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-600">
            {locale === "fr"
              ? "Aucun workspace actif trouvé. Impossible d’afficher les factures."
              : "No active workspace found. Cannot display invoices."}
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  featured,
  locale,
  isCurrent,
}: {
  plan: {
    name: string;
    description: string | null;
    respondentCompletesLabel: string;
    bullets: string[];
  };
  featured: boolean;
  locale: Locale;
  isCurrent?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-white shadow-sm overflow-hidden",
        "flex flex-col min-h-[520px]",
        featured && "border-transparent",
        isCurrent &&
          !featured &&
          "ring-2 ring-emerald-500/40 border-emerald-200",
      )}
    >
      {isCurrent ? (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-600 text-white shadow">
            {locale === "fr" ? "Actuel" : "Current"}
          </span>
        </div>
      ) : null}

      {featured && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-orange-500 opacity-95" />
      )}

      <div
        className={cn(
          "relative p-7 flex flex-col flex-1",
          featured && "text-white",
        )}
      >
        <h3 className="text-2xl font-bold">{plan.name}</h3>

        <p className="mt-2 text-sm opacity-90">{plan.description || "—"}</p>

        <div className="mt-6">
          <div className="text-3xl font-bold">
            {plan.respondentCompletesLabel}
          </div>
          <div className="text-sm opacity-80">
            {locale === "fr"
              ? "Réponses (soumissions) incluses"
              : "Respondent completes included"}
          </div>
        </div>

        <div className="my-6 h-px bg-white/20" />

        <ul className="space-y-3">
          {plan.bullets.map((b, i) => (
            <li key={i} className="flex gap-2 items-start">
              <Check className="h-4 w-4 mt-1" />
              <span className="text-sm">{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-7">
          <Button
            asChild
            className={cn(
              "w-full h-11 rounded-xl font-semibold",
              featured
                ? "bg-white text-indigo-700 hover:bg-white/90"
                : "bg-blue-600 hover:bg-blue-700 text-white",
            )}
          >
            <Link
              href="https://calendly.com/tadaiq/30min"
              target="_blank"
              rel="noreferrer"
            >
              {locale === "fr" ? "Contactez-nous" : "Talk to us"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
