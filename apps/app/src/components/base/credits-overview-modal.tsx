"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";

type CreditActivity = {
  id: string;
  type: "top_up" | "spend" | string;
  amount: number;
  createdAt: string;
  reason?: string;
  description?: string | null;
};

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  } catch {
    return d;
  }
}

export function CreditsOverviewModal(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  workspaceId: string;
  balance: number;

  onAddCredits: () => void;
}) {
  const { open, onOpenChange, workspaceId, balance, onAddCredits } = props;

  const router = useRouter();

  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<CreditActivity[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !workspaceId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(
      `/api/workspaces/${encodeURIComponent(
        workspaceId,
      )}/credits/activities?limit=3`,
      { cache: "no-store" },
    )
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!mounted) return;

        if (!res.ok || !json?.success) {
          setItems([]);
          setError(json?.error || "Failed to load activities");
          return;
        }

        setItems(Array.isArray(json.data) ? json.data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setItems([]);
        setError("Network error");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, workspaceId]);

  const handleSeeAll = () => {
    // ✅ ferme le modal puis navigue
    onOpenChange(false);
    router.push(`/workspaces/${workspaceId}/activities`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 rounded-xl overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-base font-semibold">Credits</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Balance */}
          <div className="rounded-xl border bg-white p-5 text-center">
            <div className="text-4xl font-semibold">{balance}</div>
            <div className="text-sm text-gray-500 mt-1">Credits</div>

            <Button
              className="mt-4 w-full"
              onClick={() => {
                onOpenChange(false);
                onAddCredits();
              }}
            >
              Add credits
            </Button>
          </div>

          {/* Last activity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Dernière activité</div>

              <Button
                variant="link"
                className="text-xs p-0 h-auto"
                onClick={handleSeeAll}
              >
                Voir tout
              </Button>
            </div>

            {/* ✅ Skeleton (SANS animation) */}
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-3 w-28 bg-gray-200 rounded" />
                        <div className="h-3 w-40 bg-gray-100 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-14 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <div className="text-sm font-medium text-red-700">
                  Impossible de charger l’historique
                </div>
                <div className="text-xs text-red-600 mt-1">{error}</div>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-xl border bg-gray-50 p-4 text-center">
                <div className="text-sm font-medium text-gray-700">
                  Aucune activité
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Les achats et dépenses de crédits apparaîtront ici.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((it) => {
                  const isCredit = it.amount >= 0;
                  const title =
                    it.type === "top_up" ? "Top up" : it.type || "Activity";

                  return (
                    <div
                      key={it.id}
                      className="flex items-center justify-between rounded-xl border p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                            isCredit
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isCredit ? "A" : "S"}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium truncate">
                              {title}
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                isCredit
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : "border-red-200 bg-red-50 text-red-700"
                              }`}
                            >
                              {isCredit ? "Credit" : "Debit"}
                            </span>
                          </div>

                          {it.reason ? (
                            <div className="text-xs text-gray-500 truncate">
                              {it.reason}
                            </div>
                          ) : null}

                          <div className="text-xs text-gray-400">
                            {formatDate(it.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div
                          className={`text-sm font-semibold tabular-nums ${
                            isCredit ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isCredit ? `+${it.amount}` : it.amount}
                        </div>

                        {it.description ? (
                          <div className="text-[11px] text-gray-400 truncate max-w-[140px]">
                            {it.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
