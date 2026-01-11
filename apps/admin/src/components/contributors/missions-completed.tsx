"use client";

import { useI18n } from "@/locales/client";
import { Badge } from "@tada/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tada/ui/components/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tada/ui/components/table";
import { cn } from "@tada/ui/lib/utils";
import {
  type Row,
  type RowData,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    align: string;
  }
}

type MissionAssignment = {
  id: string;
  status: string;
  progress: number;
  assignedAt: Date;
  acceptedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  dueDate: Date | null;
  priority: string;
  mission: {
    id: string;
    name: string;
    type: string | null;
    organization: {
      name: string;
    } | null;
  };
  assignedByUser: {
    name: string;
  };
};

const Button = ({
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

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    assigned: {
      variant: "secondary" as const,
      icon: AlertCircle,
      label: "Assignée",
    },
    accepted: {
      variant: "default" as const,
      icon: CheckCircle2,
      label: "Acceptée",
    },
    in_progress: {
      variant: "default" as const,
      icon: PlayCircle,
      label: "En cours",
    },
    completed: {
      variant: "success" as const,
      icon: CheckCircle2,
      label: "Complétée",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.assigned;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityConfig = {
    low: { variant: "secondary" as const, label: "Faible" },
    medium: { variant: "default" as const, label: "Moyenne" },
    high: { variant: "destructive" as const, label: "Haute" },
    urgent: { variant: "destructive" as const, label: "Urgente" },
  };

  const config =
    priorityConfig[priority as keyof typeof priorityConfig] ||
    priorityConfig.medium;

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export function MissionsSection({
  assignedMissions,
  completedMissions,
  params,
}: {
  assignedMissions: MissionAssignment[];
  completedMissions: MissionAssignment[];
  params: { id: string };
}) {
  const t = useI18n();
  const pageSize = 8;
  const router = useRouter();

  const assignedColumns = [
    {
      header: t("contributors.missions.columns.title"),
      accessorKey: "mission.name",
      meta: {
        align: "text-left",
      },
      cell: ({ row }: { row: Row<MissionAssignment> }) => (
        <div className="font-medium">{row.original.mission.name}</div>
      ),
    },
    {
      header: t("contributors.missions.columns.company"),
      accessorKey: "mission.organization.name",
      meta: {
        align: "text-left",
      },
      cell: ({ row }: { row: Row<MissionAssignment> }) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          {row.original.mission.organization?.name || "N/A"}
        </div>
      ),
    },
    {
      header: "Statut",
      accessorKey: "status",
      meta: {
        align: "text-left",
      },
      cell: ({ row }: { row: Row<MissionAssignment> }) => (
        <StatusBadge status={row.original.status} />
      ),
    },
    {
      header: "Priorité",
      accessorKey: "priority",
      meta: {
        align: "text-left",
      },
      cell: ({ row }: { row: Row<MissionAssignment> }) => (
        <PriorityBadge priority={row.original.priority} />
      ),
    },
    {
      header: "Progression",
      accessorKey: "progress",
      meta: {
        align: "text-left",
      },
      cell: ({ row }: { row: Row<MissionAssignment> }) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${row.original.progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">
            {row.original.progress}%
          </span>
        </div>
      ),
    },
    {
      header: "Date limite",
      accessorKey: "dueDate",
      meta: {
        align: "text-right",
      },
      cell: ({ row }: { row: Row<MissionAssignment> }) => (
        <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          {row.original.dueDate
            ? new Date(row.original.dueDate).toLocaleDateString("fr-FR")
            : "Non définie"}
        </div>
      ),
    },
  ];

  const completedColumns = [
    {
      header: t("contributors.missions.columns.title"),
      accessorKey: "mission.name",
      meta: {
        align: "text-left",
      },
      cell: ({ row }: { row: Row<MissionAssignment> }) => (
        <div className="font-medium">{row.original.mission.name}</div>
      ),
    },
    {
      header: t("contributors.missions.columns.company"),
      accessorKey: "mission.organization.name",
      meta: {
        align: "text-left",
      },
      cell: ({ row }: { row: Row<MissionAssignment> }) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          {row.original.mission.organization?.name || "N/A"}
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "mission.type",
      meta: {
        align: "text-left",
      },
      cell: ({ row }: { row: Row<MissionAssignment> }) => (
        <Badge variant="outline">
          {row.original.mission.type || "Standard"}
        </Badge>
      ),
    },
    {
      header: "Date de completion",
      accessorKey: "completedAt",
      meta: {
        align: "text-left",
      },
      cell: ({ row }: { row: Row<MissionAssignment> }) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          {row.original.completedAt
            ? new Date(row.original.completedAt).toLocaleDateString("fr-FR")
            : "N/A"}
        </div>
      ),
    },
    {
      header: t("contributors.missions.columns.earnings"),
      accessorKey: "earnings",
      meta: {
        align: "text-right",
      },
      cell: ({ row }: { row: Row<MissionAssignment> }) => {
        // Calcul des gains basé sur le type de mission
        const earnings = row.original.mission.type === "premium" ? 5000 : 2500;
        return (
          <div className="text-right font-medium text-green-600">
            {earnings.toLocaleString()} Fcfa
          </div>
        );
      },
    },
  ];

  const assignedTable = useReactTable({
    data: assignedMissions,
    columns: assignedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: pageSize,
      },
    },
  });

  const completedTable = useReactTable({
    data: completedMissions,
    columns: completedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: pageSize,
      },
    },
  });

  const renderTable = (table: any, emptyMessage: string) => (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: any) => (
                <TableHead
                  key={header.id}
                  className={cn(header.column.columnDef.meta?.align)}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="text-center py-8 text-gray-500"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row: any) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() =>
                  router.push(
                    `/contributors/${params?.id}/${row.original.missionId}`
                  )
                }
              >
                {row.getVisibleCells().map((cell: any) => (
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

      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm tabular-nums text-gray-500">
            {t("contributors.list.pagination.page")}{" "}
            <span className="font-medium text-gray-900">{`${
              table.getState().pagination.pageIndex + 1
            }`}</span>{" "}
            {t("contributors.list.pagination.of")}{" "}
            <span className="font-medium text-gray-900">{`${table.getPageCount()}`}</span>
          </p>
          <div className="inline-flex items-center rounded-full shadow-sm ring-1 ring-inset ring-gray-300">
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">
                {t("contributors.list.pagination.previous")}
              </span>
              <ArrowLeft className="size-5 text-gray-700 group-hover:text-gray-900" />
            </Button>
            <span className="h-5 border-r border-gray-300" />
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">
                {t("contributors.list.pagination.next")}
              </span>
              <ArrowRight className="size-5 text-gray-700 group-hover:text-gray-900" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full rounded-lg border border-gray-100 bg-white shadow-sm p-6">
      <Tabs defaultValue="assigned" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Missions du contributeur
          </h2>
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="assigned" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Assignées ({assignedMissions.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Complétées ({completedMissions.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="assigned" className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Missions en cours et à venir</span>
            </div>
          </div>
          {renderTable(assignedTable, "Aucune mission assignée pour le moment")}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Missions terminées avec succès</span>
            </div>
          </div>
          {renderTable(
            completedTable,
            "Aucune mission complétée pour le moment"
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
