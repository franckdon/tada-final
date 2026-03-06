// src/components/workspaces/workspace-subscription-tab.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@tada/ui/components/badge";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { useToast } from "@/hooks/use-toast";

import {
  getPlanLimits,
  type PlanCode,
  type LimitValue,
  formatLimit,
  formatYesNo,
} from "@/lib/plans/plan-limits";
import type { PlanOverrides } from "@/lib/plans/plan-overrides";
import { applyOverrides } from "@/lib/plans/plan-overrides";
import SubscriptionInvoiceDownloadButton from "./subscription-invoice-download";

const PLAN_CODES = ["starter", "growth", "business", "entreprise"] as const;
const PLAN_PRICING_ENDPOINT = "/api/pricing/plans";

type PaymentMethod = "cash" | "cheque" | "bank_transfer" | "mobile_money";

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "cash", label: "Espèce" },
  { value: "cheque", label: "Chèque" },
  { value: "bank_transfer", label: "Virement" },
  { value: "mobile_money", label: "Mobile Money" },
];

const FIXED_AMOUNT_PLAN_CODES: PlanCode[] = ["starter", "growth", "business"];

const formatDate = (d?: Date | string | null) => {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR");
};

function formatXof(n: number) {
  const value = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

function isFixedAmountPlan(planCode: PlanCode) {
  return FIXED_AMOUNT_PLAN_CODES.includes(planCode);
}

type PlanPriceMap = Partial<Record<PlanCode, number>>;

type RawPlan = {
  code?: string;
  name?: string;
  priceXof?: number | string | null;
  amountXof?: number | string | null;
  price?: number | string | null;
  priceCents?: number | string | null;
  amountCents?: number | string | null;
  currency?: string | null;
};

function normalizePlansResponse(payload: any): RawPlan[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.plans)) return payload.plans;
  return [];
}

function coercePlanAmountXof(plan: RawPlan): number | null {
  if (plan.amountXof != null && Number.isFinite(Number(plan.amountXof))) {
    return Number(plan.amountXof);
  }

  if (plan.priceXof != null && Number.isFinite(Number(plan.priceXof))) {
    return Number(plan.priceXof);
  }

  if (plan.amountCents != null && Number.isFinite(Number(plan.amountCents))) {
    return Math.round(Number(plan.amountCents));
  }

  if (plan.priceCents != null && Number.isFinite(Number(plan.priceCents))) {
    return Math.round(Number(plan.priceCents));
  }

  if (plan.price != null && Number.isFinite(Number(plan.price))) {
    return Number(plan.price);
  }

  return null;
}

// ------------------------------
// UI Helper
// ------------------------------
function LimitOverrideField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: LimitValue | undefined;
  onChange: (v: LimitValue) => void;
  placeholder?: string;
}) {
  const mode: "unlimited" | "number" =
    value === "unlimited" ? "unlimited" : "number";

  const num = typeof value === "number" ? value : 0;

  return (
    <div className="mt-4">
      <div className="mb-2 text-sm text-gray-700">{label}</div>

      <div className="grid gap-2 md:grid-cols-[220px_1fr]">
        <Select
          value={mode}
          onValueChange={(v) => {
            if (v === "unlimited") onChange("unlimited");
            if (v === "number") onChange(0);
          }}
        >
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unlimited">Illimité</SelectItem>
            <SelectItem value="number">Personnalisé</SelectItem>
          </SelectContent>
        </Select>

        {mode === "number" ? (
          <Input
            className="h-11"
            type="number"
            min={0}
            value={Number.isFinite(num) ? num : 0}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={placeholder ?? "Ex: 10"}
          />
        ) : (
          <div className="flex h-11 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600">
            Illimité
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500">
        {mode === "unlimited"
          ? "Illimité = aucune limite appliquée sur cette dimension."
          : "Personnalisé = valeur numérique fixe négociée."}
      </div>
    </div>
  );
}

export default function WorkspaceSubscriptionTab({
  workspaceId,
  subscription,
  currentCredits,
}: {
  workspaceId: string;
  subscription: any | null;
  currentCredits?: number | null;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const hasSubscription = Boolean(subscription?.id);
  const currentPlan = (subscription?.planCode as PlanCode) ?? null;

  const [planCode, setPlanCode] = React.useState<PlanCode>(
    currentPlan ?? "starter",
  );

  const [note, setNote] = React.useState<string>(subscription?.note ?? "");
  const [overrides, setOverrides] = React.useState<PlanOverrides>(
    (subscription?.overrides ?? {}) as PlanOverrides,
  );

  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod | "">(
    "",
  );
  const [amountXof, setAmountXof] = React.useState<number>(0);

  const [planPrices, setPlanPrices] = React.useState<PlanPriceMap>({});
  const [isLoadingPlanPrices, setIsLoadingPlanPrices] = React.useState(false);

  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const loadPlanPrices = async () => {
      setIsLoadingPlanPrices(true);

      try {
        const res = await fetch(PLAN_PRICING_ENDPOINT, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Impossible de charger les montants des plans.");
        }

        const json = await res.json();
        const rows = normalizePlansResponse(json);

        const nextMap: PlanPriceMap = {};

        for (const row of rows) {
          const code = String(row.code ?? row.name ?? "").toLowerCase();

          if (
            code === "starter" ||
            code === "growth" ||
            code === "business" ||
            code === "entreprise"
          ) {
            const amount = coercePlanAmountXof(row);
            if (amount != null && Number.isFinite(amount)) {
              nextMap[code as PlanCode] = amount;
            }
          }
        }

        if (isMounted) {
          setPlanPrices(nextMap);
        }
      } catch (e) {
        if (isMounted) {
          setPlanPrices({});
        }
      } finally {
        if (isMounted) {
          setIsLoadingPlanPrices(false);
        }
      }
    };

    loadPlanPrices();

    return () => {
      isMounted = false;
    };
  }, []);

  const dbAmountForSelectedPlan = React.useMemo(() => {
    return planPrices[planCode] ?? null;
  }, [planPrices, planCode]);

  const isSelectedPlanFixedAmount = isFixedAmountPlan(planCode);

  React.useEffect(() => {
    if (isSelectedPlanFixedAmount) {
      if (
        dbAmountForSelectedPlan != null &&
        Number.isFinite(dbAmountForSelectedPlan)
      ) {
        setAmountXof(dbAmountForSelectedPlan);
      } else {
        setAmountXof(0);
      }
    }
  }, [isSelectedPlanFixedAmount, dbAmountForSelectedPlan]);

  // --------- ACTIVE STATE ----------
  const endsAtDate: Date | null = subscription?.endsAt
    ? new Date(subscription.endsAt)
    : null;

  const computedIsActive =
    hasSubscription &&
    subscription?.status === "active" &&
    (endsAtDate ? endsAtDate.getTime() > Date.now() : true);

  const statusBadge = computedIsActive
    ? { variant: "success" as const, label: "Actif" }
    : hasSubscription
      ? { variant: "secondary" as const, label: "Inactif / Expiré" }
      : { variant: "secondary" as const, label: "Aucun abonnement" };

  // --------- LIMITS ----------
  const selectedDefaults = getPlanLimits(planCode);

  const selectedEffective = applyOverrides(
    selectedDefaults,
    planCode === "entreprise" ? overrides : null,
  );

  const creditsQtyFromPlan = React.useMemo(() => {
    const v = selectedEffective.respondentCompletes;
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
    return 1;
  }, [selectedEffective.respondentCompletes]);

  const currentPlanCodeForLimits = hasSubscription
    ? (subscription.planCode as PlanCode)
    : planCode;

  const currentOverridesForLimits =
    hasSubscription && (subscription.planCode as PlanCode) === "entreprise"
      ? ((subscription.overrides as PlanOverrides) ?? null)
      : null;

  const currentEffective = applyOverrides(
    getPlanLimits(currentPlanCodeForLimits),
    currentOverridesForLimits,
  );

  // --------- UI STATES ----------
  const isPlanChanged = currentPlan ? planCode !== currentPlan : true;

  const canDisable = hasSubscription && subscription?.status === "active";
  const canEnable = hasSubscription && subscription?.status !== "active";

  // --------- API CALLS ----------
  const callAssign = async () => {
    const payload = {
      planCode,
      note: note || null,
      overrides: planCode === "entreprise" ? overrides : null,
      billing: {
        paymentMethod,
        amountXof,
        creditsQty: creditsQtyFromPlan,
      },
    };

    const res = await fetch(
      `/api/workspaces/${workspaceId}/subscription/assign`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error || "Impossible d’attribuer le plan");
    }
    return json;
  };

  const validateBillingBeforeSubmit = () => {
    if (!paymentMethod) return "La méthode de paiement est obligatoire.";

    if (isSelectedPlanFixedAmount) {
      if (isLoadingPlanPrices) {
        return "Les montants des plans sont en cours de chargement.";
      }

      if (
        dbAmountForSelectedPlan == null ||
        !Number.isFinite(dbAmountForSelectedPlan) ||
        dbAmountForSelectedPlan <= 0
      ) {
        return "Le montant du plan sélectionné est introuvable dans la base.";
      }

      if (amountXof !== dbAmountForSelectedPlan) {
        return "Le montant du plan sélectionné doit correspondre au montant défini en base.";
      }
    } else {
      if (!Number.isFinite(amountXof) || amountXof <= 0) {
        return "Le montant est obligatoire et doit être supérieur à 0.";
      }
    }

    if (!Number.isFinite(creditsQtyFromPlan) || creditsQtyFromPlan <= 0) {
      return "Le crédit par défaut du plan sélectionné est invalide.";
    }

    return null;
  };

  const assignPlan = async () => {
    const err = validateBillingBeforeSubmit();
    if (err) {
      toast({ title: "Erreur", description: err, variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      await callAssign();
      toast({
        title: "Plan attribué",
        description: `Le plan ${planCode.toUpperCase()} a été attribué au workspace.`,
      });
      router.refresh();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const changePlan = async () => {
    const err = validateBillingBeforeSubmit();
    if (err) {
      toast({ title: "Erreur", description: err, variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      await callAssign();
      toast({
        title: "Plan modifié",
        description: `Le plan ${planCode.toUpperCase()} est maintenant appliqué.`,
      });
      router.refresh();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const enable = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/subscription/enable`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: note || null }),
        },
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Impossible d’activer");

      toast({
        title: "Plan activé",
        description: "Le plan est actif pour 1 mois.",
      });

      router.refresh();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const disable = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/subscription/disable`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: note || null }),
        },
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Impossible de désactiver");

      toast({
        title: "Plan désactivé",
        description: "Le plan a été désactivé.",
      });

      router.refresh();
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const amountFieldDisabled = isSelectedPlanFixedAmount;
  const isPrimaryActionDisabled =
    isSaving ||
    (hasSubscription ? !isPlanChanged : false) ||
    (isSelectedPlanFixedAmount &&
      (isLoadingPlanPrices ||
        dbAmountForSelectedPlan == null ||
        dbAmountForSelectedPlan <= 0));

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      {/* LEFT PANEL */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-gray-500">Plan</div>
              <div className="text-lg font-semibold text-gray-900">
                Sélection & configuration
              </div>
            </div>

            {currentPlan ? (
              <Badge variant="outline" className="mt-1">
                Actuel: {currentPlan.toUpperCase()}
              </Badge>
            ) : (
              <Badge variant="secondary" className="mt-1">
                Aucun
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <div className="mb-2 text-sm text-gray-700">Choisir un plan</div>
            <Select
              value={planCode}
              onValueChange={(v) => setPlanCode(v as PlanCode)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choisir un plan" />
              </SelectTrigger>
              <SelectContent>
                {PLAN_CODES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mt-3 rounded-lg bg-gray-50 p-4">
              <div className="text-xs text-gray-500">
                Preview — Soumissions/mois (plan sélectionné)
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {formatLimit(selectedEffective.respondentCompletes, {
                  locale: "fr",
                })}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Quota du plan sélectionné (pas le solde “Points actuels”).
              </div>
            </div>
          </div>

          {/* BILLING */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Facturation (obligatoire avant attribution)
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  {isSelectedPlanFixedAmount
                    ? "Pour ce plan, le montant XOF vient automatiquement du montant enregistré en base. Seul le plan ENTREPRISE permet une saisie manuelle."
                    : "Pour le plan ENTREPRISE, le montant XOF reste modifiable manuellement. Les crédits attribués sont ceux du plan sélectionné."}
                </div>

                <div className="mt-2 text-xs text-gray-700">
                  Crédits attribués (par défaut du plan):{" "}
                  <span className="font-semibold text-gray-900">
                    {typeof selectedEffective.respondentCompletes === "number"
                      ? selectedEffective.respondentCompletes
                      : "Illimité"}
                  </span>
                </div>
              </div>
              <Badge variant="outline">Invoice</Badge>
            </div>

            <div className="mt-4 grid gap-3">
              <div>
                <div className="mb-2 text-sm text-gray-700">
                  Mode de paiement{" "}
                  <span className="text-xs text-red-600">*</span>
                </div>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-2 text-sm text-gray-700">
                  Montant (XOF) <span className="text-xs text-red-600">*</span>
                </div>
                <Input
                  className="h-11"
                  type="number"
                  min={0}
                  value={amountXof}
                  onChange={(e) => {
                    if (amountFieldDisabled) return;
                    const v = Number(e.target.value);
                    setAmountXof(Number.isFinite(v) ? v : 0);
                  }}
                  placeholder={
                    amountFieldDisabled ? "Chargé depuis la base" : "Ex: 250000"
                  }
                  disabled={amountFieldDisabled}
                  readOnly={amountFieldDisabled}
                />

                <div className="mt-1 text-xs text-gray-500">
                  Valeur actuelle:{" "}
                  <span className="font-semibold text-gray-900">
                    {formatXof(amountXof)}
                  </span>
                </div>

                {isSelectedPlanFixedAmount ? (
                  <div className="mt-1 text-xs text-gray-500">
                    {isLoadingPlanPrices
                      ? "Chargement du montant du plan depuis la base..."
                      : dbAmountForSelectedPlan != null
                        ? `Montant verrouillé pour ${planCode.toUpperCase()}`
                        : "Montant du plan introuvable. Vérifie l’endpoint des plans."}
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-gray-500">
                    Plan ENTREPRISE : montant librement modifiable.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ENTREPRISE OVERRIDES */}
          {planCode === "entreprise" && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Personnalisation ENTREPRISE
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    Personnalise les limites négociées (illimité ou valeur
                    numérique).
                  </div>
                </div>
                <Badge variant="outline">Overrides</Badge>
              </div>

              <LimitOverrideField
                label="Soumissions / mois"
                value={overrides.respondentCompletes}
                onChange={(v) =>
                  setOverrides((prev) => ({ ...prev, respondentCompletes: v }))
                }
                placeholder="Ex: 5000"
              />

              <LimitOverrideField
                label="Zones de déploiement"
                value={overrides.deploymentLocations}
                onChange={(v) =>
                  setOverrides((prev) => ({ ...prev, deploymentLocations: v }))
                }
                placeholder="Ex: 5"
              />

              <LimitOverrideField
                label="Segmentation (dimensions)"
                value={overrides.segmentationDimensions}
                onChange={(v) =>
                  setOverrides((prev) => ({
                    ...prev,
                    segmentationDimensions: v,
                  }))
                }
                placeholder="Ex: 3"
              />

              <LimitOverrideField
                label="Questions / enquête"
                value={overrides.questionsPerSurvey}
                onChange={(v) =>
                  setOverrides((prev) => ({ ...prev, questionsPerSurvey: v }))
                }
                placeholder="Ex: 25"
              />
            </div>
          )}

          {/* PRIMARY ACTION */}
          {!hasSubscription ? (
            <Button
              className="h-11 w-full"
              onClick={assignPlan}
              disabled={isPrimaryActionDisabled}
            >
              {isSaving
                ? "Attribution..."
                : isLoadingPlanPrices && isSelectedPlanFixedAmount
                  ? "Chargement du montant..."
                  : "Attribuer le plan"}
            </Button>
          ) : (
            <Button
              className="h-11 w-full"
              onClick={changePlan}
              disabled={isPrimaryActionDisabled}
            >
              {isSaving
                ? "Mise à jour..."
                : isLoadingPlanPrices && isSelectedPlanFixedAmount
                  ? "Chargement du montant..."
                  : "Changer de plan"}
            </Button>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500">Forfait actuel</div>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>

              <div className="mt-1 truncate text-2xl font-semibold text-gray-900">
                {hasSubscription
                  ? String(subscription.planCode).toUpperCase()
                  : "Aucun abonnement"}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="rounded-full bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  Points actuels:{" "}
                  <span className="font-semibold text-gray-900">
                    {typeof currentCredits === "number"
                      ? new Intl.NumberFormat("fr-FR").format(currentCredits)
                      : "—"}
                  </span>
                </div>

                <div className="rounded-full bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  Soumissions/mois (plan actuel):{" "}
                  <span className="font-semibold text-gray-900">
                    {formatLimit(currentEffective.respondentCompletes, {
                      locale: "fr",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SubscriptionInvoiceDownloadButton
                workspaceId={workspaceId}
                enabled={computedIsActive}
              />

              {canEnable ? (
                <Button
                  variant="secondary"
                  className="h-10"
                  onClick={enable}
                  disabled={isSaving}
                >
                  Activer
                </Button>
              ) : null}

              <Button
                variant="destructive"
                className="h-10"
                onClick={disable}
                disabled={!canDisable || isSaving}
              >
                Désactiver
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-xs text-gray-500">Début</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {formatDate(subscription?.startsAt)}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Date d’activation
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-xs text-gray-500">Fin</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">
                {formatDate(subscription?.endsAt)}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Date d’expiration
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs text-gray-500">Source</div>
                <div className="mt-1 font-medium text-gray-900">
                  {subscription?.source ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Assigné par</div>
                <div className="mt-1 font-medium text-gray-900">
                  {subscription?.assignedByUser?.name ?? "—"}
                </div>
                <div className="text-xs text-gray-500">
                  {subscription?.assignedByUser?.email ?? ""}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Limites appliquées (plan actuel)
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Basées sur le plan actif du workspace.
                </div>
              </div>
              <Badge variant="outline">
                {currentPlanCodeForLimits.toUpperCase()}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              {[
                {
                  label: "Soumissions / mois",
                  value: formatLimit(currentEffective.respondentCompletes, {
                    locale: "fr",
                  }),
                },
                {
                  label: "Zones de déploiement",
                  value: formatLimit(currentEffective.deploymentLocations, {
                    locale: "fr",
                  }),
                },
                {
                  label: "Tours de vérification",
                  value: formatLimit(
                    currentEffective.surveyVerificationRounds,
                    {
                      locale: "fr",
                    },
                  ),
                },
                {
                  label: "Questions / enquête",
                  value: formatLimit(currentEffective.questionsPerSurvey, {
                    locale: "fr",
                  }),
                },
                {
                  label: "Segmentation",
                  value: formatLimit(currentEffective.segmentationDimensions, {
                    locale: "fr",
                  }),
                },
                {
                  label: "Sièges",
                  value: formatLimit(currentEffective.userSeats, {
                    locale: "fr",
                  }),
                },
                {
                  label: "Templates & import",
                  value: formatYesNo(
                    currentEffective.surveyTemplateLibraryAndImport,
                    { locale: "fr" },
                  ),
                },
                {
                  label: "Dashboards TADA",
                  value: formatLimit(
                    currentEffective.proprietaryDashboardsAccess,
                    { locale: "fr" },
                  ),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                >
                  <span className="text-gray-600">{row.label}</span>
                  <span className="font-semibold text-gray-900">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <div className="text-sm font-semibold text-gray-900">Note</div>
            <div className="mt-1 text-xs text-gray-500">
              Envoyée lors de l’attribution, du changement, du renouvellement ou
              de la désactivation.
            </div>
            <Input
              className="mt-3 h-11"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: upgrade manuel, promo, conditions…"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
