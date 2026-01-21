"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import { ArrowLeft, Save, Layers } from "lucide-react";

type LocaleCode = "fr" | "en";

type Category = {
  id: string;
  key: string;
  name: string;
  sortOrder: number;
  translations: Array<{ locale: string; name: string }>;
  _count: { features: number };
};

type FormState = {
  key: string;
  name: string;
  sortOrder: number;
  translations: Record<LocaleCode, { locale: LocaleCode; name: string }>;
};

function toState(category: Category): FormState {
  const fr = category.translations.find((t) => t.locale === "fr")?.name || "";
  const en = category.translations.find((t) => t.locale === "en")?.name || "";
  return {
    key: category.key,
    name: category.name,
    sortOrder: category.sortOrder,
    translations: {
      fr: { locale: "fr", name: fr },
      en: { locale: "en", name: en },
    },
  };
}

function buildPayload(state: FormState) {
  const translations = (["fr", "en"] as LocaleCode[])
    .map((loc) => {
      const nm = state.translations[loc].name.trim();
      if (!nm) return null;
      return { locale: loc, name: nm };
    })
    .filter(Boolean);

  return {
    key: state.key.trim(),
    name: state.name.trim(),
    sortOrder: state.sortOrder,
    translations,
  };
}

export function CategoryEditForm({ category }: { category: Category }) {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = React.useState<LocaleCode>("fr");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [state, setState] = React.useState<FormState>(() => toState(category));

  const onSubmit = async () => {
    setError(null);

    if (!state.key.trim()) return setError("Le champ key est requis.");
    if (!state.name.trim()) return setError("Le champ name est requis.");

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/pricing/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(state)),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          json?.message || json?.error || "Erreur lors de la mise à jour.",
        );
        return;
      }

      router.push("/pricing/categories");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
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
              <Layers className="h-6 w-6 text-blue-600" />
              Modifier une catégorie
            </CardTitle>
            <p className="text-sm text-gray-600">
              {category._count.features} feature(s) liées.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/pricing/categories">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
            <Button onClick={onSubmit} disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
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
        <section className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Infos</h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-2">
              <Label>Key (unique)</Label>
              <Input
                value={state.key}
                onChange={(e) =>
                  setState((p) => ({ ...p, key: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-6 space-y-2">
              <Label>Name (interne)</Label>
              <Input
                value={state.name}
                onChange={(e) =>
                  setState((p) => ({ ...p, name: e.target.value }))
                }
              />
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
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Traductions</h3>

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
              <Label>Nom affiché ({activeLocale.toUpperCase()})</Label>
              <Input
                value={state.translations[activeLocale].name}
                onChange={(e) =>
                  setState((p) => ({
                    ...p,
                    translations: {
                      ...p.translations,
                      [activeLocale]: {
                        ...p.translations[activeLocale],
                        name: e.target.value,
                      },
                    },
                  }))
                }
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" asChild>
            <Link href="/pricing/categories">Annuler</Link>
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
