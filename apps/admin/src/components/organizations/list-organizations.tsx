"use client";
import { useI18n } from "@/locales/client";
import { Badge } from "@tada/ui/components/badge";
import { Button as UIButton } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
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
import { cn } from "@tada/ui/lib/utils";
import {
  type Row,
  type RowData,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowLeft, ArrowRight, EyeIcon, MoreHorizontal, Edit, Trash2, Building2, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import type { Organization } from "./type";
import { OrganizationManager } from "./organization-manager";
import { useToast } from "@/hooks/use-toast";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    align: string;
  }
}

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

type OrganizationWithMissions = Organization & { 
  missions: number;
  _count?: {
    members: number;
    missions: number;
    projects: number;
  };
};

export function ListOrganizations({
  organizations: initialOrganizations,
}: {
  organizations: OrganizationWithMissions[];
}) {
  const t = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const pageSize = 8;
  
  const [organizations, setOrganizations] = useState<OrganizationWithMissions[]>(initialOrganizations);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationWithMissions | null>(null);
  const [organizationToDelete, setOrganizationToDelete] = useState<OrganizationWithMissions | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (org: OrganizationWithMissions) => {
    setSelectedOrganization(org);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (org: OrganizationWithMissions) => {
    setOrganizationToDelete(org);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!organizationToDelete) return;
    
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/organizations/${organizationToDelete.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        // Supprimer l'organisation du state local
        setOrganizations(prevOrganizations => 
          prevOrganizations.filter(org => org.id !== organizationToDelete.id)
        );
        
        toast({
          title: "Organisation supprimée",
          description: `${organizationToDelete.name} a été supprimée avec succès.`,
        });
        setIsDeleteDialogOpen(false);
        setOrganizationToDelete(null);
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de supprimer l'organisation",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'organisation",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccess = (organization?: OrganizationWithMissions, isEdit = false) => {
    if (organization) {
      if (isEdit) {
        // Mettre à jour l'organisation dans le state local
        setOrganizations(prevOrganizations => 
          prevOrganizations.map(org => 
            org.id === organization.id ? organization : org
          )
        );
      } else {
        // Ajouter la nouvelle organisation en haut de la liste
        setOrganizations(prevOrganizations => [organization, ...prevOrganizations]);
      }
    }
  };

  const workspacesColumns = [
    {
      header: "Organisation",
      accessorKey: "name",
      meta: {
        align: "text-left",
      },
      cell: ({ row }: { row: Row<OrganizationWithMissions> }) => {
        const org = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {org.logo ? (
                <img 
                  src={org.logo} 
                  alt={org.name || 'Logo organisation'}
                  className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-orange-100 border-2 border-orange-200 flex items-center justify-center">
                  <span className="text-lg font-bold text-orange-600">
                    {org.name ? org.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate">{org.name || 'Sans nom'}</div>
              <div className="text-sm text-gray-500 truncate">{org.slug || 'sans-slug'}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Secteur & Pays",
      accessorKey: "sector",
      meta: {
        align: "text-left",
      },
      cell: ({ row }: { row: Row<OrganizationWithMissions> }) => {
        const org = row.original;
        return (
          <div className="space-y-1">
            {org.sector && (
              <Badge variant="secondary" className="text-xs">
                {org.sector}
              </Badge>
            )}
            {org.country && (
              <div className="text-sm text-gray-600">{org.country}</div>
            )}
          </div>
        );
      },
    },
    {
      header: "Statut",
      accessorKey: "status",
      meta: {
        align: "text-left",
      },
      cell: ({ row }: { row: Row<OrganizationWithMissions> }) => {
        const status = row.original.status;
        const statusColors = {
          active: "bg-green-100 text-green-800",
          inactive: "bg-gray-100 text-gray-800", 
          suspended: "bg-red-100 text-red-800",
        };
        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.inactive}>
            {status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : 'Suspendu'}
          </Badge>
        );
      },
    },
    {
      header: "Missions",
      accessorKey: "missions",
      meta: {
        align: "text-center",
      },
      cell: ({ row }: { row: Row<OrganizationWithMissions> }) => {
        return (
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {row.original._count?.missions || 0}
            </div>
            <div className="text-xs text-gray-500">missions</div>
          </div>
        );
      },
    },
    {
      header: "Membres",
      accessorKey: "members",
      meta: {
        align: "text-center",
      },
      cell: ({ row }: { row: Row<OrganizationWithMissions> }) => {
        return (
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {row.original._count?.members || 0}
            </div>
            <div className="text-xs text-gray-500">membres</div>
          </div>
        );
      },
    },
    {
      header: "",
      accessorKey: "actions",
      meta: {
        align: "text-right",
      },
      cell: ({ row }: { row: Row<OrganizationWithMissions> }) => {
        return (
          <div className="flex items-center justify-end gap-2">
            <Link href={`/organizations/${row.original.id}`}>
              <UIButton variant="ghost" size="sm">
                <EyeIcon className="h-4 w-4" />
              </UIButton>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <UIButton variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </UIButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openDeleteDialog(row.original)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable<OrganizationWithMissions>({
    data: organizations,
    columns: workspacesColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: pageSize,
      },
    },
  });

  return (
    <>
      <div className="w-full rounded-lg border border-gray-100 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-orange-600" />
              {t("organizations.list.title")}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Gérez les organisations et leurs membres
            </p>
          </div>
          <UIButton onClick={() => setIsCreateDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle organisation
          </UIButton>
        </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
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

        {/* <TableHeader>
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
        </TableHeader> */}
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-900">Aucune organisation</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Commencez par créer votre première organisation pour gérer vos équipes et projets.
                    </p>
                  </div>
                  <UIButton 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une organisation
                  </UIButton>
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
      <div className="mt-10 flex items-center justify-between">
        <p className="text-sm tabular-nums text-gray-500 dark:text-gray-500">
          {t("contributors.list.pagination.page")}{" "}
          <span className="font-medium text-gray-900 dark:text-gray-50">{`${
            table.getState().pagination.pageIndex + 1
          }`}</span>{" "}
          {t("contributors.list.pagination.of")}
          <span className="font-medium text-gray-900 dark:text-gray-50">
            {" "}
            {`${table.getPageCount()}`}
          </span>
        </p>
        <div className="inline-flex items-center rounded-full shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-800">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">
              {t("contributors.list.pagination.previous")}
            </span>
            <ArrowLeft
              className="size-5 text-gray-700 group-hover:text-gray-900 dark:text-gray-300 group-hover:dark:text-gray-50"
              aria-hidden={true}
            />
          </Button>
          <span
            className="h-5 border-r border-gray-300 dark:border-gray-800"
            aria-hidden={true}
          />
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">
              {t("contributors.list.pagination.next")}
            </span>
            <ArrowRight
              className="size-5 text-gray-700 group-hover:text-gray-900 dark:text-gray-300 group-hover:dark:text-gray-50"
              aria-hidden={true}
            />
          </Button>
        </div>
      </div>
    </div>

    <OrganizationManager
      isOpen={isCreateDialogOpen}
      onClose={() => setIsCreateDialogOpen(false)}
      onSuccess={handleSuccess}
    />

    <OrganizationManager
      isOpen={isEditDialogOpen}
      onClose={() => {
        setIsEditDialogOpen(false);
        setSelectedOrganization(null);
      }}
      organization={selectedOrganization || undefined}
      onSuccess={(org) => handleSuccess(org, true)}
    />

    {/* Dialog Suppression */}
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Supprimer l'organisation
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer définitivement l'organisation{" "}
            <span className="font-semibold text-gray-900">
              {organizationToDelete?.name}
            </span>{" "}
            ? Cette action est irréversible et supprimera toutes les données associées.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <UIButton
            type="button"
            variant="outline"
            onClick={() => {
              setIsDeleteDialogOpen(false);
              setOrganizationToDelete(null);
            }}
            disabled={isDeleting}
          >
            Annuler
          </UIButton>
          <UIButton
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </>
            )}
          </UIButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
