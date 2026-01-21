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

type FormState = {
  key: string;
  name: string;
  sortOrder: number;
  translations: Record<LocaleCode, { locale: LocaleCode; name: string }>;
};

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

export function CategoryCreateForm() {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = React.useState<LocaleCode>("fr");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [state, setState] = React.useState<FormState>({
    key: "",
    name: "",
    sortOrder: 0,
    translations: {
      fr: { locale: "fr", name: "" },
      en: { locale: "en", name: "" },
    },
  });

  const onSubmit = async () => {
    setError(null);

    if (!state.key.trim()) return setError("Le champ key est requis.");
    if (!state.name.trim()) return setError("Le champ name est requis.");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pricing/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(state)),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError(json?.message || json?.error || "Erreur lors de la création.");
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
              Créer une catégorie
            </CardTitle>
            <p className="text-sm text-gray-600">
              Une catégorie sert à regrouper les features dans le matrix.
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
              {isSubmitting ? "Création..." : "Créer"}
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
                placeholder="Ex: deployment, segmentation..."
              />
              <p className="text-xs text-gray-500">
                Identifiant stable (slug technique).
              </p>
            </div>

            <div className="md:col-span-6 space-y-2">
              <Label>Name (interne)</Label>
              <Input
                value={state.name}
                onChange={(e) =>
                  setState((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Ex: Deployment"
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
                placeholder={
                  activeLocale === "fr" ? "Ex: Déploiement" : "Ex: Deployment"
                }
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Tu peux laisser une traduction vide si tu ne la gères pas encore.
          </p>
        </section>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" asChild>
            <Link href="/pricing/categories">Annuler</Link>
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Création..." : "Créer la catégorie"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
