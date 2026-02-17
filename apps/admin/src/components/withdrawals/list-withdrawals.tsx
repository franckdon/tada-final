"use client";

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
  Search,
  RotateCcw,
  EyeIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  Wallet,
  Ban,
  Banknote,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { WithdrawalListItem, WithdrawalStatus } from "./type";

/* ----------------------------- Small UI helpers ---------------------------- */

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

function formatAmountXof(raw?: string | null) {
  if (!raw) return "—";
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return new Intl.NumberFormat("fr-FR").format(n);
}

function statusLabel(s: WithdrawalStatus) {
  switch (s) {
    case "pending":
      return "En attente";
    case "approved":
      return "Validé";
    case "rejected":
      return "Refusé";
    case "paid":
      return "Payé";
    case "canceled":
      return "Annulé";
  }
}

function statusBadgeClass(s: WithdrawalStatus) {
  switch (s) {
    case "pending":
      return "bg-yellow-100 text-yellow-900";
    case "approved":
      return "bg-blue-100 text-blue-900";
    case "paid":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "canceled":
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Endpoints Next handlers
 * - POST /api/withdrawals/:id/approve
 * - POST /api/withdrawals/:id/pay
 * - POST /api/withdrawals/:id/reject
 * - POST /api/withdrawals/:id/cancel
 */
function endpoints(id: string) {
  return {
    approve: `/api/withdrawals/${id}/approve`,
    pay: `/api/withdrawals/${id}/pay`,
    reject: `/api/withdrawals/${id}/reject`,
    cancel: `/api/withdrawals/${id}/cancel`,
  };
}

function canApprove(status: WithdrawalStatus) {
  return status === "pending";
}
function canPay(status: WithdrawalStatus) {
  return status === "approved";
}
function canReject(status: WithdrawalStatus) {
  return status === "pending";
}
function canCancelAdmin(status: WithdrawalStatus) {
  // ✅ pending + approved (si approved -> ton cancel fait refund ou pas selon ton backend)
  return status === "pending" || status === "approved";
}

/* --------------------------- Confirm Dialog logic -------------------------- */

type ActionKind = "approve" | "pay" | "reject" | "cancel";

type ActionState =
  | { open: false }
  | {
      open: true;
      kind: ActionKind;
      w: WithdrawalListItem;
      reason?: string;
      providerRef?: string;
    };

function actionTitle(kind: ActionKind) {
  switch (kind) {
    case "approve":
      return "Valider la demande";
    case "pay":
      return "Marquer comme payée";
    case "reject":
      return "Rejeter la demande";
    case "cancel":
      return "Annuler la demande";
  }
}

function actionDescription(kind: ActionKind) {
  switch (kind) {
    case "approve":
      return "Cette action valide la demande (status=approved).";
    case "pay":
      return "Cette action exécute le paiement (status=paid).";
    case "reject":
      return "Cette action refuse la demande (status=rejected). Un motif est obligatoire.";
    case "cancel":
      return "Cette action annule la demande (status=canceled).";
  }
}

function actionConfirmLabel(kind: ActionKind) {
  switch (kind) {
    case "approve":
      return "Valider";
    case "pay":
      return "Marquer payé";
    case "reject":
      return "Rejeter";
    case "cancel":
      return "Annuler";
  }
}

function actionButtonClass(kind: ActionKind) {
  switch (kind) {
    case "approve":
      return "bg-blue-600 hover:bg-blue-700";
    case "pay":
      return "bg-green-600 hover:bg-green-700";
    case "reject":
      return "bg-red-600 hover:bg-red-700";
    case "cancel":
      return "bg-gray-900 hover:bg-gray-800";
  }
}

function ConfirmActionDialog({
  state,
  setState,
  loading,
  onConfirm,
}: {
  state: ActionState;
  setState: (s: ActionState) => void;
  loading: boolean;
  onConfirm: (payload: {
    kind: ActionKind;
    w: WithdrawalListItem;
    reason?: string;
    providerRef?: string;
  }) => Promise<void>;
}) {
  const open = state.open;

  const kind = open ? state.kind : null;
  const w = open ? state.w : null;

  const needsReason = kind === "reject";
  const needsProviderRef = kind === "pay";

  const reason = open ? (state.reason ?? "") : "";
  const providerRef = open ? (state.providerRef ?? "") : "";

  const canSubmit =
    open &&
    !loading &&
    (!needsReason || reason.trim().length > 0) &&
    (!needsProviderRef || true);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setState({ open: false });
      }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{kind ? actionTitle(kind) : ""}</DialogTitle>
          <DialogDescription>
            {kind ? actionDescription(kind) : ""}
          </DialogDescription>
        </DialogHeader>

        {open && w ? (
          <div className="space-y-3">
            <div className="rounded-lg border bg-gray-50 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-gray-900 truncate">
                  {w.user?.name ?? "Utilisateur"}
                </div>
                <Badge
                  className={statusBadgeClass(w.status as WithdrawalStatus)}
                >
                  {statusLabel(w.status as WithdrawalStatus)}
                </Badge>
              </div>

              <div className="mt-1 text-xs text-gray-600 truncate">
                {w.user?.email ?? "—"} • #{w.id.slice(0, 8)}
              </div>

              <div className="mt-2 inline-flex items-center gap-2 text-gray-900">
                <Banknote className="h-4 w-4 text-gray-700" />
                <span className="font-semibold">
                  {formatAmountXof(w.amount)} {w.currency}
                </span>
              </div>
            </div>

            {needsReason ? (
              <div className="space-y-1">
                <div className="text-xs text-gray-600">
                  Motif du rejet <span className="text-red-600">*</span>
                </div>
                <Input
                  value={reason}
                  onChange={(e) =>
                    setState({
                      ...(state as any),
                      open: true,
                      reason: e.target.value,
                    })
                  }
                  placeholder="Ex: KYC non validé, infos invalides…"
                  disabled={loading}
                />
                <div className="text-[11px] text-gray-500">
                  Obligatoire pour rejeter.
                </div>
              </div>
            ) : null}

            {needsProviderRef ? (
              <div className="space-y-1">
                <div className="text-xs text-gray-600">
                  providerRef (optionnel)
                </div>
                <Input
                  value={providerRef}
                  onChange={(e) =>
                    setState({
                      ...(state as any),
                      open: true,
                      providerRef: e.target.value,
                    })
                  }
                  placeholder="Référence opérateur / transaction…"
                  disabled={loading}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-2">
          <UIButton
            variant="ghost"
            onClick={() => setState({ open: false })}
            disabled={loading}
          >
            Fermer
          </UIButton>

          <UIButton
            onClick={async () => {
              if (!open || !kind || !w) return;

              await onConfirm({
                kind,
                w,
                reason: needsReason ? reason.trim() : undefined,
                providerRef:
                  needsProviderRef && providerRef.trim().length > 0
                    ? providerRef.trim()
                    : undefined,
              });
            }}
            disabled={!canSubmit}
            className={cn(actionButtonClass(kind ?? "cancel"))}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Traitement...
              </span>
            ) : (
              actionConfirmLabel(kind ?? "cancel")
            )}
          </UIButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export function ListWithdrawals({
  withdrawals: initial,
  locale,
}: {
  withdrawals: WithdrawalListItem[];
  locale: string;
}) {
  const router = useRouter();
  const pageSize = 10;

  // filters
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | WithdrawalStatus>(
    "all",
  );

  // actions UX
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorById, setErrorById] = useState<Record<string, string | null>>({});

  // dialog state
  const [action, setAction] = useState<ActionState>({ open: false });

  async function postJson(url: string, body?: any) {
    const res = await fetch(url, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch {}

    if (!res.ok) {
      const err =
        json?.error ||
        json?.message ||
        `Erreur (${res.status}) lors de l'appel ${url}`;
      throw new Error(err);
    }

    return json;
  }

  function openApprove(w: WithdrawalListItem) {
    setAction({ open: true, kind: "approve", w });
  }
  function openPay(w: WithdrawalListItem) {
    setAction({ open: true, kind: "pay", w, providerRef: "" });
  }
  function openReject(w: WithdrawalListItem) {
    setAction({ open: true, kind: "reject", w, reason: "" });
  }
  function openCancel(w: WithdrawalListItem) {
    setAction({ open: true, kind: "cancel", w });
  }

  async function confirmAndRun(payload: {
    kind: ActionKind;
    w: WithdrawalListItem;
    reason?: string;
    providerRef?: string;
  }) {
    const { kind, w, reason, providerRef } = payload;

    setErrorById((m) => ({ ...m, [w.id]: null }));
    setActionLoadingId(w.id);

    try {
      if (kind === "approve") {
        await postJson(endpoints(w.id).approve);
      } else if (kind === "pay") {
        await postJson(
          endpoints(w.id).pay,
          providerRef ? { providerRef } : undefined,
        );
      } else if (kind === "reject") {
        await postJson(endpoints(w.id).reject, { reason });
      } else if (kind === "cancel") {
        await postJson(endpoints(w.id).cancel);
      }

      setAction({ open: false });
      router.refresh();
    } catch (e: any) {
      setErrorById((m) => ({ ...m, [w.id]: e?.message ?? "Erreur" }));
    } finally {
      setActionLoadingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return initial.filter((w) => {
      const status = (w.status as WithdrawalStatus) ?? "pending";

      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;

      const hay = [
        w.id,
        w.user?.name ?? "",
        w.user?.email ?? "",
        w.payoutAccount?.label ?? "",
        w.payoutAccount?.type ?? "",
        w.payoutAccount?.provider ?? "",
        w.payoutAccount?.phone ?? "",
        w.walletAccount?.providerId ?? "",
        w.status ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [initial, query, statusFilter]);

  const stats = useMemo(() => {
    const total = initial.length;
    const pending = initial.filter((w) => w.status === "pending").length;
    const approved = initial.filter((w) => w.status === "approved").length;
    const paid = initial.filter((w) => w.status === "paid").length;
    const rejected = initial.filter((w) => w.status === "rejected").length;
    const canceled = initial.filter((w) => w.status === "canceled").length;
    return { total, pending, approved, paid, rejected, canceled };
  }, [initial]);

  const columns = useMemo(
    () => [
      {
        header: "Demande",
        accessorKey: "id",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<WithdrawalListItem> }) => {
          const w = row.original;
          const status = (w.status as WithdrawalStatus) ?? "pending";
          const err = errorById[w.id];

          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className={statusBadgeClass(status)}>
                  {statusLabel(status)}
                </Badge>
                <span className="text-xs text-gray-500 truncate">
                  #{w.id.slice(0, 8)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Créé: {formatDate(w.createdAt)}
              </div>
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
        header: "Utilisateur",
        accessorKey: "user",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<WithdrawalListItem> }) => {
          const u = row.original.user;
          if (!u) return <span className="text-sm text-gray-500">—</span>;

          return (
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate">{u.name}</div>
              <div className="text-xs text-gray-500 truncate">{u.email}</div>
            </div>
          );
        },
      },
      {
        header: "Montant",
        accessorKey: "amount",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<WithdrawalListItem> }) => {
          const w = row.original;
          return (
            <div className="space-y-1">
              <div className="font-semibold text-gray-900">
                {formatAmountXof(w.amount)} {w.currency}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5" />
                Wallet: {w.walletAccount?.providerId ?? "—"}
              </div>
            </div>
          );
        },
      },
      {
        header: "Compte de paiement",
        accessorKey: "payoutAccount",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<WithdrawalListItem> }) => {
          const p = row.original.payoutAccount;
          if (!p) return <span className="text-sm text-gray-500">—</span>;

          const line2 =
            p.type === "mobile_money"
              ? `${p.dialCode ?? ""}${p.phone ?? ""}`.trim() || "—"
              : (p.bankName ?? "—");

          return (
            <div className="space-y-1">
              <div className="font-medium text-gray-900 truncate">
                {p.label}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {p.type} • {line2}
              </div>
            </div>
          );
        },
      },
      {
        header: "Dernière maj",
        accessorKey: "updatedAt",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<WithdrawalListItem> }) => (
          <div className="text-sm text-gray-700">
            {formatDate(row.original.updatedAt)}
          </div>
        ),
      },
      {
        header: "",
        accessorKey: "actions",
        meta: { align: "text-right" },
        cell: ({ row }: { row: Row<WithdrawalListItem> }) => {
          const w = row.original;
          const status = (w.status as WithdrawalStatus) ?? "pending";
          const loading = actionLoadingId === w.id;

          const approveEnabled = canApprove(status);
          const payEnabled = canPay(status);
          const rejectEnabled = canReject(status);
          const cancelEnabled = canCancelAdmin(status);

          return (
            <div className="flex items-center justify-end gap-2">
              {/* VIEW */}
              <Link href={`/${locale}/withdrawals/${w.id}`}>
                <UIButton variant="ghost" size="sm">
                  <EyeIcon className="h-4 w-4" />
                </UIButton>
              </Link>

              {/* APPROVE */}
              <UIButton
                variant="ghost"
                size="sm"
                disabled={!approveEnabled || loading}
                onClick={() => openApprove(w)}
                className={cn(
                  "text-blue-700 hover:text-blue-800",
                  !approveEnabled && "opacity-50",
                )}
                title={
                  approveEnabled
                    ? "Valider (status=approved)"
                    : "Disponible seulement si pending"
                }
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </UIButton>

              {/* PAY */}
              <UIButton
                variant="ghost"
                size="sm"
                disabled={!payEnabled || loading}
                onClick={() => openPay(w)}
                className={cn(
                  "text-green-700 hover:text-green-800",
                  !payEnabled && "opacity-50",
                )}
                title={
                  payEnabled
                    ? "Marquer payé (status=paid)"
                    : "Disponible seulement si approved"
                }
              >
                <Banknote className="h-4 w-4" />
              </UIButton>

              {/* REJECT */}
              <UIButton
                variant="ghost"
                size="sm"
                disabled={!rejectEnabled || loading}
                onClick={() => openReject(w)}
                className={cn(
                  "text-red-600 hover:text-red-700",
                  !rejectEnabled && "opacity-50",
                )}
                title={
                  rejectEnabled ? "Rejeter" : "Disponible seulement si pending"
                }
              >
                <XCircle className="h-4 w-4" />
              </UIButton>

              {/* CANCEL */}
              <UIButton
                variant="ghost"
                size="sm"
                disabled={!cancelEnabled || loading}
                onClick={() => openCancel(w)}
                className={cn(!cancelEnabled && "opacity-50")}
                title={
                  cancelEnabled
                    ? "Annuler"
                    : "Disponible seulement si pending/approved"
                }
              >
                <Ban className="h-4 w-4 mr-1" />
                Annuler
              </UIButton>
            </div>
          );
        },
      },
    ],
    [locale, actionLoadingId, errorById],
  );

  const table = useReactTable<WithdrawalListItem>({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("all");
  };

  const dialogLoading =
    !!actionLoadingId && action.open && action.w.id === actionLoadingId;

  return (
    <div className="w-full rounded-lg border border-gray-100 bg-white shadow-sm p-5">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Withdrawal requests
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Liste des demandes de retrait (filtrable par status)
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">Total: {stats.total}</Badge>
            <Badge className="bg-yellow-100 text-yellow-900">
              Pending: {stats.pending}
            </Badge>
            <Badge className="bg-blue-100 text-blue-900">
              Approved: {stats.approved}
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              Paid: {stats.paid}
            </Badge>
            <Badge className="bg-red-100 text-red-800">
              Rejected: {stats.rejected}
            </Badge>
            <Badge className="bg-gray-100 text-gray-800">
              Canceled: {stats.canceled}
            </Badge>
          </div>
        </div>

        {/* Search + filters */}
        <div className="w-full lg:max-w-[620px]">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <Input
              className="h-11 pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher: user, email, id, payout label, provider..."
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="text-xs text-gray-500 mb-1">Statut</div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as any)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex items-end justify-end">
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

      {/* Table */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(header.column.columnDef.meta?.align)}
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
                  Aucune demande ne correspond aux filtres.
                </div>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(cell.column.columnDef.meta?.align)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
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

      {/* ✅ One single dialog for all actions */}
      <ConfirmActionDialog
        state={action}
        setState={setAction}
        loading={dialogLoading}
        onConfirm={confirmAndRun}
      />
    </div>
  );
}
