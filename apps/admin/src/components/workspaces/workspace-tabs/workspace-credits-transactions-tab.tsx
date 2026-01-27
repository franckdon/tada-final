"use client";

import * as React from "react";
import { Button } from "@tada/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tada/ui/components/table";
import { Badge } from "@tada/ui/components/badge";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import WorkspaceManualCreditsCard from "./workspace-manual-credits-card";

type CreditTx = {
  id: string;
  direction: "credit" | "debit";
  amount: number;
  reason: string;
  reference_id: string | null;
  description: string | null;
  balance_after: number | null;
  created_at: string; // JSON
  actor_user_id: string | null;
  metadata: any | null;
};

type ApiResponse = {
  items: CreditTx[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR");
};

export default function WorkspaceCreditsTransactionsTab({
  workspaceId,
  currentCredits,
}: {
  workspaceId: string;
  currentCredits: number;
}) {
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(20);

  const [direction, setDirection] = React.useState<string>("");
  const [reason, setReason] = React.useState<string>("");

  const [data, setData] = React.useState<ApiResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("pageSize", String(pageSize));
    if (direction) qs.set("direction", direction);
    if (reason.trim()) qs.set("reason", reason.trim());

    const res = await fetch(
      `/api/workspaces/${workspaceId}/credits/transactions?${qs.toString()}`,
      { method: "GET" },
    );

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setLoading(false);
      setError(j?.error ?? "Failed to load transactions");
      return;
    }

    const json = (await res.json()) as ApiResponse;
    setData(json);
    setLoading(false);
  }, [workspaceId, page, pageSize, direction, reason]);

  const refreshAfterManualTx = React.useCallback(async () => {
    setPage(1);
    // petit détail: fetchData dépend de page; donc on appelle une version "page=1" directement
    const qs = new URLSearchParams();
    qs.set("page", "1");
    qs.set("pageSize", String(pageSize));
    if (direction) qs.set("direction", direction);
    if (reason.trim()) qs.set("reason", reason.trim());

    setLoading(true);
    setError(null);

    const res = await fetch(
      `/api/workspaces/${workspaceId}/credits/transactions?${qs.toString()}`,
      { method: "GET" },
    );

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setLoading(false);
      setError(j?.error ?? "Failed to load transactions");
      return;
    }

    const json = (await res.json()) as ApiResponse;
    setData(json);
    setLoading(false);
  }, [workspaceId, pageSize, direction, reason]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [direction, reason]);

  return (
    <div className="space-y-6">
      <WorkspaceManualCreditsCard
        workspaceId={workspaceId}
        currentCredits={currentCredits}
        onApplied={refreshAfterManualTx}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-sm text-gray-500">Solde actuel</div>
          <div className="text-2xl font-semibold text-gray-900">
            {currentCredits} crédits
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="space-y-1">
            <Label>Direction</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={direction === "" ? "default" : "outline"}
                onClick={() => setDirection("")}
              >
                Toutes
              </Button>
              <Button
                type="button"
                variant={direction === "credit" ? "default" : "outline"}
                onClick={() => setDirection("credit")}
              >
                Crédit
              </Button>
              <Button
                type="button"
                variant={direction === "debit" ? "default" : "outline"}
                onClick={() => setDirection("debit")}
              >
                Débit
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Reason</Label>
            <Input
              placeholder="ex: subscription_grant, manual_grant..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-[260px]"
            />
          </div>
        </div>
      </div>

      {/* States */}
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
          {error}
        </div>
      ) : null}

      {/* Table */}
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Solde après</TableHead>
              <TableHead className="text-right">Référence</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-gray-500"
                >
                  Chargement...
                </TableCell>
              </TableRow>
            ) : data?.items?.length ? (
              data.items.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm text-gray-700">
                    {formatDateTime(tx.created_at)}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        tx.direction === "credit" ? "success" : "destructive"
                      }
                    >
                      {tx.direction === "credit" ? "Crédit" : "Débit"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm text-gray-800">
                    {tx.reason}
                  </TableCell>

                  <TableCell className="font-medium">
                    {tx.direction === "credit" ? "+" : "-"}
                    {tx.amount}
                  </TableCell>

                  <TableCell className="text-sm text-gray-700">
                    {tx.balance_after ?? "—"}
                  </TableCell>

                  <TableCell className="text-right text-sm text-gray-600">
                    {tx.reference_id ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-gray-500"
                >
                  Aucun mouvement.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {data
            ? `Page ${data.page} / ${data.totalPages} — ${data.total} mouvements`
            : "—"}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={loading || page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            disabled={loading || !data || page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
