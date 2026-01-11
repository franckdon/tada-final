"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@tada/ui/components/badge";
import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
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
  UserPlus,
  MoreHorizontal,
  Edit,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Users,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RoleBadge } from "@/components/users/role-badge";
import { RoleSelector } from "@/components/users/role-selector";
import { AdminSubRoleSelector } from "@/components/users/admin-subrole-selector";
import { USER_ROLES, type UserRole, type AdminSubRole } from "@/lib/rbac/roles";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  adminSubRole?: AdminSubRole | null;
  position?: string;
  country?: string;
  sector?: string;
  image?: string;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  label: string;
}

function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors relative ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto h-24 w-24 rounded-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={() => handleFileChange(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              Glissez-déposez une image ici ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files[0]) {
              handleFileChange(files[0]);
            }
          }}
        />
      </div>
    </div>
  );
}

export function UsersManagement({ initialUsers }: { initialUsers: User[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: USER_ROLES.CONTRIBUTOR as UserRole,
    adminSubRole: null as AdminSubRole | null,
    position: "",
    country: "",
    sector: "",
    job: "",
    location: "",
    image: "",
    kyc_status: "none",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Préparer les données en convertissant "none" en null et en nettoyant les champs vides
      const dataToSend = Object.fromEntries(
        Object.entries(formData)
          .map(([key, value]) => [key, value === "none" ? null : value])
          .filter(([key, value]) => {
            // Toujours garder les champs requis
            if (["email", "name", "role"].includes(key)) return true;
            // Filtrer les valeurs vides pour les autres champs
            return value !== "" && value !== null;
          })
      );

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok) {
        // Ajouter le nouvel utilisateur au state local pour une mise à jour immédiate
        const newUser: User = {
          ...result.data,
          _count: {
            members: 0,
            missionAssignments: 0,
            surveyResponses: 0,
          },
        };
        
        // Mettre à jour la liste des utilisateurs en ajoutant le nouveau en premier
        setUsers(prevUsers => [newUser, ...prevUsers]);
        
        toast({
          title: "Utilisateur créé",
          description: `${result.data.name} a été créé avec succès.`,
        });
        setIsCreateDialogOpen(false);
        setFormData({
          email: "",
          name: "",
          role: USER_ROLES.CONTRIBUTOR,
          adminSubRole: null,
          position: "",
          country: "",
          sector: "",
          job: "",
          location: "",
          image: "",
          kyc_status: "none",
        });
        // Pas besoin de router.refresh() car on met à jour le state local
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);

    try {
      // Préparer les données en convertissant "none" en null et en nettoyant les champs vides
      const dataToSend = Object.fromEntries(
        Object.entries(formData)
          .map(([key, value]) => [key, value === "none" ? null : value])
          .filter(([key, value]) => {
            // Pour la mise à jour, on peut envoyer des valeurs vides sauf null
            return value !== null;
          })
      );

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok) {
        // Mettre à jour l'utilisateur dans le state local
        const updatedUser: User = {
          ...result.data,
          _count: selectedUser?._count || {
            members: 0,
            missionAssignments: 0,
            surveyResponses: 0,
          },
        };
        
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUser?.id ? updatedUser : user
          )
        );
        
        toast({
          title: "Utilisateur mis à jour",
          description: `${result.data.name} a été mis à jour avec succès.`,
        });
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        // Pas besoin de router.refresh() car on met à jour le state local
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBan = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !user.banned }),
      });

      if (response.ok) {
        // Mettre à jour le statut de l'utilisateur dans le state local
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === user.id ? { ...u, banned: !user.banned } : u
          )
        );
        
        toast({
          title: user.banned ? "Utilisateur débanni" : "Utilisateur banni",
          description: `${user.name} a été ${user.banned ? "débanni" : "banni"} avec succès.`,
        });
        // Pas besoin de router.refresh() car on met à jour le state local
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        if (result.warning) {
          // L'utilisateur a été banni au lieu d'être supprimé
          setUsers(prevUsers => 
            prevUsers.map(u => 
              u.id === userToDelete.id ? { ...u, banned: true } : u
            )
          );
          
          toast({
            title: "Utilisateur banni",
            description: `${userToDelete.name} a des données associées et a été banni au lieu d'être supprimé.`,
            variant: "default",
          });
        } else {
          // Suppression réelle
          setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
          
          toast({
            title: "Utilisateur supprimé",
            description: `${userToDelete.name} a été supprimé avec succès.`,
          });
        }
        
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de supprimer l'utilisateur",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      adminSubRole: user.adminSubRole || null,
      position: user.position || "",
      country: user.country || "",
      sector: "",
      job: "",
      location: "",
      image: user.image || "",
      kyc_status: user.kyc_status || "none",
    });
    setImageFile(null); // Réinitialiser le fichier image
    setIsEditDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setImageFile(null); // Réinitialiser le fichier image
    setFormData({
      email: "",
      name: "",
      role: USER_ROLES.CONTRIBUTOR as UserRole,
      adminSubRole: null,
      position: "",
      country: "",
      sector: "",
      job: "",
      location: "",
      image: "",
      kyc_status: "none",
    });
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setImageFile(null); // Réinitialiser le fichier image
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Role badge is now handled by RoleBadge component

  return (
    <div className="p-5 bg-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Gestion des Utilisateurs
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Créez et gérez tous les utilisateurs de la plateforme
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value={USER_ROLES.SYSTEM_ADMIN}>Administrateurs Système</SelectItem>
            <SelectItem value={USER_ROLES.CLIENT_ADMIN}>Administrateurs Client</SelectItem>
            <SelectItem value={USER_ROLES.CONTRIBUTOR}>Contributeurs</SelectItem>
            <SelectItem value={USER_ROLES.VALIDATOR}>Validateurs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tableau */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Pays</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role as UserRole} size="sm" />
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {user.position || "-"}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {user.country || "-"}
                </TableCell>
                <TableCell>
                  {user.banned ? (
                    <Badge className="bg-red-100 text-red-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Banni
                    </Badge>
                  ) : user.kyc_status === "completed" ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Vérifié
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">Actif</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleBan(user)}>
                        <Ban className="mr-2 h-4 w-4" />
                        {user.banned ? "Débannir" : "Bannir"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(user)}
                        className="text-red-600"
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

      {/* Dialog Création */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer un nouveau compte utilisateur.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="">
                <ImageUpload
                  value={formData.image}
                  onChange={(file) => setImageFile(file)}
                  label="Photo de profil"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle *</Label>
                  <RoleSelector
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value, adminSubRole: null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Poste</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                  />
                </div>
              </div>
              {formData.role === USER_ROLES.SYSTEM_ADMIN && (
                <div className="mt-4">
                  <AdminSubRoleSelector
                    value={formData.adminSubRole}
                    onChange={(value) =>
                      setFormData({ ...formData, adminSubRole: value })
                    }
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job">Métier</Label>
                  <Input
                    id="job"
                    value={formData.job}
                    onChange={(e) =>
                      setFormData({ ...formData, job: e.target.value })
                    }
                    placeholder="Ex: Développeur, Designer..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Secteur d'activité</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) =>
                      setFormData({ ...formData, sector: e.target.value })
                    }
                    placeholder="Ex: Technologie, Finance..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    placeholder="Ex: France, Cameroun..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ville</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Ex: Paris, Douala..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kyc_status">Statut KYC</Label>
                  <Select
                    value={formData.kyc_status || "none"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, kyc_status: value === "none" ? "" : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Non défini</SelectItem>
                      <SelectItem value="in_progress" aria-selected>En cours</SelectItem>
                      <SelectItem value="completed">Complété</SelectItem>
                      <SelectItem value="canceled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeCreateDialog}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer l'utilisateur"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser}>
            <div className="grid gap-4 py-4">
              <div className="">
                <ImageUpload
                  value={formData.image}
                  onChange={(file) => setImageFile(file)}
                  label="Photo de profil"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom complet *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rôle *</Label>
                  <RoleSelector
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value, adminSubRole: null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-position">Poste</Label>
                  <Input
                    id="edit-position"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                  />
                </div>
              </div>
              {formData.role === USER_ROLES.SYSTEM_ADMIN && (
                <div className="mt-4">
                  <AdminSubRoleSelector
                    value={formData.adminSubRole}
                    onChange={(value) =>
                      setFormData({ ...formData, adminSubRole: value })
                    }
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-job">Métier</Label>
                  <Input
                    id="edit-job"
                    value={formData.job}
                    onChange={(e) =>
                      setFormData({ ...formData, job: e.target.value })
                    }
                    placeholder="Ex: Développeur, Designer..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sector">Secteur d'activité</Label>
                  <Input
                    id="edit-sector"
                    value={formData.sector}
                    onChange={(e) =>
                      setFormData({ ...formData, sector: e.target.value })
                    }
                    placeholder="Ex: Technologie, Finance..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-country">Pays</Label>
                  <Input
                    id="edit-country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    placeholder="Ex: France, Cameroun..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Ville</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Ex: Paris, Douala..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-kyc_status">Statut KYC</Label>
                  <Select
                    value={formData.kyc_status || "none"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, kyc_status: value === "none" ? "" : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Non défini</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="completed">Complété</SelectItem>
                      <SelectItem value="canceled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeEditDialog}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Supprimer l'utilisateur
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="font-semibold text-gray-900">
                {userToDelete?.name}
              </span>{" "}
              ?
              <br />
              <span className="text-sm text-amber-600 mt-2 block">
                ⚠️ Si cet utilisateur a des données associées (missions, réponses, etc.), 
                il sera banni au lieu d'être supprimé définitivement.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setUserToDelete(null);
              }}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
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
    </div>
  );
}
