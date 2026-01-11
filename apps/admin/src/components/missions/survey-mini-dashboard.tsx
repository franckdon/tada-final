"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tada/ui/components/table";
import { Button } from "@tada/ui/components/button";
import { Badge } from "@tada/ui/components/badge";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  Eye,
} from "lucide-react";
import { useI18n } from "@/locales/client";
import { TSurvey } from "@/types/survey-response";
import { Plus } from "lucide-react";
import { useBoolean } from "@/hooks/use-boolean";
import { AddSubDashboard } from "./forms/add-sub-dasbboard";
import { SubDashboard } from "@/types/sub-dashboard";
import { useRouter } from "next/navigation";

// Type pour représenter la structure d'un sondage basé sur les données réelles

export const SurveyMiniDashboard = ({
  surveys,

  subDashboards,
}: {
  surveys: TSurvey[];
  subDashboards: SubDashboard[];
}) => {
  const t = useI18n();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const columns: ColumnDef<SubDashboard>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("missions.overview.tableColumns.name") || "Name"}
          <ArrowUpDown className="h-3 w-3 text-gray-400" />
        </div>
      ),
      cell: ({ row }) => {
        const subDash = row.original;
        return <div className="font-medium">{subDash.name}</div>;
      },
    },
    {
      accessorKey: "user",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("missions.overview.tableColumns.author")}
          <ArrowUpDown className="h-3 w-3 text-gray-400" />
        </div>
      ),
      cell: ({ row }) => {
        const subDash = row.original;

        console.log("subDash?.user?.name", subDash?.user?.name);

        return (
          <div className="flex justify-between items-center">
            <span>{subDash?.user?.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("missions.overview.tableColumns.email")}
          <ArrowUpDown className="h-3 w-3 text-gray-400" />
        </div>
      ),
      cell: ({ row }) => {
        const subDash = row.original;
        return (
          <div className="flex justify-between items-center">
            <span>{subDash?.user?.email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("missions.overview.tableColumns.createdAt")}
          <ArrowUpDown className="h-3 w-3 text-gray-400" />
        </div>
      ),
      cell: ({ row }) => {
        const subDash = row.original;
        return (
          <div className="flex justify-between items-center">
            {new Date(subDash.createdAt).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: subDashboards,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-orange-600">
          {t("missions.overview.title") || "Sample Surveys"}
        </h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          {t("missions.overview.addSubDash")}
        </Button>
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-gray-200"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-sm px-4 py-3 text-gray-700 font-medium border-b border-dotted border-gray-400"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  onClick={() => {
                    const subDashboard = row.original;
                    router.push(
                      `/missions/${subDashboard.missionId}/sub-dashboard/${subDashboard.id}`
                    );
                  }}
                  className={`${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-orange-50 cursor-pointer`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
                  {t("missions.overview.noSurvey") || "No surveys found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} sur{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-orange-300 hover:bg-orange-50"
          >
            <ChevronLeft className="h-4 w-4 text-orange-600" />
          </Button>
          <div className="hidden md:flex items-center gap-1">
            {Array.from(
              { length: Math.min(5, table.getPageCount()) },
              (_, i) => {
                const pageIndex = i;
                const isActive =
                  pageIndex === table.getState().pagination.pageIndex;
                return (
                  <Button
                    key={i}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => table.setPageIndex(pageIndex)}
                    className={
                      isActive
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "border-orange-300 hover:bg-orange-50"
                    }
                  >
                    {pageIndex + 1}
                  </Button>
                );
              }
            )}
            {table.getPageCount() > 5 && (
              <span className="text-gray-500">...</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-orange-300 hover:bg-orange-50"
          >
            <ChevronRight className="h-4 w-4 text-orange-600" />
          </Button>
        </div>
      </div>

      <AddSubDashboard
        open={open}
        toggleOpen={setOpen}
        missionId={surveys[0]?.missionId || ""}
      />
    </div>
  );
};
