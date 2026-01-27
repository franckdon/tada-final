"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";

import {
  ArrowLeft,
  Save,
  CircleDollarSign,
  Settings2,
  ListChecks,
  Hash,
  Lock,
} from "lucide-react";

type PlanCode = "starter" | "growth" | "business" | "entreprise";

const ALLOWED_CODES: PlanCode[] = [
  "starter",
  "growth",
  "business",
  "entreprise",
];

const PLAN_PRESETS: Record<PlanCode, { name: string; sortOrder: number }> = {
  starter: { name: "Starter", sortOrder: 1 },
  growth: { name: "Growth", sortOrder: 2 },
  business: { name: "Business", sortOrder: 3 },
  entreprise: { name: "Entreprise", sortOrder: 4 },
};

type FormState = {
  code: PlanCode | "";
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

function validate(state: FormState) {
  const errors: string[] = [];

  if (!state.code) errors.push("Le code du plan est requis.");
  if (state.code && !ALLOWED_CODES.includes(state.code))
    errors.push("Code invalide.");

  if (!state.name.trim()) errors.push("Le nom du plan est requis.");

  const priceCents = parseEuroToCents(state.priceDisplay);
  if (!Number.isInteger(priceCents) || priceCents < 0) {
    errors.push("Le prix est invalide.");
  }

  const frCount = (state.bulletsFr ?? "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean).length;
  const enCount = (state.bulletsEn ?? "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean).length;

  if (frCount === 0 && enCount === 0) {
    errors.push("Ajoute au moins un bullet point (FR ou EN).");
  }

  if (!Number.isFinite(state.sortOrder) || state.sortOrder < 0) {
    errors.push("sortOrder doit être un entier >= 0.");
  }

  return errors;
}

function buildPayload(state: FormState) {
  return {
    code: state.code,
    name: state.name.trim(),
    description: state.description.trim() || null,
    priceCents: parseEuroToCents(state.priceDisplay),
    bulletsFr: state.bulletsFr,
    bulletsEn: state.bulletsEn,
    sortOrder: state.sortOrder,
    isActive: state.isActive,
  };
}

export function PlanCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [state, setState] = React.useState<FormState>(() => ({
    code: "",
    name: "",
    description: "",
    priceDisplay: "",
    bulletsFr: "",
    bulletsEn: "",
    sortOrder: 0,
    isActive: true,
  }));

  // Code non modifiable après sélection
  const codeLocked = state.code !== "";

  const onChooseCode = (value: string) => {
    const code = value as PlanCode;
    if (!ALLOWED_CODES.includes(code)) return;

    const preset = PLAN_PRESETS[code];

    setState((p) => ({
      ...p,
      code,
      name: preset.name, // force Appinio naming
      sortOrder: preset.sortOrder,
    }));
  };

  const onSubmit = async () => {
    setError(null);

    const errors = validate(state);
    if (errors.length) {
      setError(errors.join(" "));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload(state);

      const res = await fetch("/api/pricing/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          json?.details?.message ||
          json?.message ||
          json?.error ||
          "Erreur lors de la création du plan.";
        setError(msg);
        return;
      }

      router.push("/pricing/plans");
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
              <CircleDollarSign className="h-6 w-6 text-green-600" />
              Créer un plan
            </CardTitle>
            <p className="text-sm text-gray-600">
              Le code est un identifiant fixe
              (Starter/Growth/Business/Entreprise).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/pricing/plans">
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
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-gray-700" />
            <h3 className="text-base font-semibold text-gray-900">
              Informations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* CODE (locked after choice) */}
            <div className="md:col-span-3 space-y-2">
              <Label>Code (fixe)</Label>
              <Select value={state.code} onValueChange={onChooseCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {ALLOWED_CODES.map((c) => (
                    <SelectItem key={c} value={c}>
                      <span className="inline-flex items-center gap-2">
                        <Hash className="h-4 w-4 text-gray-500" />
                        {c}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-xs text-gray-500">
                Code fixe après création. Ici tu peux encore le changer avant
                d’enregistrer.
              </p>
            </div>

            {/* NAME (force Appinio naming - non modifiable) */}
            <div className="md:col-span-4 space-y-2">
              <Label>Nom du plan</Label>
              <Input
                value={state.name}
                disabled
                placeholder="Sélectionne un code"
              />
              <p className="text-xs text-gray-500">
                Le nom est automatiquement fixé à partir du code (Appinio-like).
              </p>
            </div>

            <div className="md:col-span-5 space-y-2">
              <Label>Petite description (optionnel)</Label>
              <Input
                value={state.description}
                onChange={(e) =>
                  setState((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Ex: Pour démarrer vite avec l'essentiel"
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label>Ordre</Label>
              <Input value={state.sortOrder} disabled type="number" />
              <p className="text-xs text-gray-500">
                L’ordre est prédéfini par plan (1/2/3/4).
              </p>
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label>Prix (USD)</Label>
              <Input
                value={state.priceDisplay}
                onChange={(e) =>
                  setState((p) => ({ ...p, priceDisplay: e.target.value }))
                }
                placeholder="Ex: 19.99"
              />
              <p className="text-xs text-gray-500">
                Montant en USD (décimales autorisées). Stocké en cents.
              </p>
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
            </div>
          </div>
        </section>

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
                placeholder={
                  "Ex:\n- 3 missions / mois\n- Support email\n- Analytics de base"
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
                placeholder={
                  "Ex:\n- 3 missions / month\n- Email support\n- Basic analytics"
                }
                rows={10}
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" asChild>
            <Link href="/pricing/plans">Annuler</Link>
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Création..." : "Créer le plan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
