// apps/admin/src/components/pricing/plans/tabs/plan-addons-tab.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@tada/ui/components/switch";
import { Input } from "@tada/ui/components/input";
import { Button } from "@tada/ui/components/button";
import { Badge } from "@tada/ui/components/badge";
import { Card } from "@tada/ui/components/card";
import { Save, Search, Link2 } from "lucide-react";

type AddOnLite = {
  id: string;
  key: string;
  name: string;
  unit: string | null;
  feature: { id: string; key: string; label: string } | null;
};

type ExistingLink = {
  addOnId: string;
  isEnabled: boolean;
};

export function PlanAddOnsTab({
  planId,
  addOns,
  existing,
}: {
  planId: string;
  addOns: AddOnLite[];
  existing: ExistingLink[];
}) {
  const router = useRouter();

  const [q, setQ] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // state map addOnId -> { linked, enabled }
  const [state, setState] = React.useState<
    Record<string, { linked: boolean; enabled: boolean }>
  >(() => {
    const map: Record<string, { linked: boolean; enabled: boolean }> = {};
    for (const a of addOns) map[a.id] = { linked: false, enabled: true };
    for (const x of existing)
      map[x.addOnId] = { linked: true, enabled: x.isEnabled };
    return map;
  });

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return addOns;
    return addOns.filter(
      (a) =>
        a.key.toLowerCase().includes(needle) ||
        a.name.toLowerCase().includes(needle) ||
        (a.feature?.label || "").toLowerCase().includes(needle),
    );
  }, [addOns, q]);

  const toggleLinked = (addOnId: string, linked: boolean) => {
    setState((prev) => ({
      ...prev,
      [addOnId]: {
        ...prev[addOnId],
        linked,
        enabled: linked ? prev[addOnId].enabled : true,
      },
    }));
  };

  const toggleEnabled = (addOnId: string, enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      [addOnId]: { ...prev[addOnId], enabled },
    }));
  };

  const onSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const payload = Object.entries(state)
        .filter(([, v]) => v.linked)
        .map(([addOnId, v]) => ({ addOnId, isEnabled: v.enabled }));

      const res = await fetch(`/api/pricing/plans/${planId}/addons`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          json?.message || json?.error || "Erreur lors de la sauvegarde.",
        );
        return;
      }

      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (key, nom, feature)..."
            className="pl-10"
          />
        </div>

        <Button onClick={onSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((a) => {
          const s = state[a.id] || { linked: false, enabled: true };
          return (
            <Card key={a.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-semibold text-gray-900">{a.name}</div>
                  <div className="text-xs text-gray-500">{a.key}</div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {a.unit ? (
                      <Badge className="border bg-gray-100 text-gray-800">
                        unit: {a.unit}
                      </Badge>
                    ) : null}
                    {a.feature ? (
                      <Badge className="border bg-blue-100 text-blue-800 border-blue-200">
                        feature: {a.feature.label}
                      </Badge>
                    ) : (
                      <Badge className="border bg-gray-100 text-gray-800">
                        no feature
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Associer</span>
                    <Switch
                      checked={s.linked}
                      onCheckedChange={(v) => toggleLinked(a.id, v)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Enabled</span>
                    <Switch
                      checked={s.enabled}
                      disabled={!s.linked}
                      onCheckedChange={(v) => toggleEnabled(a.id, v)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
