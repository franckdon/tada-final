"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";

import { useScopedI18n } from "@/locales/client";
import { useWorkspaceCreditsPurchaseStore } from "@/hooks/use-workspace-credits-purchase-store";

import {
  PLAN_LIMITS,
  formatLimit,
  type PlanCode,
} from "@/lib/plans/plan-limits";

/**
 * Plans returned by /api/plans (your API returns: id, code, name, description, price, currency, interval, features, bulletsFr, bulletsEn)
 */
type AppPlan = {
  id: string;
  code: PlanCode;
  name: string;
  description: string | null;
  price: number;
  currency: "EUR";
  interval: "year" | "month";
  features: { text: string; included: boolean }[];
  bulletsFr?: string | null;
  bulletsEn?: string | null;
};

/**
 * Keep this aligned with your /api/organizations/:id/subscription response.
 * NOTE: "Plan" type is referenced in your codebase already (likely from Prisma or your domain types).
 * If it isn't in scope here, import it from the correct module.
 */
type SubscriptionResponse =
  | {
      subscription: {
        id: string;
        status: string;
        organizationId: string;
        planId: string;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        stripePriceId: string | null;
        currentPeriodStart: string;
        currentPeriodEnd: string;
        cancelAtPeriodEnd: boolean;
        trialEnd: string | null;
        metadata: unknown | null;
        createdAt: string;
        updatedAt: string;
      };
      plan: Plan;
    }
  | { subscription: null; plan: null };

function isPlanCode(value: string): value is PlanCode {
  return (
    value === "starter" ||
    value === "growth" ||
    value === "business" ||
    value === "entreprise"
  );
}

export function CreditsModal({
  open = true,
  toggleOpen = () => {},
  handleAsYouGo = () => {},
  organizationId,
  workspaceId,
}: {
  open?: boolean;
  toggleOpen?: () => void;
  handleAsYouGo?: () => void;
  organizationId?: string;
  workspaceId: string;
}) {
  const commonT = useScopedI18n("common");
  const t = useScopedI18n("creditsModal");

  const {
    workspaceId: storeWorkspaceId,
    credits,
    unitPrice,
    currency,
    setWorkspaceId,
    setCredits,
    setUnitPrice,
    setCurrency,
  } = useWorkspaceCreditsPurchaseStore();

  const safeCredits =
    typeof credits === "number" && Number.isFinite(credits) ? credits : 0;

  const total = (safeCredits * unitPrice).toFixed(2);

  const [loadingPlan, setLoadingPlan] = React.useState(false);
  const [plan, setPlan] = React.useState<Plan | null>(null);
  const [notFound, setNotFound] = React.useState(false);

  const pathname = usePathname();
  const locale = React.useMemo(
    () => pathname.split("/")[1] || "fr",
    [pathname],
  );

  const [plans, setPlans] = React.useState<AppPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = React.useState(false);

  React.useEffect(() => {
    if (workspaceId && workspaceId !== storeWorkspaceId) {
      setWorkspaceId(workspaceId);
    }
  }, [workspaceId, storeWorkspaceId, setWorkspaceId]);

  React.useEffect(() => {
    if (!organizationId) {
      setPlan(null);
      setNotFound(true);
      return;
    }

    let isMounted = true;
    setLoadingPlan(true);
    setNotFound(false);

    fetch(`/api/organizations/${organizationId}/subscription`)
      .then(async (res) => {
        if (!isMounted) return;

        const data: SubscriptionResponse = await res.json();

        if ("plan" in data && data.plan) {
          setPlan(data.plan);
          // For "as you go" block only:
          setUnitPrice((data.plan as any)?.addOn ?? 17);
          setCurrency((data.plan as any)?.currency ?? "EUR");
          setNotFound(false);
        } else {
          setPlan(null);
          setNotFound(true);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setPlan(null);
        setNotFound(true);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoadingPlan(false);
      });

    return () => {
      isMounted = false;
    };
  }, [organizationId, setUnitPrice, setCurrency]);

  React.useEffect(() => {
    let mounted = true;
    setLoadingPlans(true);

    fetch(`/api/plans?locale=${encodeURIComponent(locale)}`)
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!mounted) return;
        if (!res.ok) throw new Error(json?.error || "Failed to fetch plans");
        setPlans(Array.isArray(json?.data) ? json.data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setPlans([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingPlans(false);
      });

    return () => {
      mounted = false;
    };
  }, [locale]);

  const handleCreditsChange = (value: string) => {
    const n = Number(value);
    setCredits(Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0);
  };

  const handleEnhancedAsYouGo = () => {
    const billingData = {
      credits: safeCredits,
      workspaceId: storeWorkspaceId || workspaceId,
      total: parseFloat(total),
      unitPrice,
      currency,
    };

    console.log("Workspace credits purchase:", billingData);
    handleAsYouGo();
  };

  return (
    <Dialog open={open} onOpenChange={toggleOpen}>
      <DialogContent className="sm:max-w-6xl p-0 rounded-lg max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6 flex-grow">
          {/* Brands */}
          <div className="bg-[#F5F5F5] py-5 rounded-xl">
            <div className="mb-6 text-center text-gray-500 text-sm">
              {t("approvedBy")}
            </div>
            <div className="flex justify-center gap-6 mb-8 flex-wrap items-center">
              {["cocacola", "pepsico", "unicef", "toyota"].map((brand, i) => (
                <Image
                  key={i}
                  src={`/images/${brand}.png`}
                  alt={brand}
                  width={120}
                  height={60}
                  className="h-8 w-auto"
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* As-you-go */}
            <div className="border rounded-lg p-4 lg:col-span-1">
              <h3 className="font-semibold text-center text-xl mb-1">
                {t("researchAsYouGo.title")}
              </h3>
              <p className="text-sm text-center text-gray-500 mb-4">
                {t("researchAsYouGo.price")}
              </p>

              <div className="space-y-2">
                <label className="text-sm text-gray-600">
                  {t("researchAsYouGo.creditCount")}
                </label>

                <Input
                  type="number"
                  value={safeCredits}
                  onChange={(e) => handleCreditsChange(e.target.value)}
                  className="h-9"
                  min={0}
                  step={1}
                />

                <div className="text-sm text-gray-600">
                  {t("researchAsYouGo.totalHT")}{" "}
                  <strong>
                    {currency === "EUR" ? "€" : currency} {total}
                  </strong>
                </div>

                {safeCredits > 0 && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      Prix unitaire : {currency === "EUR" ? "€" : currency}{" "}
                      {unitPrice} / réponses
                    </div>
                  </div>
                )}
              </div>

              <Button
                className="mt-4 w-full"
                onClick={handleEnhancedAsYouGo}
                disabled={safeCredits <= 0}
              >
                {commonT("next")}
              </Button>
            </div>

            {/* Plans */}
            <div className="lg:col-span-4">
              {loadingPlans ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-4 space-y-3 animate-pulse"
                    >
                      <div className="h-6 w-1/2 bg-gray-200 rounded" />
                      <div className="h-4 w-2/3 bg-gray-200 rounded" />
                      <div className="h-9 w-full bg-gray-200 rounded" />
                      <div className="h-4 w-3/4 bg-gray-200 rounded" />
                      <div className="h-4 w-2/4 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : plans.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {plans.map((p) => {
                    const code: PlanCode = isPlanCode(p.code)
                      ? p.code
                      : "starter";
                    const limits = PLAN_LIMITS[code];

                    const respondentCompletesLabel = formatLimit(
                      limits.respondentCompletes,
                    );

                    return (
                      <PlanCard
                        key={p.id}
                        plan={p}
                        locale={locale}
                        onAction={toggleOpen}
                        respondentCompletesLabel={respondentCompletesLabel}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="border rounded-lg p-4 text-sm text-gray-600">
                  Aucun plan actif disponible.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlanCard({
  plan,
  locale,
  onAction,
  respondentCompletesLabel,
}: {
  plan: AppPlan;
  locale: string;
  onAction: () => void;
  respondentCompletesLabel: string;
}) {
  return (
    <div className="border rounded-lg p-4 flex flex-col">
      <div className="text-center">
        <h3 className="font-semibold text-xl mb-1">{plan.name}</h3>

        {plan.description ? (
          <p className="text-sm text-gray-500 mb-3">{plan.description}</p>
        ) : (
          <div className="h-5" />
        )}

        {/* Respondent completes (instead of price) */}
        <div className="text-center text-2xl font-semibold mb-4">
          {respondentCompletesLabel}
          <span className="text-sm text-gray-500 font-normal">
            {" "}
            {locale === "fr" ? "réponses" : "submissions"}
          </span>
        </div>
      </div>

      {/* 2 bullets only (already built from your API) */}
      <ul className="text-sm text-gray-600 space-y-2 mb-4">
        {Array.isArray(plan.features) &&
          plan.features
            .filter((f) => f.included)
            .slice(0, 2)
            .map((f, i) => <li key={i}>• {f.text}</li>)}
      </ul>

      {/* CTA */}
      <Link href="/pricing" className="mt-auto">
        <Button className="w-full" onClick={onAction}>
          See details
        </Button>
      </Link>
    </div>
  );
}
