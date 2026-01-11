"use client";

import { useState, useEffect } from "react";
import { Button } from "@tada/ui/components/button";
import { Badge } from "@tada/ui/components/badge";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tada/ui/components/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { AttributeManager } from "./attribute-manager";

// Types
interface Attribute {
  id: string;
  name: string;
  key: string;
  type: string;
  category: string;
  required: boolean;
  enrichmentOnly: boolean;
  active: boolean;
  _count?: {
    values: number;
  };
}

const TYPE_LABELS: Record<string, string> = {
  text: "Texte",
  number: "Nombre",
  select: "Liste",
  multiselect: "Multi-sélection",
  date: "Date",
  boolean: "Oui/Non",
  range: "Plage",
};

const CATEGORY_LABELS: Record<string, string> = {
  demographics: "Démographiques",
  profile: "Profil",
  professional: "Professionnel",
  interests: "Intérêts",
  technical: "Technique",
  availability: "Disponibilité",
};

const CATEGORY_COLORS: Record<string, string> = {
  demographics: "bg-blue-100 text-blue-800",
  profile: "bg-green-100 text-green-800",
  professional: "bg-purple-100 text-purple-800",
  interests: "bg-pink-100 text-pink-800",
  technical: "bg-orange-100 text-orange-800",
  availability: "bg-yellow-100 text-yellow-800",
};

interface AttributeListProps {
  initialAttributes?: Attribute[];
  onRefresh?: () => void;
  onAttributeUpdated?: (updatedAttribute: Attribute) => void;
  onAttributeDeleted?: (deletedId: string) => void;
}

export function AttributeList({ 
  initialAttributes = [], 
  onRefresh, 
  onAttributeUpdated, 
  onAttributeDeleted 
}: AttributeListProps) {
  const [attributes, setAttributes] = useState<Attribute[]>(initialAttributes);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les attributs depuis l'API
  const fetchAttributes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/audience-attributes");
      
      if (!response.ok) {
        throw new Error("Failed to fetch attributes");
      }
      
      const data = await response.json();
      setAttributes(data);
      // Notifier le parent pour mettre à jour les statistiques
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("Error fetching attributes:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les attributs au montage du composant
  useEffect(() => {
    if (initialAttributes.length > 0) {
      setAttributes(initialAttributes);
      setIsLoading(false);
    } else {
      fetchAttributes();
    }
  }, []);

  // Mettre à jour les attributs quand les props changent
  useEffect(() => {
    if (initialAttributes.length > 0) {
      setAttributes(initialAttributes);
      setIsLoading(false);
    }
  }, [initialAttributes]);

  const handleEdit = (attribute: any) => {
    setSelectedAttribute(attribute);
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (attribute: Attribute) => {
    setAttributeToDelete(attribute);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!attributeToDelete) return;
    
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/audience-attributes/${attributeToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete attribute");
      }

      // Mettre à jour le state local
      setAttributes(prevAttributes => prevAttributes.filter(attr => attr.id !== attributeToDelete.id));
      
      // Notifier le parent
      if (onAttributeDeleted) {
        onAttributeDeleted(attributeToDelete.id);
      }

      setIsDeleteDialogOpen(false);
      setAttributeToDelete(null);
    } catch (err) {
      console.error("Error deleting attribute:", err);
      alert(err instanceof Error ? err.message : "Failed to delete attribute");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Chargement des attributs...</p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!isLoading && !error && attributes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucun attribut configuré</p>
          <p className="text-sm text-muted-foreground mt-2">
            Cliquez sur "Nouvel attribut" pour créer votre premier attribut
          </p>
        </div>
      )}

      {!isLoading && !error && attributes.length > 0 && (
        <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Clé technique</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Utilisations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes.map((attribute) => (
              <TableRow key={attribute.id}>
                <TableCell className="font-medium">{attribute.name}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {attribute.key}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {TYPE_LABELS[attribute.type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={CATEGORY_COLORS[attribute.category]}
                    variant="secondary"
                  >
                    {CATEGORY_LABELS[attribute.category]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {attribute.required && (
                      <Badge variant="destructive" className="text-xs">
                        Obligatoire
                      </Badge>
                    )}
                    {attribute.enrichmentOnly && (
                      <Badge variant="secondary" className="text-xs">
                        Enrichissement
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-medium tabular-nums">
                      {(attribute._count?.values || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      contributeurs
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir le menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(attribute)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(attribute)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}

      {/* Modal d'édition */}
      <AttributeManager
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAttribute(null);
          // Recharger les attributs après fermeture du modal
          fetchAttributes();
        }}
        attribute={selectedAttribute || undefined}
      />

      {/* Dialog Suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Supprimer l'attribut
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement l'attribut{" "}
              <span className="font-semibold text-gray-900">
                {attributeToDelete?.name}
              </span>{" "}
              ? Cette action est irréversible et supprimera toutes les données associées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setAttributeToDelete(null);
              }}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
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
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AttributeList;
