"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@tada/ui/components/button";
import { Badge } from "@tada/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

type CategoryLite = { id: string; key: string; name: string };

type FeatureRow = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  valueType: "boolean" | "number" | "text" | string;
  unit: string | null;
  sortOrder: number;
  categoryId: string | null;
  category: CategoryLite | null;
  translations: Array<{
    locale: "fr" | "en" | string;
    label: string;
    description?: string | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
  _count: { planValues: number; addOns: number };
};

function ValueTypeBadge({ valueType }: { valueType: string }) {
  const cls =
    valueType === "boolean"
      ? "bg-green-100 text-green-800 border-green-200"
      : valueType === "number"
        ? "bg-blue-100 text-blue-800 border-blue-200"
        : "bg-purple-100 text-purple-800 border-purple-200";

  return <Badge className={`${cls} border`}>{valueType}</Badge>;
}

export function FeaturesTable({
  features,
  categories,
}: {
  features: FeatureRow[];
  categories: CategoryLite[];
}) {
  const router = useRouter();

  const [globalFilter, setGlobalFilter] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [valueTypeFilter, setValueTypeFilter] = React.useState<string>("all");

  const filteredData = React.useMemo(() => {
    const q = globalFilter.trim().toLowerCase();
    return features.filter((f) => {
      const matchesSearch =
        !q ||
        f.key.toLowerCase().includes(q) ||
        f.label.toLowerCase().includes(q) ||
        (f.description || "").toLowerCase().includes(q) ||
        f.translations.some((t) => t.label.toLowerCase().includes(q));

      const matchesCategory =
        categoryFilter === "all" || f.categoryId === categoryFilter;
      const matchesType =
        valueTypeFilter === "all" || f.valueType === valueTypeFilter;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [features, globalFilter, categoryFilter, valueTypeFilter]);

  const columns = React.useMemo<ColumnDef<FeatureRow>[]>(
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
        accessorKey: "label",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Feature <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">
              {row.original.label}
            </div>
            <div className="text-xs text-gray-500">
              key: <span className="font-mono">{row.original.key}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "valueType",
        header: "Type",
        cell: ({ row }) => (
          <ValueTypeBadge valueType={row.original.valueType} />
        ),
      },
      {
        id: "category",
        header: "Catégorie",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original.category?.name || "-"}
          </span>
        ),
      },
      {
        id: "usage",
        header: "Usage",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            <div>{row.original._count.planValues} matrix</div>
            <div className="text-xs text-gray-400">
              {row.original._count.addOns} add-ons
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
          const f = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/pricing/features/${f.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/pricing/features/edit/${f.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={async () => {
                    const res = await fetch(`/api/pricing/features/${f.id}`, {
                      method: "DELETE",
                    });
                    if (res.ok) router.refresh();
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
    [router],
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
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold">Features</CardTitle>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/pricing/features/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle feature
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
              placeholder="Rechercher (key, label, traduction...)"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full lg:w-[260px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={valueTypeFilter} onValueChange={setValueTypeFilter}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="Value type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="boolean">boolean</SelectItem>
              <SelectItem value="number">number</SelectItem>
              <SelectItem value="text">text</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-gray-50/50">
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} className="font-semibold">
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
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
                    Aucune feature trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            {table.getFilteredRowModel().rows.length} feature(s)
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
