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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@tada/ui/components/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  MoreHorizontal,
  Layers,
  Building2,
  BadgeCheck,
  BadgeX,
  Search,
  RotateCcw,
  Clock,
  Trash2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { WorkspaceListItem, SubscriptionState } from "./type";

const PagerButton = ({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) => {
  return (
    <button
      type="button"
      className="group px-2.5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

function formatDate(d?: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

function formatNumberFR(n?: number | null) {
  if (typeof n !== "number") return "—";
  return new Intl.NumberFormat("fr-FR").format(n);
}

function stateLabel(state: SubscriptionState) {
  switch (state) {
    case "none":
      return "Aucun";
    case "inactive":
      return "Inactif";
    case "expired":
      return "Expiré";
    case "scheduled":
      return "À venir";
    case "active":
      return "Actif";
  }
}

function stateBadgeClass(state: SubscriptionState) {
  switch (state) {
    case "active":
      return "bg-green-100 text-green-800";
    case "expired":
      return "bg-red-100 text-red-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "scheduled":
      return "bg-blue-100 text-blue-800";
    case "none":
    default:
      return "bg-slate-100 text-slate-800";
  }
}

export function ListWorkspaces({
  workspaces: initialWorkspaces,
  locale,
}: {
  workspaces: WorkspaceListItem[];
  locale: string;
}) {
  const router = useRouter();
  const pageSize = 10;

  // Search + filters
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SubscriptionState>(
    "all",
  );
  const [planFilter, setPlanFilter] = useState<"all" | string>("all");
  const [expiringSoon, setExpiringSoon] = useState<"all" | "yes" | "no">("all");

  const [deleteWorkspaceId, setDeleteWorkspaceId] = useState<string | null>(
    null,
  );

  // UX delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const uniquePlans = useMemo(() => {
    const set = new Set<string>();
    for (const w of initialWorkspaces) {
      if (w.subscription?.planCode) set.add(String(w.subscription.planCode));
    }
    return Array.from(set).sort();
  }, [initialWorkspaces]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return initialWorkspaces.filter((w) => {
      // status
      if (statusFilter !== "all" && w.subscriptionState !== statusFilter) {
        return false;
      }

      // plan
      if (planFilter !== "all") {
        const code = w.subscription?.planCode
          ? String(w.subscription.planCode)
          : "";
        if (code !== planFilter) return false;
      }

      // expiring soon
      if (expiringSoon !== "all") {
        if (expiringSoon === "yes" && !w.isExpiringSoon) return false;
        if (expiringSoon === "no" && w.isExpiringSoon) return false;
      }

      // search (workspace/org/owner/country/plan)
      if (!q) return true;

      const hay = [
        w.name,
        w.slug,
        w.country,
        w.industry ?? "",
        w.organization?.name ?? "",
        w.organization?.slug ?? "",
        w.owner?.name ?? "",
        w.owner?.email ?? "",
        w.subscription?.planCode ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [initialWorkspaces, query, statusFilter, planFilter, expiringSoon]);

  // Stats header
  const stats = useMemo(() => {
    const total = initialWorkspaces.length;
    const active = initialWorkspaces.filter(
      (w) => w.subscriptionState === "active",
    ).length;
    const inactive = initialWorkspaces.filter(
      (w) => w.subscriptionState === "inactive",
    ).length;
    const none = initialWorkspaces.filter(
      (w) => w.subscriptionState === "none",
    ).length;
    const expSoon = initialWorkspaces.filter((w) => w.isExpiringSoon).length;
    return { total, active, inactive, none, expSoon };
  }, [initialWorkspaces]);

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);

      const res = await fetch(`/api/workspaces/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setDeleteWorkspaceId(null);
      router.refresh();
    } catch (e) {
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  }

  const columns = useMemo(
    () => [
      {
        header: "Workspace",
        accessorKey: "name",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<WorkspaceListItem> }) => {
          const w = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 border-2 border-orange-200 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-orange-600">
                  {w.name ? w.name.charAt(0).toUpperCase() : "?"}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">
                  {w.name || "Sans nom"}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {w.slug || "sans-slug"}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        header: "Organisation",
        accessorKey: "organization",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<WorkspaceListItem> }) => {
          const org = row.original.organization;
          if (!org) return <span className="text-sm text-gray-500">—</span>;

          const statusColors: Record<string, string> = {
            active: "bg-green-100 text-green-800",
            inactive: "bg-gray-100 text-gray-800",
            suspended: "bg-red-100 text-red-800",
          };

          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 truncate">
                  {org.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    statusColors[String(org.status ?? "inactive")] ||
                    statusColors.inactive
                  }
                >
                  {org.status === "active"
                    ? "Active"
                    : org.status === "suspended"
                      ? "Suspendue"
                      : "Inactive"}
                </Badge>
                <span className="text-xs text-gray-500 truncate">
                  {org.slug}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        header: "Pays / Secteur",
        accessorKey: "country",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<WorkspaceListItem> }) => {
          const w = row.original;
          return (
            <div className="space-y-1">
              {w.industry ? (
                <Badge variant="secondary" className="text-xs">
                  {w.industry}
                </Badge>
              ) : null}
              <div className="text-sm text-gray-600">
                {w.country || "—"}
                {w.companySize ? (
                  <span className="text-gray-400"> • {w.companySize}</span>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        header: "Abonnement",
        accessorKey: "subscription",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<WorkspaceListItem> }) => {
          const w = row.original;
          const sub = w.subscription;

          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {w.subscriptionState === "active" ? (
                  <BadgeCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <BadgeX className="h-4 w-4 text-gray-500" />
                )}

                <Badge className={stateBadgeClass(w.subscriptionState)}>
                  {stateLabel(w.subscriptionState)}
                </Badge>

                {sub?.planCode ? (
                  <Badge variant="secondary" className="text-xs">
                    {String(sub.planCode)}
                  </Badge>
                ) : null}

                {w.isExpiringSoon ? (
                  <Badge className="bg-yellow-100 text-yellow-900 text-xs inline-flex gap-1 items-center">
                    <Clock className="h-3.5 w-3.5" />
                    Expire bientôt
                  </Badge>
                ) : null}
              </div>

              {sub ? (
                <div className="text-xs text-gray-500">
                  {formatDate(sub.startsAt)} → {formatDate(sub.endsAt)}
                </div>
              ) : (
                <div className="text-xs text-gray-500">—</div>
              )}
            </div>
          );
        },
      },
      // ✅ CRÉDITS
      {
        header: "Réponses",
        accessorKey: "creditsBalance",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<WorkspaceListItem> }) => {
          const w = row.original;
          const v = w.creditsBalance;

          return (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {formatNumberFR(v)}
              </Badge>
              <span className="text-sm text-gray-500">Réponses</span>
            </div>
          );
        },
      },
      {
        header: "Créé le",
        accessorKey: "createdAt",
        meta: { align: "text-left" },
        cell: ({ row }: { row: Row<WorkspaceListItem> }) => (
          <div className="text-sm text-gray-700">
            {formatDate(row.original.createdAt)}
          </div>
        ),
      },
      {
        header: "",
        accessorKey: "actions",
        meta: { align: "text-right" },
        cell: ({ row }: { row: Row<WorkspaceListItem> }) => {
          const w = row.original;
          const isDeleting = deletingId === w.id;

          return (
            <div className="flex items-center justify-end gap-2">
              {/* VIEW */}
              <Link href={`/${locale}/workspaces/${w.id}`}>
                <UIButton variant="ghost" size="sm">
                  <EyeIcon className="h-4 w-4" />
                </UIButton>
              </Link>

              <UIButton
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => setDeleteWorkspaceId(w.id)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </UIButton>

              {/* MENU */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <UIButton variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </UIButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/workspaces/${w.id}`}>
                      <Layers className="mr-2 h-4 w-4" />
                      Détails
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/workspaces/${w.id}/subscription`}>
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      Gérer l’abonnement
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [locale, deletingId],
  );

  const table = useReactTable<WorkspaceListItem>({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setPlanFilter("all");
    setExpiringSoon("all");
  };

  const dialogIsDeleting = Boolean(
    deleteWorkspaceId && deletingId === deleteWorkspaceId,
  );

  return (
    <div className="w-full rounded-lg border border-gray-100 bg-white shadow-sm p-5">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Layers className="h-6 w-6 text-orange-600" />
            Workspaces
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Liste des workspaces avec abonnement et crédits
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">Total: {stats.total}</Badge>
            <Badge className="bg-green-100 text-green-800">
              Actifs: {stats.active}
            </Badge>
            <Badge className="bg-gray-100 text-gray-800">
              Inactifs: {stats.inactive}
            </Badge>
            <Badge variant="secondary">Aucun: {stats.none}</Badge>
            <Badge className="bg-yellow-100 text-yellow-900">
              Expire bientôt: {stats.expSoon}
            </Badge>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="w-full lg:max-w-[680px]">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <Input
              className="h-11 pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher: workspace, slug, org, owner, email, pays, plan..."
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
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
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="scheduled">À venir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1">
              <div className="text-xs text-gray-500 mb-1">Plan</div>
              <Select
                value={planFilter}
                onValueChange={(v) => setPlanFilter(v)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {uniquePlans.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1">
              <div className="text-xs text-gray-500 mb-1">Expire bientôt</div>
              <Select
                value={expiringSoon}
                onValueChange={(v) => setExpiringSoon(v as any)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="yes">Oui</SelectItem>
                  <SelectItem value="no">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1 flex items-end justify-end">
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
              <TableCell colSpan={8} className="text-center py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Layers className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      Aucun workspace
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Aucun workspace ne correspond aux filtres actuels.
                    </p>
                  </div>
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

      {/* DELETE DIALOG */}
      <Dialog
        open={!!deleteWorkspaceId}
        onOpenChange={() => setDeleteWorkspaceId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer workspace ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <UIButton
              variant="ghost"
              onClick={() => setDeleteWorkspaceId(null)}
              disabled={dialogIsDeleting}
            >
              Annuler
            </UIButton>

            <UIButton
              className="bg-red-600 hover:bg-red-700 inline-flex items-center gap-2"
              disabled={dialogIsDeleting}
              onClick={() =>
                deleteWorkspaceId && handleDelete(deleteWorkspaceId)
              }
            >
              {dialogIsDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </UIButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
