"use client";

import * as React from "react";
import { Button } from "@tada/ui/components/button";

type InvoiceItem = {
  id: string;
  invoiceNumber: string;
  status: string;
  issuedAt: string;
  createdAt: string;
  workspacePlanSubscriptionId: string | null;
  workspaceCreditTransactionId: string | null;
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("fr-FR");
  } catch {
    return value;
  }
}

function getBadge(status: string) {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return "bg-green-100 text-green-700 border-green-200";
  if (s === "issued") return "bg-blue-100 text-blue-700 border-blue-200";
  if (s === "void") return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export function WorkspaceInvoicesClient({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [items, setItems] = React.useState<InvoiceItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);

  const fetchPage = React.useCallback(
    async (cursor?: string | null) => {
      const url = new URL(
        `/api/workspaces/${encodeURIComponent(workspaceId)}/invoices`,
        window.location.origin,
      );
      url.searchParams.set("limit", "25");
      if (cursor) url.searchParams.set("cursor", cursor);

      const res = await fetch(url.toString(), { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to load invoices");
      }

      return json as {
        success: true;
        data: InvoiceItem[];
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

  const downloadUrl = (invoiceId: string) =>
    `/api/workspaces/${encodeURIComponent(workspaceId)}/invoices/${encodeURIComponent(
      invoiceId,
    )}/pdf`;

  return (
    <div className="flex flex-col border-r border-gray-200 bg-white flex-1 min-w-0 min-h-0">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xl font-semibold">Factures</div>
          <div className="text-sm text-gray-500">
            Historique des factures du workspace (plans & crédits).
          </div>
        </div>
      </div>

      {/* Body */}
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
              Impossible de charger les factures
            </div>
            <div className="text-xs text-red-600 mt-1">{error}</div>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border bg-gray-50 p-6 text-center">
            <div className="text-sm font-medium text-gray-700">
              Aucune facture
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Les factures générées apparaîtront ici.
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {items.map((it) => {
                const sourceLabel = it.workspacePlanSubscriptionId
                  ? "Plan"
                  : it.workspaceCreditTransactionId
                    ? "Crédit"
                    : "—";

                return (
                  <div
                    key={it.id}
                    className="flex items-center justify-between rounded-xl border p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        F
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {it.invoiceNumber}
                          </div>

                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${getBadge(
                              it.status,
                            )}`}
                          >
                            {String(it.status).toUpperCase()}
                          </span>

                          <span className="text-[10px] px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600 flex-shrink-0">
                            {sourceLabel}
                          </span>
                        </div>

                        <div className="text-xs text-gray-500 truncate">
                          Émise : {formatDate(it.issuedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button asChild variant="outline" size="sm">
                        <a href={downloadUrl(it.id)}>Télécharger PDF</a>
                      </Button>
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
                <div className="text-xs text-gray-500">Fin de la liste.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
