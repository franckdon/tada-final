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
import { Textarea } from "@tada/ui/components/textarea";
import { Label } from "@tada/ui/components/label";
import { Switch } from "@tada/ui/components/switch";

import {
  ArrowLeft,
  Save,
  CircleDollarSign,
  Settings2,
  ListChecks,
  Power,
  Hash,
  Lock,
} from "lucide-react";

type InitialPlan = {
  id: string;
  code: "starter" | "growth" | "business" | "entreprise";
  name: string;
  description: string | null;
  priceCents: number;
  bulletsFr: string;
  bulletsEn: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  name: string;
  description: string;
  priceDisplay: string;
  bulletsFr: string;
  bulletsEn: string;
  sortOrder: number;
  isActive: boolean;
};

function parseEuroToCents(input: string) {
  const raw = input.trim();
  if (!raw) return 0;
  const normalized = raw.replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function centsToEuroDisplay(amountCents: number) {
  return (amountCents / 100).toFixed(2);
}

function validate(state: FormState) {
  const errors: string[] = [];

  if (!state.name.trim()) errors.push("Le nom du plan est requis.");

  const priceCents = parseEuroToCents(state.priceDisplay);
  if (!Number.isInteger(priceCents) || priceCents < 0)
    errors.push("Le prix est invalide.");

  const frCount = (state.bulletsFr ?? "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean).length;
  const enCount = (state.bulletsEn ?? "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean).length;

  if (frCount === 0 && enCount === 0)
    errors.push("Ajoute au moins un bullet point (FR ou EN).");

  if (!Number.isFinite(state.sortOrder) || state.sortOrder < 0)
    errors.push("sortOrder doit être un entier >= 0.");

  return errors;
}

export function PlanEditForm({ initialPlan }: { initialPlan: InitialPlan }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isToggling, setIsToggling] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [state, setState] = React.useState<FormState>(() => ({
    name: initialPlan.name,
    description: initialPlan.description ?? "",
    priceDisplay: centsToEuroDisplay(initialPlan.priceCents),
    bulletsFr: initialPlan.bulletsFr ?? "",
    bulletsEn: initialPlan.bulletsEn ?? "",
    sortOrder: initialPlan.sortOrder ?? 0,
    isActive: initialPlan.isActive ?? true,
  }));

  const save = async () => {
    setError(null);
    setSuccess(null);

    const errors = validate(state);
    if (errors.length) {
      setError(errors.join(" "));
      return;
    }

    setIsSaving(true);
    try {
      // ✅ IMPORTANT: ne pas envoyer code, il est fixe
      const payload = {
        name: state.name.trim(),
        description: state.description.trim() || null,
        priceCents: parseEuroToCents(state.priceDisplay),
        bulletsFr: state.bulletsFr,
        bulletsEn: state.bulletsEn,
        sortOrder: state.sortOrder,
        isActive: state.isActive,
      };

      const res = await fetch(`/api/pricing/plans/${initialPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          json?.details?.message ||
            json?.message ||
            json?.error ||
            "Erreur lors de la sauvegarde.",
        );
      }

      setSuccess("Enregistré ✅");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  const toggleActive = async () => {
    setError(null);
    setSuccess(null);
    setIsToggling(true);

    // optimistic
    setState((p) => ({ ...p, isActive: !p.isActive }));

    try {
      const res = await fetch(`/api/pricing/plans/${initialPlan.id}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(
          json?.details?.message ||
            json?.message ||
            json?.error ||
            "Erreur lors du toggle.",
        );

      setSuccess("Statut mis à jour ✅");
      router.refresh();
    } catch (e) {
      // rollback
      setState((p) => ({ ...p, isActive: !p.isActive }));
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setIsToggling(false);
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CircleDollarSign className="h-6 w-6 text-green-600" />
              Modifier le plan
            </CardTitle>
            <p className="text-sm text-gray-600">
              Plan: <b>{initialPlan.name}</b>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/pricing/plans">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={toggleActive}
              disabled={isToggling}
              className="gap-2"
            >
              <Power className="h-4 w-4" />
              {state.isActive ? "Désactiver" : "Activer"}
            </Button>

            <Button onClick={save} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
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
            {/* CODE FIXE */}
            <div className="md:col-span-3 space-y-2">
              <Label>Code (fixe)</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pl-10" value={initialPlan.code} disabled />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                Identifiant non modifiable.
              </p>
            </div>

            <div className="md:col-span-4 space-y-2">
              <Label>Nom du plan</Label>
              <Input
                value={state.name}
                onChange={(e) =>
                  setState((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-5 space-y-2">
              <Label>Petite description (optionnel)</Label>
              <Input
                value={state.description}
                onChange={(e) =>
                  setState((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-3 space-y-2">
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

            <div className="md:col-span-3 space-y-2">
              <Label>Prix (EUR)</Label>
              <Input
                value={state.priceDisplay}
                onChange={(e) =>
                  setState((p) => ({ ...p, priceDisplay: e.target.value }))
                }
                placeholder="Ex: 19.99"
              />
              <p className="text-xs text-gray-500">Stocké en cents.</p>
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label>Actif</Label>
              <div className="flex items-center gap-3 rounded-md border bg-white px-3 py-2">
                <Switch
                  checked={state.isActive}
                  onCheckedChange={(v: boolean) =>
                    setState((p) => ({ ...p, isActive: v }))
                  }
                />
                <span className="text-sm text-gray-700">
                  {state.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Le switch change l’état dans le payload (PUT). Le bouton
                “Activer/Désactiver” appelle l’endpoint dédié.
              </p>
            </div>
          </div>
        </section>

        {/* Bullets */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-gray-700" />
            <h3 className="text-base font-semibold text-gray-900">
              Bullet points
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 space-y-2">
              <Label>Bullets FR (1 ligne = 1 bullet)</Label>
              <Textarea
                value={state.bulletsFr}
                onChange={(e) =>
                  setState((p) => ({ ...p, bulletsFr: e.target.value }))
                }
                rows={10}
              />
            </div>

            <div className="md:col-span-6 space-y-2">
              <Label>Bullets EN (1 ligne = 1 bullet)</Label>
              <Textarea
                value={state.bulletsEn}
                onChange={(e) =>
                  setState((p) => ({ ...p, bulletsEn: e.target.value }))
                }
                rows={10}
              />
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
