"use client";

import React, { useState, useMemo } from "react";
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@tada/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
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
  Ban,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
  Shield,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  adminSubRole: string;
  kyc_status: string | null;
  image: string | null;
  location: string | null;
  job: string | null;
  position: string | null;
  country: string | null;
  sector: string | null;
  banned: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    members: number;
    missionAssignments: number;
    surveyResponses: number;
  };
}

const UserCell = React.memo(({ user }: { user: User }) => (
  <div className="flex items-center gap-4">
    <div className="relative">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
        {user.name.charAt(0).toUpperCase()}
      </div>
      {user.kyc_status === "completed" && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <CheckCircle className="h-2.5 w-2.5 text-white" />
        </div>
      )}
    </div>
    <div>
      <div className="font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-600 transition-colors">
        {user.name}
      </div>
      <div className="text-sm text-gray-500">{user.email}</div>
    </div>
  </div>
));

UserCell.displayName = "UserCell";

const RoleBadge = React.memo(({ role }: { role: string }) => {
  const roleConfig = {
    admin: { label: "Admin", color: "bg-purple-100 text-purple-800 border-purple-200" },
    client: { label: "Client", color: "bg-blue-100 text-blue-800 border-blue-200" },
    contributor: { label: "Contributeur", color: "bg-green-100 text-green-800 border-green-200" },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || {
    label: role,
    color: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <Badge className={`${config.color} border font-medium`}>
      {config.label}
    </Badge>
  );
});

RoleBadge.displayName = "RoleBadge";

const StatusBadge = React.memo(
  ({ banned, kycStatus }: { banned: boolean | null; kycStatus: string | null }) => {
    if (banned) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 border">
          <XCircle className="h-3 w-3 mr-1" />
          Banni
        </Badge>
      );
    }

    if (kycStatus === "completed") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 border">
          <CheckCircle className="h-3 w-3 mr-1" />
          Vérifié
        </Badge>
      );
    }

    if (kycStatus === "in_progress") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border">
          En cours
        </Badge>
      );
    }

    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200 border">
        Non vérifié
      </Badge>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export function UsersTable({ users }: { users: User[] }) {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100"
          >
            Utilisateur
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <UserCell user={row.original} />,
      },
      {
        accessorKey: "role",
        header: "Rôle",
        cell: ({ row }) => <RoleBadge role={row.original.adminSubRole} />,
        filterFn: (row, id, value) => {
          if (value === "all") return true;
          return row.getValue(id) === value;
        },
      },
      {
        id: "status",
        header: "Statut",
        cell: ({ row }) => (
          <StatusBadge
            banned={row.original.banned}
            kycStatus={row.original.kyc_status}
          />
        ),
      },
      {
        accessorKey: "position",
        header: "Poste",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original.position || "-"}
          </span>
        ),
      },
      {
        accessorKey: "country",
        header: "Pays",
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {row.original.country || "-"}
          </span>
        ),
      },
      {
        id: "stats",
        header: "Activité",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            <div>{row.original._count.missionAssignments} missions</div>
            <div className="text-xs text-gray-400">
              {row.original._count.surveyResponses} réponses
            </div>
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-gray-100"
          >
            Date création
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">
            {new Date(row.original.createdAt).toLocaleDateString("fr-FR")}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/users/${user.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir détails
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/users/edit/${user.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleToggleBan(user)}
                  className={user.banned ? "text-green-600" : "text-orange-600"}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {user.banned ? "Réactiver" : "Bannir"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setUserToDelete(user);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-red-600"
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
    []
  );

  const filteredData = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.adminSubRole === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "banned" && user.banned) ||
        (statusFilter === "verified" && user.kyc_status === "completed") ||
        (statusFilter === "active" && !user.banned);

      return matchesRole && matchesStatus;
    });
  }, [users, roleFilter, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleToggleBan = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !user.banned }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error toggling ban:", error);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600 dark:text-white" />
              Gestion des Utilisateurs
            </CardTitle>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 dark:bg-red-600 dark:text-white">
              <Link href="/users/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Nouvel utilisateur
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="super_admin">Super Administrateur</SelectItem>
                <SelectItem value="operations_admin">Administrateur des Opérations</SelectItem>
                <SelectItem value="customer_admin">Administrateur Client</SelectItem>
                <SelectItem value="content_moderator">Modérateur de Contenu</SelectItem>
                <SelectItem value="finance_admin">Administrateur Financier</SelectItem>
                <SelectItem value="auditor">Auditeur</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="verified">Vérifiés</SelectItem>
                <SelectItem value="banned">Bannis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-50/50 dark:bg-inherit">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="font-semibold">
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
                      Aucun utilisateur trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              {table.getFilteredRowModel().rows.length} utilisateur(s) au total
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

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
              <strong>{userToDelete?.name}</strong> ?
              <br />
              <br />
              Si l'utilisateur a des données associées (missions, réponses, etc.),
              il sera banni au lieu d'être supprimé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
