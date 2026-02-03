"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@tada/ui/components/badge";
import { Button } from "@tada/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import { Input } from "@tada/ui/components/input";
import { Switch } from "@tada/ui/components/switch";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Power,
  ListChecks,
} from "lucide-react";

type PlanRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceCents: number; // on garde le champ tel quel
  bulletsFr: string;
  bulletsEn: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function formatXOF(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}

function countBullets(text: string) {
  return text
    .split("\n")
    .map((x) => x.trim().replace(/^\-\s*/, ""))
    .filter(Boolean).length;
}

export function PlansTable({ plans }: { plans: PlanRow[] }) {
  const router = useRouter();

  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "active" | "inactive"
  >("all");

  const [busyId, setBusyId] = React.useState<string | null>(null);

  const filteredData = React.useMemo(() => {
    const q = globalFilter.trim().toLowerCase();

    return plans.filter((p) => {
      const matchesSearch =
        !q ||
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.bulletsFr ?? "").toLowerCase().includes(q) ||
        (p.bulletsEn ?? "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.isActive) ||
        (statusFilter === "inactive" && !p.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [plans, globalFilter, statusFilter]);

  const toggleActive = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/pricing/plans/${id}/active`, {
        method: "PATCH",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(json?.message || json?.error || "Erreur toggle.");

      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  const deletePlan = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/pricing/plans/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(json?.message || json?.error || "Erreur suppression.");

      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  const columns = React.useMemo<ColumnDef<PlanRow>[]>(
    () => [
      {
        accessorKey: "sortOrder",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ordre <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original.sortOrder}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Plan <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">
              {row.original.name}
            </div>
            <div className="text-xs font-mono text-gray-500">
              {row.original.code}
            </div>
            {row.original.description ? (
              <div className="text-xs text-gray-500 line-clamp-1">
                {row.original.description}
              </div>
            ) : (
              <div className="text-xs text-gray-400">—</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Code <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs font-mono px-2 py-1 rounded bg-gray-100 text-gray-800 border border-gray-200">
            {row.original.code}
          </span>
        ),
      },
      {
        id: "price",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Prix <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        accessorFn: (row) => row.priceCents,
        cell: ({ row }) => (
          <div className="text-sm">
            <div className="font-semibold text-gray-900">
              {formatXOF(row.original.priceCents)}
            </div>
          </div>
        ),
      },
      {
        id: "bullets",
        header: "Bullets",
        cell: ({ row }) => {
          const fr = countBullets(row.original.bulletsFr ?? "");
          const en = countBullets(row.original.bulletsEn ?? "");
          return (
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{fr + en}</span>
                <span className="text-xs text-gray-400">
                  (FR {fr} / EN {en})
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Statut",
        cell: ({ row }) => {
          const active = row.original.isActive;
          return (
            <div className="flex items-center gap-3">
              <Badge
                className={
                  active
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-gray-100 text-gray-800 border border-gray-200"
                }
              >
                {active ? "Actif" : "Inactif"}
              </Badge>

              <div className="flex items-center gap-2">
                <Switch
                  checked={active}
                  disabled={busyId === row.original.id}
                  onCheckedChange={() => toggleActive(row.original.id)}
                />
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const plan = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  disabled={busyId === plan.id}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/pricing/plans/edit/${plan.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => toggleActive(plan.id)}>
                  <Power className="mr-2 h-4 w-4" />
                  {plan.isActive ? "Désactiver" : "Activer"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => deletePlan(plan.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [busyId, router],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      sorting: [{ id: "sortOrder", desc: false }],
      pagination: { pageSize: 10 },
    },
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold">Plans</CardTitle>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/pricing/plans/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau plan
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher (nom, description, bullets)..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as any)}
          >
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-gray-50/50">
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Aucun plan trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            {table.getFilteredRowModel().rows.length} plan(s)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <div className="text-sm text-gray-600">
              Page {table.getState().pagination.pageIndex + 1} sur{" "}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
