"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@tada/ui/components/badge";
import { Button as UIButton } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tada/ui/components/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { cn } from "@tada/ui/lib/utils";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table";

import {
  ArrowLeft,
  ArrowRight,
  EyeIcon,
  Download,
  Search,
  RotateCcw,
  Banknote,
  Loader2,
} from "lucide-react";

import type { InvoiceListItem } from "./type";

/* ----------------------------- helpers ----------------------------- */

const PagerButton = ({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) => (
  <button
    type="button"
    className="group px-2.5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

function formatDate(d?: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatXof(amount: number, currency: string) {
  const n = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "XOF",
    maximumFractionDigits: 0,
  }).format(n);
}

function kindLabel(k: string) {
  if (k === "credits_topup") return "Crédits (paiement)";
  if (k === "plan_subscription") return "Abonnement (plan)";
  return k;
}

function statusBadgeClass(s: string) {
  const v = String(s || "").toLowerCase();
  if (v === "paid") return "bg-green-100 text-green-800";
  if (v === "issued") return "bg-blue-100 text-blue-900";
  if (v === "void" || v === "canceled") return "bg-gray-100 text-gray-800";
  return "bg-yellow-100 text-yellow-900";
}

/* ----------------------------- View dialog ----------------------------- */

type ViewState = { open: false } | { open: true; inv: InvoiceListItem };

function InvoiceViewDialog({
  state,
  setState,
}: {
  state: ViewState;
  setState: (s: ViewState) => void;
}) {
  const open = state.open;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && setState({ open: false })}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Invoice details</DialogTitle>
          <DialogDescription>
            Détails de la facture sélectionnée
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-gray-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-gray-900">
                  {state.inv.invoiceNumber}
                </div>
                <Badge className={statusBadgeClass(state.inv.status)}>
                  {state.inv.status}
                </Badge>
              </div>
              <div className="mt-1 text-xs text-gray-600">
                {kindLabel(state.inv.kind)} • {formatDate(state.inv.issuedAt)}
              </div>
              <div className="mt-2 text-sm text-gray-900 font-semibold">
                {formatXof(state.inv.amountXof, state.inv.currency)}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500">Workspace</div>
                <div className="mt-1 font-medium text-gray-900">
                  {state.inv.workspace?.name ?? "—"}
                </div>
                <div className="text-xs text-gray-600">
                  {state.inv.workspace?.ownerName ?? "—"} •{" "}
                  {state.inv.workspace?.ownerEmail ?? ""}
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500">Billing</div>
                <div className="mt-1 text-sm text-gray-900">
                  Payment method:{" "}
                  <span className="font-semibold">
                    {state.inv.paymentMethod ?? "—"}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-900">
                  Credits:{" "}
                  <span className="font-semibold">
                    {state.inv.creditsQty || 0}
                  </span>
                </div>
              </div>
            </div>

            {state.inv.subscription ? (
              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500">Subscription</div>
                <div className="mt-1 text-sm text-gray-900">
                  Plan:{" "}
                  <span className="font-semibold">
                    {state.inv.subscription.planCode.toUpperCase()}
                  </span>{" "}
                  • {state.inv.subscription.status}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {formatDate(state.inv.subscription.startsAt)} →{" "}
                  {formatDate(state.inv.subscription.endsAt)}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-2">
          <UIButton variant="ghost" onClick={() => setState({ open: false })}>
            Fermer
          </UIButton>

          {open ? (
            <UIButton
              onClick={() =>
                window.open(`/api/invoices/${state.inv.id}/pdf`, "_blank")
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </UIButton>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- Confirm Pay dialog ----------------------------- */

type PayState = { open: false } | { open: true; inv: InvoiceListItem };

function ConfirmPayDialog({
  state,
  setState,
  loading,
  onConfirm,
}: {
  state: PayState;
  setState: (s: PayState) => void;
  loading: boolean;
  onConfirm: (inv: InvoiceListItem) => Promise<void>;
}) {
  const open = state.open;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && setState({ open: false })}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Marquer comme payée</DialogTitle>
          <DialogDescription>
            Cette action change le statut de <b>issued</b> vers <b>paid</b>.
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <div className="rounded-lg border bg-gray-50 p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-gray-900">
                {state.inv.invoiceNumber}
              </div>
              <Badge className={statusBadgeClass(state.inv.status)}>
                {state.inv.status}
              </Badge>
            </div>
            <div className="mt-1 text-xs text-gray-600">
              {state.inv.workspace?.name ?? "—"} • #{state.inv.id.slice(0, 8)}
            </div>
            <div className="mt-2 font-semibold">
              {formatXof(state.inv.amountXof, state.inv.currency)}
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-2">
          <UIButton
            variant="ghost"
            onClick={() => setState({ open: false })}
            disabled={loading}
          >
            Annuler
          </UIButton>

          <UIButton
            className="bg-green-600 hover:bg-green-700"
            disabled={!open || loading}
            onClick={async () => {
              if (!open) return;
              await onConfirm(state.inv);
            }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Traitement...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Marquer payé
              </span>
            )}
          </UIButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------- page list ----------------------------- */

export function ListInvoices({
  invoices: initial,
  locale,
}: {
  invoices: InvoiceListItem[];
  locale: string;
}) {
  const router = useRouter();
  const pageSize = 10;

  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");

  const [view, setView] = useState<ViewState>({ open: false });

  // pay action state
  const [pay, setPay] = useState<PayState>({ open: false });
  const [payLoadingId, setPayLoadingId] = useState<string | null>(null);
  const [errorById, setErrorById] = useState<Record<string, string | null>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return initial.filter((inv) => {
      if (kindFilter !== "all" && inv.kind !== kindFilter) return false;
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;

      if (!q) return true;

      const hay = [
        inv.invoiceNumber,
        inv.id,
        inv.kind,
        inv.status,
        inv.workspace?.name ?? "",
        inv.workspace?.ownerEmail ?? "",
        inv.workspace?.ownerName ?? "",
        inv.paymentMethod ?? "",
        String(inv.amountXof),
        String(inv.creditsQty),
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [initial, query, kindFilter, statusFilter]);

  const kinds = useMemo(() => {
    const s = new Set<string>();
    initial.forEach((i) => s.add(i.kind));
    return Array.from(s).sort();
  }, [initial]);

  const statuses = useMemo(() => {
    const s = new Set<string>();
    initial.forEach((i) => s.add(i.status));
    return Array.from(s).sort();
  }, [initial]);

  async function markPaid(inv: InvoiceListItem) {
    setErrorById((m) => ({ ...m, [inv.id]: null }));
    setPayLoadingId(inv.id);
    try {
      const res = await fetch(`/api/invoices/${inv.id}/mark-paid`, {
        method: "POST",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json?.error || "Impossible de marquer payée");

      setPay({ open: false });
      router.refresh();
    } catch (e: any) {
      setErrorById((m) => ({ ...m, [inv.id]: e?.message ?? "Erreur" }));
      throw e;
    } finally {
      setPayLoadingId(null);
    }
  }

  const columns = useMemo(
    () => [
      {
        header: "Invoice",
        accessorKey: "invoiceNumber",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<InvoiceListItem> }) => {
          const inv = row.original;
          const err = errorById[inv.id];

          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className={statusBadgeClass(inv.status)}>
                  {inv.status}
                </Badge>
                <span className="font-semibold text-gray-900">
                  {inv.invoiceNumber}
                </span>
              </div>
              <div className="text-xs text-gray-500">#{inv.id.slice(0, 8)}</div>
              {err ? (
                <div className="text-xs text-red-600 truncate" title={err}>
                  {err}
                </div>
              ) : null}
            </div>
          );
        },
      },
      {
        header: "Workspace",
        accessorKey: "workspace",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<InvoiceListItem> }) => {
          const w = row.original.workspace;
          if (!w) return <span className="text-sm text-gray-500">—</span>;
          return (
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate">{w.name}</div>
              <div className="text-xs text-gray-500 truncate">
                {w.ownerEmail}
              </div>
            </div>
          );
        },
      },
      {
        header: "Type",
        accessorKey: "kind",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<InvoiceListItem> }) => (
          <div className="text-sm text-gray-800">
            {kindLabel(row.original.kind)}
          </div>
        ),
      },
      {
        header: "Amount",
        accessorKey: "amountXof",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<InvoiceListItem> }) => {
          const inv = row.original;
          return (
            <div className="space-y-1">
              <div className="font-semibold text-gray-900">
                {formatXof(inv.amountXof, inv.currency)}
              </div>
              <div className="text-xs text-gray-500">
                Credits:{" "}
                <span className="font-medium">{inv.creditsQty || 0}</span>
              </div>
            </div>
          );
        },
      },
      {
        header: "Issued",
        accessorKey: "issuedAt",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<InvoiceListItem> }) => (
          <div className="text-sm text-gray-700">
            {formatDate(row.original.issuedAt)}
          </div>
        ),
      },
      {
        header: "",
        accessorKey: "actions",
        meta: { align: "text-right" },
        cell: ({ row }: { row: Row<InvoiceListItem> }) => {
          const inv = row.original;
          const canPay = String(inv.status).toLowerCase() === "issued";
          const loading = payLoadingId === inv.id;

          return (
            <div className="flex items-center justify-end gap-2">
              {/* VIEW */}
              <UIButton
                variant="ghost"
                size="sm"
                onClick={() => setView({ open: true, inv })}
                title="Voir"
              >
                <EyeIcon className="h-4 w-4" />
              </UIButton>

              {/* DOWNLOAD */}
              <UIButton
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.open(`/api/invoices/${inv.id}/pdf`, "_blank")
                }
                title="Télécharger"
              >
                <Download className="h-4 w-4" />
              </UIButton>

              {/* PAY (only if issued) */}
              {canPay ? (
                <UIButton
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  onClick={() => setPay({ open: true, inv })}
                  title="Marquer comme payée"
                  className={cn("text-green-700 hover:text-green-800")}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Banknote className="h-4 w-4" />
                  )}
                </UIButton>
              ) : null}
            </div>
          );
        },
      },
    ],
    [errorById, payLoadingId],
  );

  const table = useReactTable<InvoiceListItem>({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  const resetFilters = () => {
    setQuery("");
    setKindFilter("all");
    setStatusFilter("all");
  };

  const issuedCount = useMemo(
    () =>
      initial.filter((i) => String(i.status).toLowerCase() === "issued").length,
    [initial],
  );
  const paidCount = useMemo(
    () =>
      initial.filter((i) => String(i.status).toLowerCase() === "paid").length,
    [initial],
  );

  const dialogLoading =
    !!payLoadingId && pay.open && pay.inv.id === payLoadingId;

  return (
    <div className="w-full rounded-lg border border-gray-100 bg-white shadow-sm p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Invoices</h2>
          <p className="text-sm text-gray-600 mt-1">
            Liste des factures générées (filtrable + actions
            voir/télécharger/payer)
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">Total: {initial.length}</Badge>
            <Badge className="bg-blue-100 text-blue-900">
              Issued: {issuedCount}
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              Paid: {paidCount}
            </Badge>
          </div>
        </div>

        <div className="w-full lg:max-w-[720px]">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <Input
              className="h-11 pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher: invoice#, workspace, email, type, status..."
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Type</div>
              <Select
                value={kindFilter}
                onValueChange={(v) => setKindFilter(v)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {kinds.map((k) => (
                    <SelectItem key={k} value={k}>
                      {kindLabel(k)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Statut</div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end justify-end">
              <UIButton
                variant="ghost"
                className="h-11 gap-2"
                onClick={resetFilters}
              >
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </UIButton>
            </div>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn((header.column.columnDef as any).meta?.align)}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="text-sm text-gray-500">
                  Aucune facture ne correspond aux filtres.
                </div>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn((cell.column.columnDef as any).meta?.align)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="mt-10 flex items-center justify-between">
        <p className="text-sm tabular-nums text-gray-500">
          Page{" "}
          <span className="font-medium text-gray-900">
            {table.getState().pagination.pageIndex + 1}
          </span>{" "}
          /{" "}
          <span className="font-medium text-gray-900">
            {table.getPageCount()}
          </span>
        </p>

        <div className="inline-flex items-center rounded-full shadow-sm ring-1 ring-inset ring-gray-300">
          <PagerButton
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft className="size-5 text-gray-700 group-hover:text-gray-900" />
          </PagerButton>

          <span className="h-5 border-r border-gray-300" />

          <PagerButton
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ArrowRight className="size-5 text-gray-700 group-hover:text-gray-900" />
          </PagerButton>
        </div>
      </div>

      <InvoiceViewDialog state={view} setState={setView} />

      <ConfirmPayDialog
        state={pay}
        setState={setPay}
        loading={dialogLoading}
        onConfirm={markPaid}
      />
    </div>
  );
}
