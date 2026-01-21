"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import { Button } from "@tada/ui/components/button";
import { Badge } from "@tada/ui/components/badge";
import { Switch } from "@tada/ui/components/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { CircleDollarSign, Layers, Puzzle, ArrowRight } from "lucide-react";

type Currency = "USD" | "XOF";
type Interval = "month" | "year";

type Plan = {
  id: string;
  tier: string;
  name: string;
  priceType: "fixed" | "custom" | string;
  sortOrder: number;
  prices: Array<{
    currency: Currency;
    interval: Interval;
    amountCents: number | null;
    isCustom: boolean;
  }>;
  translations: Array<{
    locale: "fr" | "en" | string;
    name: string;
    tagline: string | null;
  }>;
};

type Feature = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  valueType: "boolean" | "number" | "text" | string;
  unit: string | null;
  sortOrder: number;
  categoryId: string | null;
};

type Category = {
  id: string;
  key: string;
  name: string;
  sortOrder: number;
  features: Feature[];
};

type PlanFeatureValue = {
  planId: string;
  featureId: string;
  booleanValue: boolean | null;
  numberValue: number | null;
  textValue: string | null;
  isUnlimited: boolean;
  isCustom: boolean;
  highlight: boolean;
};

type AddOn = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  valueType: "boolean" | "number" | "text" | string;
  unit: string | null;
};

type PlanAddOnValue = {
  planId: string;
  addOnId: string;
  isEnabled: boolean;
  booleanValue: boolean | null;
  numberValue: number | null;
  textValue: string | null;
  isUnlimited: boolean;
  isCustom: boolean;
  highlight: boolean;
};

function formatMoney(amountCents: number | null, currency: Currency) {
  if (amountCents == null) return "—";
  const amount = amountCents / 100;

  if (currency === "XOF") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function intervalLabel(i: Interval) {
  return i === "month" ? "Mensuel" : "Annuel";
}

function renderValue(
  valueType: string,
  v: {
    booleanValue: boolean | null;
    numberValue: number | null;
    textValue: string | null;
    isUnlimited: boolean;
    isCustom: boolean;
  },
  unit?: string | null,
) {
  if (v.isCustom) return <span className="text-gray-500 italic">Custom</span>;
  if (v.isUnlimited) return <span className="font-semibold">Illimité</span>;

  if (valueType === "boolean") return v.booleanValue ? "Oui" : "Non";
  if (valueType === "number")
    return `${v.numberValue ?? "—"}${unit ? ` ${unit}` : ""}`;
  return v.textValue ?? "—";
}

export function PricingOverview({
  plans,
  categories,
  uncategorizedFeatures,
  planFeatureValues,
  addOns,
  planAddOnValues,
}: {
  plans: Plan[];
  categories: Category[];
  uncategorizedFeatures: Feature[];
  planFeatureValues: PlanFeatureValue[];
  addOns: AddOn[];
  planAddOnValues: PlanAddOnValue[];
}) {
  const [currency, setCurrency] = React.useState<Currency>("USD");
  const [interval, setInterval] = React.useState<Interval>("month");
  const [onlyHighlights, setOnlyHighlights] = React.useState(true);

  const priceOf = React.useCallback(
    (plan: Plan) => {
      const p = plan.prices.find(
        (x) => x.currency === currency && x.interval === interval,
      );
      if (!p) return "—";
      if (p.isCustom || plan.priceType === "custom") return "Custom";
      return formatMoney(p.amountCents, currency);
    },
    [currency, interval],
  );

  const featureValMap = React.useMemo(() => {
    const m = new Map<string, PlanFeatureValue>();
    for (const v of planFeatureValues) m.set(`${v.planId}:${v.featureId}`, v);
    return m;
  }, [planFeatureValues]);

  const addOnValMap = React.useMemo(() => {
    const m = new Map<string, PlanAddOnValue>();
    for (const v of planAddOnValues) m.set(`${v.planId}:${v.addOnId}`, v);
    return m;
  }, [planAddOnValues]);

  const allFeatureSections = React.useMemo(() => {
    const sections: Array<{ title: string; features: Feature[] }> = [];

    for (const c of categories) {
      const feats = onlyHighlights
        ? c.features.filter((f) =>
            plans.some((p) => featureValMap.get(`${p.id}:${f.id}`)?.highlight),
          )
        : c.features;

      if (feats.length) sections.push({ title: c.name, features: feats });
    }

    const unc = onlyHighlights
      ? uncategorizedFeatures.filter((f) =>
          plans.some((p) => featureValMap.get(`${p.id}:${f.id}`)?.highlight),
        )
      : uncategorizedFeatures;

    if (unc.length) sections.push({ title: "Autres", features: unc });

    return sections;
  }, [categories, uncategorizedFeatures, onlyHighlights, plans, featureValMap]);

  const shownAddOns = React.useMemo(() => {
    if (!onlyHighlights) return addOns;
    return addOns.filter((a) =>
      plans.some((p) => addOnValMap.get(`${p.id}:${a.id}`)?.highlight),
    );
  }, [addOns, onlyHighlights, plans, addOnValMap]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CircleDollarSign className="h-6 w-6 text-green-600" />
              Pricing Overview
            </CardTitle>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-[140px]">
                <Select
                  value={currency}
                  onValueChange={(v) => setCurrency(v as Currency)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Devise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="XOF">XOF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[160px]">
                <Select
                  value={interval}
                  onValueChange={(v) => setInterval(v as Interval)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">
                      {intervalLabel("month")}
                    </SelectItem>
                    <SelectItem value="year">
                      {intervalLabel("year")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={onlyHighlights}
                  onCheckedChange={(v: boolean) => setOnlyHighlights(v)}
                />
                <span className="text-sm text-gray-700">Highlights only</span>
              </div>

              <Button asChild variant="outline">
                <Link href="/pricing/plans">
                  Gérer les plans <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Plans cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {plans.map((p) => (
              <Card key={p.id} className="shadow-sm">
                <CardHeader className="border-b bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-gray-500">{p.tier}</div>
                      <div className="text-lg font-bold text-gray-900">
                        {p.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {p.translations.find((t) => t.locale === "fr")
                          ?.tagline ?? ""}
                      </div>
                    </div>
                    <Badge className="bg-gray-100 text-gray-700 border border-gray-200">
                      {currency}/{interval}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div className="text-2xl font-extrabold">{priceOf(p)}</div>
                  <div className="flex gap-2">
                    <Button asChild className="w-full">
                      <Link href={`/pricing/plans/edit/${p.id}`}>Edit</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features compare */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            Features (comparatif)
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-auto">
            <div className="min-w-[980px]">
              {/* header row */}
              <div
                className="grid border-b bg-white"
                style={{
                  gridTemplateColumns: `360px repeat(${plans.length}, 1fr)`,
                }}
              >
                <div className="p-3 text-sm font-semibold text-gray-700">
                  Feature
                </div>
                {plans.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 text-sm font-semibold text-gray-700 border-l"
                  >
                    {p.name}
                  </div>
                ))}
              </div>

              {allFeatureSections.map((section) => (
                <div key={section.title} className="border-b">
                  <div className="px-3 py-2 bg-gray-50 text-sm font-semibold text-gray-700">
                    {section.title}{" "}
                    <span className="text-xs text-gray-500">
                      ({section.features.length})
                    </span>
                  </div>

                  {section.features.map((f) => (
                    <div
                      key={f.id}
                      className="grid border-t bg-white hover:bg-gray-50/40"
                      style={{
                        gridTemplateColumns: `360px repeat(${plans.length}, 1fr)`,
                      }}
                    >
                      <div className="p-3">
                        <div className="font-medium text-gray-900">
                          {f.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {f.key}
                          {f.unit ? ` • ${f.unit}` : ""}
                        </div>
                      </div>

                      {plans.map((p) => {
                        const v = featureValMap.get(`${p.id}:${f.id}`);
                        const display = v ? (
                          renderValue(f.valueType, v, f.unit)
                        ) : (
                          <span className="text-gray-400">—</span>
                        );

                        return (
                          <div
                            key={p.id}
                            className="p-3 border-l text-sm text-gray-700"
                          >
                            {display}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add-ons compare */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Puzzle className="h-5 w-5 text-purple-600" />
            Add-ons (comparatif)
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-auto">
            <div className="min-w-[980px]">
              <div
                className="grid border-b bg-white"
                style={{
                  gridTemplateColumns: `360px repeat(${plans.length}, 1fr)`,
                }}
              >
                <div className="p-3 text-sm font-semibold text-gray-700">
                  Add-on
                </div>
                {plans.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 text-sm font-semibold text-gray-700 border-l"
                  >
                    {p.name}
                  </div>
                ))}
              </div>

              {shownAddOns.map((a) => (
                <div
                  key={a.id}
                  className="grid border-b bg-white hover:bg-gray-50/40"
                  style={{
                    gridTemplateColumns: `360px repeat(${plans.length}, 1fr)`,
                  }}
                >
                  <div className="p-3">
                    <div className="font-medium text-gray-900">{a.name}</div>
                    <div className="text-xs text-gray-500">
                      {a.key}
                      {a.unit ? ` • ${a.unit}` : ""}
                      {a.description ? ` • ${a.description}` : ""}
                    </div>
                  </div>

                  {plans.map((p) => {
                    const v = addOnValMap.get(`${p.id}:${a.id}`);

                    if (!v || !v.isEnabled) {
                      return (
                        <div
                          key={p.id}
                          className="p-3 border-l text-sm text-gray-400"
                        >
                          —
                        </div>
                      );
                    }

                    const display = renderValue(a.valueType, v, a.unit);

                    return (
                      <div
                        key={p.id}
                        className="p-3 border-l text-sm text-gray-700"
                      >
                        {display}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {!shownAddOns.length ? (
            <div className="p-6 text-sm text-gray-600">
              Aucun add-on à afficher (selon le filtre highlights).
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
