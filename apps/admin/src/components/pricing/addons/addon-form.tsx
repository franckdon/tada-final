"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@tada/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import { Textarea } from "@tada/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import {
  ArrowLeft,
  Save,
  Languages,
  Settings2,
  CircleDollarSign,
} from "lucide-react";

import type {
  AddOnFormInput,
  AddOnRow,
  Currency,
  BillingInterval,
  LocaleCode,
  FeatureValueType,
} from "@/types/pricing/addon";

const INTERVALS: BillingInterval[] = ["month", "year"];
const VALUE_TYPES: Array<{ value: FeatureValueType; label: string }> = [
  { value: "boolean", label: "Boolean (Oui/Non)" },
  { value: "number", label: "Number (Quantité)" },
  { value: "text", label: "Text (Valeur libre)" },
];

function parseMoneyToCents(input: string, currency: Currency) {
  const raw = input.trim();
  if (!raw) return 0;
  const normalized = raw.replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (currency === "XOF") return Math.round(n) * 100;
  return Math.round(n * 100);
}

function centsToDisplay(amountCents: number, currency: Currency) {
  if (currency === "XOF") return String(Math.round(amountCents / 100));
  return (amountCents / 100).toFixed(2);
}

function normalizeInitial(initial?: AddOnRow | null): AddOnFormInput {
  const base: AddOnFormInput = {
    key: initial?.key ?? "",
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    unit: initial?.unit ?? "",
    valueType: initial?.valueType ?? "number",
    translations: {
      fr: { locale: "fr", name: "", description: "" },
      en: { locale: "en", name: "", description: "" },
    },
  };

  for (const t of initial?.translations ?? []) {
    if (t.locale === "fr" || t.locale === "en") {
      base.translations[t.locale] = {
        locale: t.locale,
        name: t.name ?? "",
        description: t.description ?? "",
      };
    }
  }

  return base;
}

function validate(state: AddOnFormInput) {
  const errors: string[] = [];
  if (!state.key.trim()) errors.push("Le key est requis (unique).");
  if (!state.name.trim()) errors.push("Le nom interne est requis.");
  if (!state.valueType)
    errors.push("Le type de valeur (valueType) est requis.");

  // au moins une traduction name
  const hasTr =
    state.translations.fr.name.trim() || state.translations.en.name.trim();
  if (!hasTr) errors.push("Ajoute au moins un nom traduit (FR ou EN).");

  return errors;
}

function buildPayload(state: AddOnFormInput) {
  const translations = (["fr", "en"] as LocaleCode[])
    .map((locale) => {
      const t = state.translations[locale];
      const has = t.name.trim() || t.description.trim();
      if (!has) return null;
      return {
        locale,
        name: t.name.trim(),
        description: t.description.trim() || null,
      };
    })
    .filter(Boolean);

  return {
    key: state.key.trim(),
    name: state.name.trim(),
    description: state.description.trim() || null,
    valueType: state.valueType,
    unit: state.unit.trim() || null,
    translations,
  };
}

export function AddOnForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: AddOnRow | null;
}) {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = React.useState<LocaleCode>("fr");
  const [state, setState] = React.useState<AddOnFormInput>(() =>
    normalizeInitial(initial),
  );

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const setTranslationField = (
    locale: LocaleCode,
    key: "name" | "description",
    value: string,
  ) => {
    setState((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: { ...prev.translations[locale], [key]: value },
      },
    }));
  };

  const setQty = (input: string) => {
    const v = input.trim();
    const n = v ? Number(v) : null;
    setState((prev) => ({
      ...prev,
    }));
  };

  const submit = async () => {
    setError(null);
    const errors = validate(state);
    if (errors.length) return setError(errors.join(" "));

    setIsSubmitting(true);
    try {
      const payload = buildPayload(state);

      const url =
        mode === "create"
          ? "/api/pricing/addons"
          : `/api/pricing/addons/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          json?.message || json?.error || "Erreur lors de l'enregistrement.",
        );
        return;
      }

      router.push("/pricing/addons");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = state.translations[activeLocale];

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Settings2 className="h-6 w-6 text-blue-600" />
              {mode === "create" ? "Créer un add-on" : "Modifier l'add-on"}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Add-on + traductions + prix (USD/XOF, mensuel/annuel).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/pricing/addons">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
            <Button onClick={submit} disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Infos */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-gray-700" />
            <h3 className="text-base font-semibold text-gray-900">
              Informations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-2">
              <Label>Key (unique)</Label>
              <Input
                value={state.key}
                onChange={(e) =>
                  setState((p) => ({ ...p, key: e.target.value }))
                }
                placeholder="ex: extra_seats, extra_submissions"
                disabled={mode === "edit"}
              />
            </div>

            <div className="md:col-span-4 space-y-2">
              <Label>Nom interne</Label>
              <Input
                value={state.name}
                onChange={(e) =>
                  setState((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-4 space-y-2">
              <Label>Type de valeur</Label>
              <Select
                value={state.valueType}
                onValueChange={(v) =>
                  setState((p) => ({ ...p, valueType: v as FeatureValueType }))
                }
                disabled={mode === "edit"} // recommandé: immutable
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {VALUE_TYPES.map((x) => (
                    <SelectItem key={x.value} value={x.value}>
                      {x.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-4 space-y-2">
              <Label>Unit (optionnel)</Label>
              <Input
                value={state.unit}
                onChange={(e) =>
                  setState((p) => ({ ...p, unit: e.target.value }))
                }
                placeholder="ex: seats, submissions"
              />
            </div>

            <div className="md:col-span-12 space-y-2">
              <Label>Description interne</Label>
              <Textarea
                value={state.description}
                onChange={(e) =>
                  setState((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* Translations */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-gray-700" />
            <h3 className="text-base font-semibold text-gray-900">
              Traductions
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={activeLocale === "fr" ? "default" : "outline"}
              onClick={() => setActiveLocale("fr")}
            >
              FR
            </Button>
            <Button
              type="button"
              variant={activeLocale === "en" ? "default" : "outline"}
              onClick={() => setActiveLocale("en")}
            >
              EN
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 space-y-2">
              <Label>Nom ({activeLocale.toUpperCase()})</Label>
              <Input
                value={t.name}
                onChange={(e) =>
                  setTranslationField(activeLocale, "name", e.target.value)
                }
              />
            </div>
            <div className="md:col-span-12 space-y-2">
              <Label>Description ({activeLocale.toUpperCase()})</Label>
              <Textarea
                value={t.description}
                onChange={(e) =>
                  setTranslationField(
                    activeLocale,
                    "description",
                    e.target.value,
                  )
                }
                rows={3}
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" asChild>
            <Link href="/pricing/addons">Annuler</Link>
          </Button>
          <Button onClick={submit} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
