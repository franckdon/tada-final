"use client";

import { useState, useEffect } from "react";
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
import { Loader2, UserPlus, Search } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@tada/ui/components/radio-group";

interface MembersManagerProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName: string;
  onSuccess?: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  position?: string | null;
}

export function MembersManager({
  isOpen,
  onClose,
  organizationId,
  organizationName,
  onSuccess,
}: MembersManagerProps) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState("admin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Données pour créer un nouvel utilisateur
  const [newUserData, setNewUserData] = useState({
    email: "",
    name: "",
    position: "",
  });

  // Rechercher des utilisateurs existants
  useEffect(() => {
    if (mode === "existing" && searchTerm.length >= 2) {
      const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const response = await fetch(`/api/users?search=${searchTerm}&limit=10`);
          if (response.ok) {
            const result = await response.json();
            setUsers(result.data || []);
          }
        } catch (err) {
          console.error("Error fetching users:", err);
        } finally {
          setIsLoadingUsers(false);
        }
      };

      const debounce = setTimeout(fetchUsers, 300);
      return () => clearTimeout(debounce);
    } else {
      setUsers([]);
    }
  }, [searchTerm, mode]);

  // Réinitialiser le formulaire
  useEffect(() => {
    if (isOpen) {
      setMode("existing");
      setSearchTerm("");
      setUsers([]);
      setSelectedUserId("");
      setRole("admin");
      setNewUserData({ email: "", name: "", position: "" });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = mode === "existing"
        ? { userId: selectedUserId, role }
        : { ...newUserData, role };

      const response = await fetch(`/api/organizations/${organizationId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add member");
      }

      // Succès
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error("Error adding member:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Ajouter un membre
          </DialogTitle>
          <DialogDescription>
            Ajouter un membre à <strong>{organizationName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mode de sélection */}
          <div className="space-y-3">
            <Label>Mode d'ajout</Label>
            <RadioGroup value={mode} onValueChange={(value) => setMode(value as "existing" | "new")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing" className="font-normal cursor-pointer">
                  Utilisateur existant
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="font-normal cursor-pointer">
                  Nouvel utilisateur
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Mode: Utilisateur existant */}
          {mode === "existing" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="search">
                  Rechercher un utilisateur <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nom ou email..."
                    className="pl-10"
                  />
                </div>
                {isLoadingUsers && (
                  <p className="text-xs text-gray-500 mt-1">Recherche...</p>
                )}
              </div>

              {users.length > 0 && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                        selectedUserId === user.id ? "bg-blue-50 border-blue-200" : ""
                      }`}
                    >
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {user.position && (
                        <p className="text-xs text-gray-400">{user.position}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {searchTerm.length >= 2 && users.length === 0 && !isLoadingUsers && (
                <p className="text-sm text-gray-500">Aucun utilisateur trouvé</p>
              )}
            </div>
          )}

          {/* Mode: Nouvel utilisateur */}
          {mode === "new" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, email: e.target.value })
                  }
                  placeholder="utilisateur@entreprise.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="name">
                  Nom complet <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={newUserData.name}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, name: e.target.value })
                  }
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <div>
                <Label htmlFor="position">Poste</Label>
                <Input
                  id="position"
                  value={newUserData.position}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, position: e.target.value })
                  }
                  placeholder="Directeur Marketing"
                />
              </div>
            </div>
          )}

          {/* Rôle dans l'organisation */}
          <div>
            <Label htmlFor="role">
              Rôle dans l'organisation <span className="text-red-500">*</span>
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Propriétaire (Owner)</SelectItem>
                <SelectItem value="admin">Administrateur (Admin)</SelectItem>
                <SelectItem value="member">Membre (Member)</SelectItem>
                <SelectItem value="viewer">Lecteur (Viewer)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {role === "owner" && "Accès complet et gestion de l'organisation"}
              {role === "admin" && "Peut gérer les projets et les membres"}
              {role === "member" && "Peut créer et gérer ses propres projets"}
              {role === "viewer" && "Lecture seule"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                (mode === "existing" && !selectedUserId) ||
                (mode === "new" && (!newUserData.email || !newUserData.name))
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout...
                </>
              ) : (
                "Ajouter le membre"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
