"use client";

// apps/app/src/components/invoices/workspace-invoices-client.tsx
import * as React from "react";
import { Button } from "@tada/ui/components/button";
import { Badge } from "@tada/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tada/ui/components/table";
import { Download } from "lucide-react";

type InvoiceItem = {
  id: string;
  invoiceNumber: string;
  status: string; // "issued" | "paid" | "pending" | ...
  issuedAt: string;
  createdAt?: string;

  // ✅ pour la colonne Amount
  amountCents: number; // XOF integer (chez toi tu utilises XOF sans /100)
  currency: string; // "XOF"

  workspacePlanSubscriptionId: string | null;
  workspaceCreditTransactionId: string | null;
};

type ApiResponse = {
  success: true;
  data: InvoiceItem[];
  nextCursor: string | null;
};

function formatDateShort(value: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatMoney(amount: number, currency: string) {
  const n = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency || "XOF",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return String(n);
  }
}

function statusPill(status: string) {
  const s = String(status || "").toLowerCase();

  // tu peux ajuster selon tes statuts
  if (s === "paid") {
    return (
      <Badge className="bg-green-50 text-green-700 border border-green-100">
        paid
      </Badge>
    );
  }
  if (s === "issued") {
    return (
      <Badge className="bg-blue-50 text-blue-700 border border-blue-100">
        issued
      </Badge>
    );
  }
  if (s === "pending") {
    return (
      <Badge className="bg-amber-50 text-amber-700 border border-amber-100">
        pending
      </Badge>
    );
  }

  return (
    <Badge className="bg-gray-50 text-gray-700 border border-gray-100">
      {s || "—"}
    </Badge>
  );
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
      const json = (await res.json().catch(() => null)) as ApiResponse | null;

      if (!res.ok || !json?.success) {
        throw new Error((json as any)?.error || "Failed to load invoices");
      }

      return json;
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

        setItems(data.data || []);
        setNextCursor(data.nextCursor ?? null);
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
      setItems((prev) => [...prev, ...(data.data || [])]);
      setNextCursor(data.nextCursor ?? null);
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-900">
          Historique des factures
        </div>
        <div className="text-sm text-gray-500">Téléchargez vos factures.</div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-md" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="text-sm font-medium text-red-700">
                Impossible de charger les factures
              </div>
              <div className="text-xs text-red-600 mt-1">{error}</div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-sm font-medium text-gray-700">
              Aucune facture
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Les factures générées apparaîtront ici.
            </div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-gray-600">Invoice</TableHead>
                  <TableHead className="text-gray-600">Date</TableHead>
                  <TableHead className="text-gray-600">Amount</TableHead>
                  <TableHead className="text-gray-600">Status</TableHead>
                  <TableHead className="text-right text-gray-600">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {it.invoiceNumber || it.id.slice(0, 10)}
                    </TableCell>

                    <TableCell className="text-gray-600">
                      {formatDateShort(it.issuedAt)}
                    </TableCell>

                    <TableCell className="text-gray-900">
                      {formatMoney(it.amountCents ?? 0, it.currency ?? "XOF")}
                    </TableCell>

                    <TableCell>{statusPill(it.status)}</TableCell>

                    <TableCell className="text-right">
                      {it.status === "paid" ? (
                        <Button asChild variant="outline" size="sm">
                          <a
                            href={downloadUrl(it.id)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Télécharger <Download className="ml-1" size={16} />
                          </a>
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-center p-4 border-t bg-white">
              {nextCursor ? (
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  variant="outline"
                >
                  {loadingMore ? "Chargement..." : "Load more"}
                </Button>
              ) : (
                <div className="text-xs text-gray-500">End of list.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
