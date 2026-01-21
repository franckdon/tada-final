"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Badge } from "@tada/ui/components/badge";
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
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";

type CategoryRow = {
  id: string;
  key: string;
  name: string;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
  translations: Array<{ locale: string; name: string }>;
  _count: { features: number };
};

function getTranslation(row: CategoryRow, locale: "fr" | "en") {
  return row.translations.find((t) => t.locale === locale)?.name || null;
}

export function CategoriesTable({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo<ColumnDef<CategoryRow>[]>(
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
        header: "Catégorie",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">
              {row.original.name}
            </div>
            <div className="text-xs text-gray-500">key: {row.original.key}</div>
          </div>
        ),
      },
      {
        id: "translations",
        header: "Traductions",
        cell: ({ row }) => {
          const fr = getTranslation(row.original, "fr");
          const en = getTranslation(row.original, "en");

          return (
            <div className="flex flex-wrap gap-2">
              <Badge className="border bg-gray-50 text-gray-800">
                FR: {fr ?? "—"}
              </Badge>
              <Badge className="border bg-gray-50 text-gray-800">
                EN: {en ?? "—"}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "features",
        header: "Features",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original._count.features} feature(s)
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/pricing/categories/edit/${cat.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-red-600"
                  onClick={async () => {
                    const ok = window.confirm(
                      `Supprimer la catégorie "${cat.name}" ?`,
                    );
                    if (!ok) return;

                    const res = await fetch(
                      `/api/pricing/categories/${cat.id}`,
                      {
                        method: "DELETE",
                      },
                    );

                    if (!res.ok) {
                      const json = await res.json().catch(() => null);
                      alert(
                        json?.error ||
                          json?.message ||
                          "Suppression impossible.",
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
    [router],
  );

  const filteredData = React.useMemo(() => {
    const q = globalFilter.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => {
      const fr = getTranslation(c, "fr")?.toLowerCase() || "";
      const en = getTranslation(c, "en")?.toLowerCase() || "";
      return (
        c.name.toLowerCase().includes(q) ||
        c.key.toLowerCase().includes(q) ||
        fr.includes(q) ||
        en.includes(q)
      );
    });
  }, [categories, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-blue-600" />
            Categories
          </CardTitle>

          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/pricing/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle catégorie
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
              placeholder="Rechercher (name, key, translation)..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>
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
                    Aucune catégorie trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            {table.getFilteredRowModel().rows.length} catégorie(s)
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
