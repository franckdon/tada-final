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
  getUnitPriceXOF,
} from "@/lib/plans/plan-limits";

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

function isPlanCode(value: string): value is PlanCode {
  return (
    value === "starter" ||
    value === "growth" ||
    value === "business" ||
    value === "entreprise"
  );
}

/**
 * --- Types returned by prepare route ---
 * ✅ On passe en XOF
 */
type PrepareResponse = {
  purchase: {
    id: string;
    workspaceId: string;
    organizationId: string;
    planCode: PlanCode | null;
    credits: number;

    unitPriceXof: number; // ex: 10200
    totalAmountXof: number; // ex: 510000
    currency: "XOF";

    provider: "paystack";
    providerRef: string;
    providerStatus: "pending";
    metadata: any;
    createdAt: string;
    updatedAt: string;
  };
  paystack: {
    payload: {
      email: string;
      reference: string;
      amount: number; // subunit (x100)
      currency?: string; // "XOF"
      callback_url?: string;
      metadata?: any;
      channels?: string[];
    };
  };
};

function formatMoneyXOF(amount: number, locale: "fr" | "en") {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(safe);
}

export function CreditsModal({
  open = true,
  toggleOpen = () => {},
  handleAsYouGo = () => {},
  organizationId: organizationIdProp,
  workspaceId: workspaceIdProp,
  workspacePlanCode,
}: {
  open?: boolean;
  toggleOpen?: () => void;
  handleAsYouGo?: (prepared?: PrepareResponse) => void;
  organizationId?: string;
  workspaceId: string;
  workspacePlanCode: PlanCode | null;
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

  // ✅ workspaceId effectif (store fallback)
  const effectiveWorkspaceId = String(
    storeWorkspaceId || workspaceIdProp || "",
  ).trim();

  // ✅ credits safe
  const safeCredits =
    typeof credits === "number" && Number.isFinite(credits)
      ? Math.max(0, Math.trunc(credits))
      : 0;

  const pathname = usePathname();
  const locale = React.useMemo<"fr" | "en">(() => {
    const seg = pathname.split("/")[1] || "fr";
    return seg === "en" ? "en" : "fr";
  }, [pathname]);

  const [plans, setPlans] = React.useState<AppPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = React.useState(false);

  // --- Prepare state ---
  const [isPreparing, setIsPreparing] = React.useState(false);
  const [prepareError, setPrepareError] = React.useState<string | null>(null);
  const [prepared, setPrepared] = React.useState<PrepareResponse | null>(null);

  // Keep store workspaceId in sync (prefer props)
  React.useEffect(() => {
    if (workspaceIdProp && workspaceIdProp !== storeWorkspaceId) {
      setWorkspaceId(workspaceIdProp);
    }
  }, [workspaceIdProp, storeWorkspaceId, setWorkspaceId]);

  // Fetch plans list (display only)
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

  // ✅ UI pricing (client-only preview) — XOF
  React.useEffect(() => {
    const unitXof = getUnitPriceXOF({
      planCode: workspacePlanCode,
      credits: safeCredits,
    });

    setUnitPrice(unitXof); // store: unitPrice = XOF
    setCurrency("XOF");
  }, [workspacePlanCode, safeCredits, setUnitPrice, setCurrency]);

  const totalXof = safeCredits * (Number.isFinite(unitPrice) ? unitPrice : 0);

  const planLabel = workspacePlanCode
    ? workspacePlanCode.toUpperCase()
    : "SANS FORFAIT";
  const planHint =
    workspacePlanCode === "entreprise"
      ? locale === "fr"
        ? "Prix dégressif selon volume"
        : "Volume-based pricing"
      : "";

  // --- PREPARE ---
  const preparePurchase = async () => {
    setIsPreparing(true);
    setPrepareError(null);

    const url = `/api/workspaces/${encodeURIComponent(
      effectiveWorkspaceId,
    )}/credits/purchase/prepare`;

    // ✅ payload minimal + stable
    const payload: Record<string, any> = {
      credits: safeCredits,
      currency: "XOF",
    };

    if (organizationIdProp) payload.organizationId = organizationIdProp;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json().catch(() => ({}))) as any;

      if (!res.ok) {
        const msg =
          json?.error || json?.message || `Prepare failed (HTTP ${res.status})`;
        setPrepareError(String(msg));
        throw new Error(String(msg));
      }

      const preparedData = json as PrepareResponse;
      setPrepared(preparedData);
      return preparedData;
    } finally {
      setIsPreparing(false);
    }
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

                <div className="text-xs text-gray-500">
                  Tarif: <strong>{planLabel}</strong>
                  {planHint ? <span className="ml-1">— {planHint}</span> : null}
                </div>

                <div className="text-sm text-gray-600">
                  {t("researchAsYouGo.totalHT")}{" "}
                  <strong>{formatMoneyXOF(totalXof, locale)}</strong>
                </div>

                {safeCredits > 0 ? (
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      Prix unitaire :{" "}
                      <strong>{formatMoneyXOF(unitPrice, locale)}</strong> /
                      crédit
                    </div>
                  </div>
                ) : null}

                {prepareError ? (
                  <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                    {prepareError}
                  </div>
                ) : null}

                {prepared?.purchase ? (
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700">
                    Dernière préparation:{" "}
                    <strong>{prepared.purchase.providerRef}</strong>
                  </div>
                ) : null}
              </div>

              <Button
                className="mt-4 w-full"
                onClick={async () => {
                  try {
                    const preparedData = await preparePurchase();
                    handleAsYouGo(preparedData);
                  } catch {
                    // error déjà affichée
                  }
                }}
                disabled={
                  safeCredits <= 0 || isPreparing || !effectiveWorkspaceId
                }
              >
                {isPreparing ? "Préparation..." : commonT("next")}
              </Button>
            </div>

            {/* Plans */}
            <div className="lg:col-span-4">
              {loadingPlans ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
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
                      { locale },
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
  locale: "fr" | "en";
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

        <div className="text-center text-2xl font-semibold mb-4">
          {respondentCompletesLabel}
          <span className="text-sm text-gray-500 font-normal">
            {" "}
            {locale === "fr" ? "réponses" : "submissions"}
          </span>
        </div>
      </div>

      <ul className="text-sm text-gray-600 space-y-2 mb-4">
        {Array.isArray(plan.features) &&
          plan.features
            .filter((f) => f.included)
            .slice(0, 2)
            .map((f, i) => <li key={i}>• {f.text}</li>)}
      </ul>

      <Link href="/pricing" className="mt-auto">
        <Button className="w-full" onClick={onAction}>
          See details
        </Button>
      </Link>
    </div>
  );
}
