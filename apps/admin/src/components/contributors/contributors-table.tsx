"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useI18n } from "@/locales/client";
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
import { Button } from "@tada/ui/components/button";
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
} from "@tanstack/react-table";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  Ban,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Contributor {
  id: string;
  name: string;
  email: string;
  kyc_status: string | null;
  image: string | null;
  location: string | null;
  job: string | null;
  banned: boolean | null;
  createdAt: Date;
  missionAssignmentsAsContributor?: Array<{
    id: string;
    status: string;
    completedAt: Date | null;
    mission?: { type?: string | null };
  }>;
  completedMissionsCount?: number;
  activeMissionsCount?: number;
  score?: number;
}

// Composants mémorisés avec design amélioré

const ContributorCell = React.memo(
  ({ contributor }: { contributor: Contributor }) => (
    <div className="flex items-center gap-4">
      <div className="relative">
        {contributor.kyc_status === "completed" && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <CheckCircle className="h-2.5 w-2.5 text-white" />
          </div>
        )}
      </div>
      <div>
        <div className="font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-600 transition-colors">
          {contributor.name}
        </div>
        <div className="text-sm text-gray-500">{contributor.email}</div>
      </div>
    </div>
  ),
);

ContributorCell.displayName = "ContributorCell";

const JobCell = React.memo(
  ({ job, location }: { job: string | null; location: string | null }) => (
    <div className="text-sm">
      <div className="font-medium text-gray-900">{job || "Non spécifié"}</div>
      <div className="text-gray-500 flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        {location || "Localisation inconnue"}
      </div>
    </div>
  ),
);

JobCell.displayName = "JobCell";

const StatusCell = React.memo(
  ({
    status,
    isBanned,
  }: {
    status: string | null;
    isBanned: boolean | null;
  }) => {
    if (isBanned) {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0">
          <Ban className="h-3 w-3 mr-1" />
          Banni
        </Badge>
      );
    }

    return status === "completed" ? (
      <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0">
        <CheckCircle className="h-3 w-3 mr-1" />
        Vérifié
      </Badge>
    ) : (
      <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0">
        <XCircle className="h-3 w-3 mr-1" />
        Non vérifié
      </Badge>
    );
  },
);

StatusCell.displayName = "StatusCell";

const MissionsCell = React.memo(
  ({
    assignments,
  }: {
    assignments?: Contributor["missionAssignmentsAsContributor"];
  }) => {
    const safe = assignments ?? [];

    const completed = useMemo(
      () => safe.filter((a) => a.status === "completed").length,
      [safe],
    );

    const active = useMemo(
      () =>
        safe.filter((a) =>
          ["assigned", "accepted", "in_progress"].includes(a.status),
        ).length,
      [safe],
    );

    return (
      <div className="text-sm space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-medium text-gray-900">
            {completed} complétées
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-gray-500">{active} en cours</span>
        </div>
      </div>
    );
  },
);

MissionsCell.displayName = "MissionsCell";

const EarningsCell = React.memo(({ assignments }: { assignments?: any[] }) => {
  const safe = assignments ?? [];

  const earnings = useMemo(
    () =>
      safe
        .filter((a) => a.status === "completed")
        .reduce(
          (sum, a) => sum + (a?.mission?.type === "premium" ? 5000 : 2500),
          0,
        ),
    [safe],
  );

  return (
    <div className="font-bold text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
      {earnings.toLocaleString()} Fcfa
    </div>
  );
});

EarningsCell.displayName = "EarningsCell";

// ======================================================
// ✅ COMPOSANT ACTIONSCELL CORRIGÉ :
// Reçoit maintenant 'onToggleBan' via les props.
// ======================================================
const ActionsCell = React.memo(
  ({
    contributor,
    onToggleBan,
  }: {
    contributor: Contributor;
    onToggleBan: (contributor: Contributor) => void;
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-white/95 backdrop-blur-sm border-0 shadow-xl"
      >
        <DropdownMenuItem
          asChild
          className="hover:bg-blue-50 transition-colors"
        >
          <Link
            href={`/contributors/${contributor.id}`}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4 text-blue-600" />
            Voir le profil
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          className="hover:bg-blue-50 transition-colors"
        >
          <Link
            href={`/contributors/edit/${contributor.id}`}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4 text-blue-600" />
            Modifier
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onToggleBan(contributor)} // 👈 Appel de la fonction via les props
          className={contributor.banned ? "text-green-600" : "text-orange-600"}
        >
          <Ban className="mr-2 h-4 w-4" />
          {contributor.banned ? "Réactiver" : "Bannir"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
);

ActionsCell.displayName = "ActionsCell";

// ======================================================
// ✅ COMPOSANT CONTIBUTORSTABLE CORRIGÉ
// ======================================================
export const ContributorsTable = React.memo(
  ({ contributors }: { contributors: Contributor[] }) => {
    const t = useI18n();
    const router = useRouter();
    const [globalFilter, setGlobalFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Filtres supplémentaires prêts à l'emploi
    const [countryFilter, setCountryFilter] = useState<string>("all");
    const [minCompletedFilter, setMinCompletedFilter] = useState<number>(0);
    const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

    // 🆕 DÉFINITION DE LA FONCTION DE BAN AVEC useCallBack
    const handleToggleBan = useCallback(
      async (contributor: Contributor) => {
        try {
          const response = await fetch(`/api/users/${contributor.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ banned: !contributor.banned }),
          });

          if (response.ok) {
            router.refresh(); // Rafraîchit les données après la modification
          }
        } catch (error) {
          console.error("Error toggling ban:", error);
        }
      },
      [router],
    ); // Dépendance à 'router'

    // Mémoriser les pays disponibles pour le filtre
    const availableCountries = useMemo(() => {
      const set = new Set<string>();
      contributors.forEach((c) => {
        const val = (c as any).country ?? c.location;
        if (val) set.add(val);
      });
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [contributors]);

    // Mémoriser les colonnes pour éviter les re-créations
    const columns = useMemo(
      () => [
        {
          accessorKey: "name",
          header: ({ column }: any) => (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-bold text-gray-700 hover:text-gray-900"
            >
              Contributeur
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }: any) => (
            <ContributorCell contributor={row.original} />
          ),
        },
        // { ... colonne job/location ... },
        {
          accessorKey: "kyc_status",
          header: "Statut KYC",
          cell: ({ row }: any) => (
            <StatusCell
              status={row.original.kyc_status}
              isBanned={row.original.banned}
            />
          ),
        },
        {
          accessorKey: "missions",
          header: "Missions",
          cell: ({ row }: any) => (
            <MissionsCell
              assignments={row.original.missionAssignmentsAsContributor ?? []}
            />
          ),
        },
        // { ... colonne earnings ... },
        {
          accessorKey: "createdAt",
          header: "Inscription",
          cell: ({ row }: any) => (
            <div className="text-sm text-gray-600 font-medium">
              {new Date(row.original.createdAt).toLocaleDateString("fr-FR")}
            </div>
          ),
        },
        {
          id: "actions",
          header: "",
          cell: ({ row }: any) => (
            // 👈 PASSAGE DE LA FONCTION EN PROP À ActionsCell
            <ActionsCell
              contributor={row.original}
              onToggleBan={handleToggleBan}
            />
          ),
        },
      ],
      [handleToggleBan], // 👈 Ajout de handleToggleBan aux dépendances
    );

    // Mémoriser les données filtrées
    const filteredData = useMemo(() => {
      return contributors.filter((contributor: any) => {
        const matchesSearch =
          contributor.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
          contributor.email.toLowerCase().includes(globalFilter.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "verified" &&
            contributor.kyc_status === "completed") ||
          (statusFilter === "unverified" &&
            contributor.kyc_status !== "completed") ||
          (statusFilter === "banned" && contributor.banned) ||
          (statusFilter === "active" &&
            (contributor.activeMissionsCount ?? 0) > 0);

        const countryValue =
          contributor.country ?? contributor.location ?? null;
        const matchesCountry =
          countryFilter === "all" || countryValue === countryFilter;

        const matchesCompleted =
          (contributor.completedMissionsCount ?? 0) >= minCompletedFilter;

        const matchesScore = (contributor.score ?? 0) >= minScoreFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesCountry &&
          matchesCompleted &&
          matchesScore
        );
      });
    }, [
      contributors,
      globalFilter,
      statusFilter,
      countryFilter,
      minCompletedFilter,
      minScoreFilter,
    ]);

    // Callbacks mémorisés
    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalFilter(e.target.value);
      },
      [],
    );

    const handleStatusChange = useCallback((value: string) => {
      setStatusFilter(value);
    }, []);

    const table = useReactTable({
      data: filteredData,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      initialState: {
        pagination: {
          pageSize: 10,
        },
      },
    });

    return (
      <Card className="backdrop-blur-sm rounded-none duration-300">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            {/* Title + (optional) actions */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Liste des Contributeurs
                </span>
              </div>

              {/* (Optionnel) actions à droite */}
              {/* <Button size="sm"><Plus className="h-4 w-4 mr-2" />Ajouter</Button> */}
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
                {/* Recherche */}
                <div className="lg:col-span-4">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Recherche
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      value={globalFilter}
                      onChange={handleSearchChange}
                      placeholder="Nom ou email…"
                      className="pl-9 border-0 bg-gray-50 focus:bg-white/80 transition-colors"
                    />
                  </div>
                </div>

                {/* Statut */}
                <div className="lg:col-span-3">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Statut
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-0 bg-gray-50 focus:ring-0">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="active">Actifs</SelectItem>
                      <SelectItem value="verified">Vérifiés</SelectItem>
                      <SelectItem value="unverified">Non vérifiés</SelectItem>
                      <SelectItem value="banned">Bannis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pays */}
                <div className="lg:col-span-3">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Pays
                  </label>
                  <Select
                    value={countryFilter}
                    onValueChange={setCountryFilter}
                  >
                    <SelectTrigger className="border-0 bg-gray-50 focus:ring-0">
                      <SelectValue placeholder="Tous les pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les pays</SelectItem>
                      {availableCountries.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Min missions complétées */}
                <div className="lg:col-span-1">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Missions
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={minCompletedFilter}
                    onChange={(e) =>
                      setMinCompletedFilter(Number(e.target.value || 0))
                    }
                    placeholder="0"
                    className="border-0 bg-gray-50"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Min complétées
                  </p>
                </div>

                {/* Score min */}
                <div className="lg:col-span-1">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Score
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={minScoreFilter}
                    onChange={(e) =>
                      setMinScoreFilter(Number(e.target.value || 0))
                    }
                    placeholder="0"
                    className="border-0 bg-gray-50"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">Min requis</p>
                </div>

                {/* Reset */}
                <div className="lg:col-span-12 flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-0 bg-gray-100/80 hover:bg-gray-200/80"
                    onClick={() => {
                      setGlobalFilter("");
                      setStatusFilter("all");
                      setCountryFilter("all");
                      setMinCompletedFilter(0);
                      setMinScoreFilter(0);
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border-0 overflow-hidden bg-white/50 backdrop-blur-sm">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-b cursor-pointer border-gray-100 bg-gray-50/50"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-gray-700"
                      >
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
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className={`border-b border-gray-50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 ${
                        index % 2 === 0 ? "bg-white/30" : "bg-gray-50/30"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
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
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Users className="h-8 w-8" />
                        <span>Aucun contributeur trouvé.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 p-6">
            <div className="text-sm text-gray-600 font-medium">
              Affichage de{" "}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{" "}
              à{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}{" "}
              sur {table.getFilteredRowModel().rows.length} contributeurs
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="border-0 bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="border-0 bg-gray-100/80 hover:bg-gray-200/80 transition-colors"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
);

ContributorsTable.displayName = "ContributorsTable";
