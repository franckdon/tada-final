// apps/admin/src/components/pricing/addons/addons-table.tsx
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
import { Label } from "@tada/ui/components/label";
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
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Gift,
  BadgeDollarSign,
  Link2,
} from "lucide-react";

type Currency = "USD" | "XOF" | string;
type BillingInterval = "month" | "year" | string;
type FeatureValueType = "boolean" | "number" | "text" | string;

export type AddOnRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;

  valueType: FeatureValueType;
  unit: string | null;

  translations: Array<{
    id: string;
    locale: "fr" | "en" | string;
    name: string;
    description: string | null;
  }>;

  _count: { availableInPlans: number };

  createdAt: string;
  updatedAt: string;
};

function formatMoney(amountCents: number, currency: string) {
  const amount = amountCents / 100;

  if (currency === "XOF") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function intervalLabel(i: string) {
  if (i === "month") return "Mensuel";
  if (i === "year") return "Annuel";
  return i;
}

function valueTypeLabel(t: string) {
  if (t === "boolean") return "Boolean";
  if (t === "number") return "Number";
  if (t === "text") return "Text";
  return t;
}

function valueTypeBadgeClass(t: string) {
  if (t === "boolean")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (t === "number") return "bg-blue-50 text-blue-700 border-blue-200";
  if (t === "text") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
}

export function AddOnsTable({ addOns }: { addOns: AddOnRow[] }) {
  const router = useRouter();

  const [globalFilter, setGlobalFilter] = React.useState("");
  const [intervalFilter, setIntervalFilter] =
    React.useState<BillingInterval>("month");

  const columns = React.useMemo<ColumnDef<AddOnRow>[]>(
    () => [
      {
        accessorKey: "key",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Key <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">
              {row.original.key}
            </div>
            <div className="text-xs text-gray-500 truncate max-w-[260px]">
              {row.original.description || "—"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Add-on <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const x = row.original;
          const fr = x.translations.find((t) => t.locale === "fr")?.name;
          const en = x.translations.find((t) => t.locale === "en")?.name;

          return (
            <div className="space-y-1">
              <div className="font-semibold text-gray-900">{x.name}</div>

              <div className="text-xs text-gray-500">
                {fr ? `FR: ${fr}` : "FR: —"} • {en ? `EN: ${en}` : "EN: —"}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Badge className={`border ${valueTypeBadgeClass(x.valueType)}`}>
                  {valueTypeLabel(x.valueType)}
                </Badge>

                {x.unit ? (
                  <Badge className="bg-gray-100 text-gray-800 border border-gray-200">
                    unit: {x.unit}
                  </Badge>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        id: "coverage",
        header: "Usage",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-gray-400" />
              <span>{row.original._count.availableInPlans} plan(s)</span>
            </div>
            <div className="text-xs text-gray-400">
              {row.original.translations.length} traduction(s) •{" "}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            MAJ <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {new Date(row.original.updatedAt).toLocaleDateString("fr-FR")}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const addOn = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/pricing/addons/${addOn.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href={`/pricing/addons/edit/${addOn.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-red-600"
                  onClick={async () => {
                    const ok = window.confirm(
                      `Supprimer l'add-on "${addOn.name}" ? Cette action est irréversible.`,
                    );
                    if (!ok) return;

                    const res = await fetch(`/api/pricing/addons/${addOn.id}`, {
                      method: "DELETE",
                    });

                    if (!res.ok) {
                      const json = await res.json().catch(() => null);
                      alert(
                        json?.message ||
                          json?.error ||
                          "Erreur lors de la suppression.",
                      );
                      return;
                    }

                    router.refresh();
                  }}
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
    [intervalFilter, router],
  );

  const filteredData = React.useMemo(() => {
    const q = globalFilter.trim().toLowerCase();

    return addOns.filter((a) => {
      const matchesSearch =
        !q ||
        a.key.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.description || "").toLowerCase().includes(q);

      return matchesSearch;
    });
  }, [addOns, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-purple-600" />
            Add-ons
          </CardTitle>

          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/pricing/addons/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel add-on
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher (key, nom, description)..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="w-full lg:w-[180px]">
            <Label className="text-xs text-gray-600">Période</Label>
            <Select
              value={intervalFilter}
              onValueChange={(v) => setIntervalFilter(v as any)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">{intervalLabel("month")}</SelectItem>
                <SelectItem value="year">{intervalLabel("year")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50/50">
                  {headerGroup.headers.map((header) => (
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
                    Aucun add-on trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            {table.getFilteredRowModel().rows.length} add-on(s)
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
