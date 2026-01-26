"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@tada/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import { cn } from "@tada/ui/lib/utils";
import { CreditCard, Info, Loader2 } from "lucide-react";

type WorkspaceSubscription = {
  planLabel?: string | null; // ex: "starter", "growth"...
  status?: string | null; // "active" | "expired" | "inactive" | "scheduled" ...
  endsAt?: string | null; // ISO date string
} | null;

function formatDateFR(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(d);
}

function planBadgeClass(status?: string | null) {
  if (status === "active") return "bg-green-100 text-green-800";
  if (status === "expired") return "bg-red-100 text-red-800";
  if (status === "inactive") return "bg-gray-100 text-gray-800";
  if (status === "scheduled") return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-800";
}

type WorkspaceBillingTabProps = {
  t: (key: string, params?: Record<string, any>) => string | undefined;

  // Crédits
  balance: number;
  loading: boolean;

  // Abonnement workspace (store)
  subscription: WorkspaceSubscription;

  // Seats (calculés dans la page settings)
  usedSeats: number;
  seatsLimitLabel: string; // "∞" | "Custom" | "5" | "-" ...

  // Actions
  onBuyCredits?: () => void; // ouvre ton modal CreditsModal ou autre
  pricingHref?: string; // ex "/pricing"
};

export function WorkspaceBillingTab({
  t,
  balance,
  loading,
  subscription,
  usedSeats,
  seatsLimitLabel,
  onBuyCredits,
  pricingHref = "/pricing",
}: WorkspaceBillingTabProps) {
  const planLabel = subscription?.planLabel ?? null;
  const planStatus = subscription?.status ?? null;

  const planTitle = planLabel ? planLabel.toUpperCase() : "FREE";

  const planTooltip = subscription?.endsAt
    ? `Expire le ${formatDateFR(subscription.endsAt)}`
    : undefined;

  return (
    <Card>
      <CardHeader className="px-6 pt-6 pb-3">
        <CardTitle className="text-lg">
          {t("workspace.settings.billingTitle") || "Billing & credits"}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-6 space-y-6">
        {/* Top summary */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-sm text-gray-600">
              {t("workspace.settings.billing.subtitle") ||
                "Gérez votre plan, vos sièges et vos crédits."}
            </div>

            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-700" />

              {loading ? (
                <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common.loading") || "Loading..."}
                </span>
              ) : (
                <span className="text-sm font-semibold text-gray-900">
                  {balance} {t("header.credits") || "crédits"}
                </span>
              )}

              <span
                className={cn(
                  "ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                  planBadgeClass(planStatus),
                )}
                title={planTooltip}
              >
                {planTitle}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onBuyCredits}
              disabled={!onBuyCredits}
              title={
                !onBuyCredits
                  ? "Branche cette action sur ton CreditsModal"
                  : undefined
              }
            >
              {t("workspace.settings.billing.buyCredits") ||
                "Acheter des crédits"}
            </Button>

            <Button asChild variant="outline">
              <Link href={pricingHref}>
                {t("workspace.settings.billing.viewPlans") || "Voir les plans"}
              </Link>
            </Button>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Plan */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold uppercase text-gray-500">
              {t("workspace.settings.billing.plan") || "Plan"}
            </div>

            <div className="text-base font-semibold text-gray-900">
              {planLabel ? planLabel : "Free"}
            </div>

            <div className="text-sm text-gray-600">
              {planLabel
                ? t("workspace.settings.billing.planDesc") ||
                  "Votre plan actuel détermine les limites d’usage."
                : t("workspace.settings.billing.noPlanHelp") ||
                  "Passez à un plan payant pour inviter plus de membres et augmenter les capacités."}
            </div>

            {subscription?.endsAt && (
              <div className="text-xs text-gray-500">
                {t("workspace.settings.billing.expires") || "Expiration"} :{" "}
                {formatDateFR(subscription.endsAt)}
              </div>
            )}
          </div>

          {/* Seats */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold uppercase text-gray-500">
              {t("workspace.settings.billing.seats") || "Sièges"}
            </div>

            <div className="text-base font-semibold text-gray-900">
              {usedSeats}/{seatsLimitLabel}
            </div>

            <div className="text-sm text-gray-600">
              {t("workspace.settings.billing.seatsHelp") ||
                "Membres actifs + invitations en attente."}
            </div>
          </div>

          {/* Credits help / next */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold uppercase text-gray-500">
              {t("workspace.settings.billing.credits") || "Crédits"}
            </div>

            <div className="text-base font-semibold text-gray-900">
              {loading ? "—" : String(balance)}
            </div>

            <div className="text-sm text-gray-600">
              {t("workspace.settings.billing.creditsHelp") ||
                "Les crédits sont consommés par l’usage (missions, IA, exports, etc.)."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
