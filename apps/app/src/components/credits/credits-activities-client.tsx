"use client";

import * as React from "react";
import { Button } from "@tada/ui/components/button";
import { useBoolean } from "@/hooks/use-boolean";

import { useWorkspaceCredits } from "@/hooks/use-workspace-credits";
import { useWorkspaceCreditsStore } from "@/hooks/use-workspace-credit-store";
import { CreditsModal } from "../base/credit-modal";
import { PaymentModal } from "../base/payment-modal";

type Activity = {
  id: string;
  label: string;
  reason: string;
  direction: string;
  amount: number;
  description: string | null;
  referenceId: string | null;
  createdAt: string;
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function CreditsActivitiesClient({
  workspaceId,
}: {
  workspaceId: string;
}) {
  // ✅ fetch credits (balance + subscription) via ton hook unique
  useWorkspaceCredits(workspaceId);

  const balance = useWorkspaceCreditsStore((s) => s.balance);
  const subscription = useWorkspaceCreditsStore((s) => s.subscription);

  const creditModal = useBoolean(false);
  const paymentModal = useBoolean(false);

  const [preparedPurchase, setPreparedPurchase] = React.useState<any | null>(
    null,
  );

  const handleAsYouGo = (prepared?: any) => {
    if (prepared) setPreparedPurchase(prepared);
    creditModal.onFalse();
    paymentModal.onTrue();
  };

  // -----------------------
  // Activities list state
  // -----------------------
  const [items, setItems] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);

  const fetchPage = React.useCallback(
    async (cursor?: string | null) => {
      const url = new URL(
        `/api/workspaces/${encodeURIComponent(workspaceId)}/credits/activities`,
        window.location.origin,
      );
      url.searchParams.set("limit", "25");
      if (cursor) url.searchParams.set("cursor", cursor);

      const res = await fetch(url.toString(), { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to load activities");
      }

      return json as {
        success: true;
        data: Activity[];
        nextCursor: string | null;
      };
    },
    [workspaceId],
  );

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchPage(null);
        if (!mounted) return;

        setItems(data.data);
        setNextCursor(data.nextCursor);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Error");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fetchPage]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    try {
      const data = await fetchPage(nextCursor);
      setItems((prev) => [...prev, ...data.data]);
      setNextCursor(data.nextCursor);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      <div className="flex flex-col border-r border-gray-200 bg-white flex-1 min-w-0 min-h-0">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xl font-semibold">Historique du crédit</div>
            <div className="text-sm text-gray-500">
              Historique complet des mouvements de crédits.
            </div>

            {/* petit rappel balance */}
            <div className="mt-2 text-sm text-gray-600">
              Solde actuel :{" "}
              <span className="font-semibold text-gray-900">{balance}</span>{" "}
              crédits
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button onClick={creditModal.onTrue}>Ajouter du crédit</Button>
          </div>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-3 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-52 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="text-sm font-medium text-red-700">
                Impossible de charger l’historique
              </div>
              <div className="text-xs text-red-600 mt-1">{error}</div>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border bg-gray-50 p-6 text-center">
              <div className="text-sm font-medium text-gray-700">
                Aucune activité
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Les achats et dépenses de crédits apparaîtront ici.
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {items.map((it) => {
                  const isCredit = it.amount >= 0;

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
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {it.label}
                            </div>

                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${
                                isCredit
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : "border-red-200 bg-red-50 text-red-700"
                              }`}
                            >
                              {isCredit ? "Credit" : "Debit"}
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 truncate">
                            {it.reason}
                          </div>

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
                          <div className="text-[11px] text-gray-400 truncate max-w-[180px]">
                            {it.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-center">
                {nextCursor ? (
                  <Button onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? "Chargement..." : "Charger plus"}
                  </Button>
                ) : (
                  <div className="text-xs text-gray-500">
                    Fin de l’historique.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <CreditsModal
        open={creditModal.value}
        toggleOpen={creditModal.onToggle}
        handleAsYouGo={handleAsYouGo}
        workspaceId={workspaceId}
        workspacePlanCode={(subscription?.planCode as any) ?? null}
      />

      <PaymentModal
        open={paymentModal.value}
        onOpenChange={paymentModal.onFalse}
        inComingredits={balance}
        workspaceId={workspaceId}
        prepared={preparedPurchase}
      />
    </>
  );
}
