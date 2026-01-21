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
import { ArrowLeft, Save, Languages, Settings2 } from "lucide-react";

import type {
  FeatureCategoryLite,
  FeatureFormInput,
  FeatureRow,
  FeatureValueType,
  LocaleCode,
} from "@/types/pricing/feature";

const VALUE_TYPES: Array<{ value: FeatureValueType; label: string }> = [
  { value: "boolean", label: "Boolean" },
  { value: "number", label: "Number" },
  { value: "text", label: "Text" },
];

type Props = {
  mode: "create" | "edit";
  categories: FeatureCategoryLite[];
  initial?: FeatureRow | null;
};

function normalizeInitial(
  initial: FeatureRow | null | undefined,
): FeatureFormInput {
  const base: FeatureFormInput = {
    key: initial?.key ?? "",
    label: initial?.label ?? "",
    description: initial?.description ?? "",
    valueType: (initial?.valueType as FeatureValueType) ?? "text",
    unit: initial?.unit ?? "",
    sortOrder: initial?.sortOrder ?? 0,
    categoryId: initial?.categoryId ?? null,
    translations: {
      fr: { locale: "fr", label: "", description: "" },
      en: { locale: "en", label: "", description: "" },
    },
  };

  for (const tr of initial?.translations ?? []) {
    if (tr.locale === "fr" || tr.locale === "en") {
      base.translations[tr.locale] = {
        locale: tr.locale,
        label: tr.label ?? "",
        description: tr.description ?? "",
      };
    }
  }

  return base;
}

function validateFeature(state: FeatureFormInput) {
  const errors: string[] = [];

  if (!state.key.trim()) errors.push("Le key est requis (unique).");
  if (!state.label.trim()) errors.push("Le label interne est requis.");
  if (!state.valueType) errors.push("Le valueType est requis.");

  // au moins un label traduit
  const hasAnyTranslationLabel =
    state.translations.fr.label.trim().length > 0 ||
    state.translations.en.label.trim().length > 0;

  if (!hasAnyTranslationLabel) {
    errors.push("Ajoute au moins un label traduit (FR ou EN).");
  }

  // optionnel : unit recommandé si number
  if (state.valueType === "number" && !state.unit.trim()) {
    // on ne bloque pas, mais on avertit via message (pas erreur)
  }

  return errors;
}

function buildPayload(state: FeatureFormInput) {
  const translations = (["fr", "en"] as LocaleCode[])
    .map((locale) => {
      const t = state.translations[locale];
      const hasAnything = t.label.trim() || t.description.trim();
      if (!hasAnything) return null;

      return {
        locale,
        label: t.label.trim(),
        description: t.description.trim() || null,
      };
    })
    .filter(Boolean);

  return {
    key: state.key.trim(),
    label: state.label.trim(),
    description: state.description.trim() || null,
    valueType: state.valueType,
    unit: state.unit.trim() || null,
    sortOrder: Number.isFinite(state.sortOrder) ? state.sortOrder : 0,
    categoryId:
      state.categoryId && state.categoryId !== "none" ? state.categoryId : null,
    translations,
  };
}

export function FeatureForm({ mode, categories, initial }: Props) {
  const router = useRouter();

  const [activeLocale, setActiveLocale] = React.useState<LocaleCode>("fr");
  const [state, setState] = React.useState<FeatureFormInput>(() =>
    normalizeInitial(initial),
  );

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const currentT = state.translations[activeLocale];

  const setTranslationField = (
    locale: LocaleCode,
    key: "label" | "description",
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

  const submit = async () => {
    setError(null);

    const errors = validateFeature(state);
    if (errors.length) {
      setError(errors.join(" "));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload(state);

      const url =
        mode === "create"
          ? "/api/pricing/features"
          : `/api/pricing/features/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          json?.message || json?.error || "Erreur lors de l'enregistrement.";
        setError(msg);
        return;
      }

      router.push("/pricing/features");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Settings2 className="h-6 w-6 text-blue-600" />
              {mode === "create" ? "Créer une feature" : "Modifier la feature"}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Gère la feature (clé, type, catégorie) et ses traductions (FR/EN).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/pricing/features">
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
        {/* Section Feature */}
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
                placeholder="ex: max_seats, submissions_per_month"
                disabled={mode === "edit"} // recommandé: clé immuable
              />
              <p className="text-xs text-gray-500">
                Identifiant technique unique. Idéalement immuable après
                création.
              </p>
            </div>

            <div className="md:col-span-4 space-y-2">
              <Label>Label interne</Label>
              <Input
                value={state.label}
                onChange={(e) =>
                  setState((p) => ({ ...p, label: e.target.value }))
                }
                placeholder="ex: Max seats"
              />
              <p className="text-xs text-gray-500">
                Label admin/tech. Le label affiché se gère dans les traductions.
              </p>
            </div>

            <div className="md:col-span-4 space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={state.categoryId ?? "none"}
                onValueChange={(v) =>
                  setState((p) => ({
                    ...p,
                    categoryId: v === "none" ? null : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {categories
                    .slice()
                    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.key})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label>Value type</Label>
              <Select
                value={state.valueType}
                onValueChange={(v) =>
                  setState((p) => ({ ...p, valueType: v as FeatureValueType }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
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

            <div className="md:col-span-3 space-y-2">
              <Label>Unité (optionnel)</Label>
              <Input
                value={state.unit}
                onChange={(e) =>
                  setState((p) => ({ ...p, unit: e.target.value }))
                }
                placeholder={
                  state.valueType === "number"
                    ? "ex: seats, submissions, GB"
                    : "ex: -"
                }
              />
              <p className="text-xs text-gray-500">
                Utile surtout pour <b>number</b>.
              </p>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Ordre</Label>
              <Input
                type="number"
                min={0}
                value={state.sortOrder}
                onChange={(e) =>
                  setState((p) => ({
                    ...p,
                    sortOrder: Number(e.target.value || 0),
                  }))
                }
              />
            </div>

            <div className="md:col-span-12 space-y-2">
              <Label>Description interne (optionnel)</Label>
              <Textarea
                value={state.description}
                onChange={(e) =>
                  setState((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Description pour l'admin (optionnel)."
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* Section Translations */}
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
              <Label>Label affiché ({activeLocale.toUpperCase()})</Label>
              <Input
                value={currentT.label}
                onChange={(e) =>
                  setTranslationField(activeLocale, "label", e.target.value)
                }
                placeholder="ex: Nombre de sièges / Number of seats"
              />
            </div>

            <div className="md:col-span-12 space-y-2">
              <Label>Description affichée ({activeLocale.toUpperCase()})</Label>
              <Textarea
                value={currentT.description}
                onChange={(e) =>
                  setTranslationField(
                    activeLocale,
                    "description",
                    e.target.value,
                  )
                }
                placeholder="Texte utilisé sur la page Pricing (optionnel)."
                rows={3}
              />
            </div>
          </div>

          {state.valueType === "number" && !state.unit.trim() ? (
            <div className="rounded-lg border bg-amber-50 p-3 text-sm text-amber-800">
              Astuce : valueType=<b>number</b> → pense à définir une <b>unit</b>{" "}
              (ex: seats, submissions).
            </div>
          ) : null}
        </section>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" asChild>
            <Link href="/pricing/features">Annuler</Link>
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
