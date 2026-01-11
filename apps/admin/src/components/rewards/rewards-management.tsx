"use client";

import { useState } from "react";
import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Badge } from "@tada/ui/components/badge";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Gift, Loader2 } from "lucide-react";
import { Textarea } from "@tada/ui/components/textarea";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  type: string;
  trigger: string;
  value: number;
  status: string;
  _count?: {
    history: number;
  };
}

interface RewardsManagementProps {
  initialRewards: Reward[];
}

export function RewardsManagement({ initialRewards }: RewardsManagementProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [rewardToDelete, setRewardToDelete] = useState<Reward | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "credits",
    trigger: "registration",
    value: 100,
    status: "active",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Ajouter la nouvelle récompense au state local
        const newReward: Reward = {
          ...result.data,
          _count: {
            history: 0,
          },
        };
        
        setRewards(prevRewards => [newReward, ...prevRewards]);
        
        toast({
          title: "Récompense créée",
          description: `${result.data.name} a été créée avec succès.`,
        });
        setIsCreateOpen(false);
        setFormData({
          name: "",
          description: "",
          type: "credits",
          trigger: "registration",
          value: 100,
          status: "active",
        });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de créer la récompense",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (reward: Reward) => {
    setSelectedReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description || "",
      type: reward.type,
      trigger: reward.trigger,
      value: reward.value,
      status: reward.status,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReward) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/rewards/${selectedReward.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Mettre à jour la récompense dans le state local
        const updatedReward: Reward = {
          ...result.data,
          _count: selectedReward?._count || { history: 0 },
        };
        
        setRewards(prevRewards => 
          prevRewards.map(reward => 
            reward.id === selectedReward?.id ? updatedReward : reward
          )
        );
        
        toast({
          title: "Récompense modifiée",
          description: "La récompense a été modifiée avec succès.",
        });
        setIsEditOpen(false);
        setSelectedReward(null);
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de modifier la récompense",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (reward: Reward) => {
    setRewardToDelete(reward);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!rewardToDelete) return;
    
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/rewards/${rewardToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Supprimer la récompense du state local
        setRewards(prevRewards => prevRewards.filter(reward => reward.id !== rewardToDelete.id));
        
        toast({
          title: "Récompense supprimée",
          description: "La récompense a été supprimée avec succès.",
        });
        setIsDeleteDialogOpen(false);
        setRewardToDelete(null);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la récompense",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      credits: "bg-blue-100 text-blue-800",
      badge: "bg-purple-100 text-purple-800",
      bonus: "bg-green-100 text-green-800",
      discount: "bg-orange-100 text-orange-800",
    };
    return <Badge className={colors[type as keyof typeof colors]}>{type}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      expired: "bg-red-100 text-red-800",
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="h-6 w-6 text-purple-600" />
            Gestion des Récompenses
          </h1>
          <p className="text-gray-500 mt-1">
            Configurez les récompenses de bienvenue et les bonus
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle récompense
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Déclencheur</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Attributions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  Aucune récompense configurée
                </TableCell>
              </TableRow>
            ) : (
              rewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reward.name}</div>
                      {reward.description && (
                        <div className="text-sm text-gray-500">{reward.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(reward.type)}</TableCell>
                  <TableCell className="text-sm">{reward.trigger}</TableCell>
                  <TableCell className="font-medium">{reward.value}</TableCell>
                  <TableCell>{getStatusBadge(reward.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{reward._count?.history || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(reward)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(reward)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Création */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer une récompense</DialogTitle>
            <DialogDescription>
              Configurez une nouvelle récompense de bienvenue ou bonus
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Bonus de bienvenue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description optionnelle"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credits">Crédits</SelectItem>
                    <SelectItem value="badge">Badge</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="discount">Réduction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">
                  Valeur <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trigger">
                  Déclencheur <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.trigger}
                  onValueChange={(value) =>
                    setFormData({ ...formData, trigger: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registration">Inscription</SelectItem>
                    <SelectItem value="first_mission">Première mission</SelectItem>
                    <SelectItem value="mission_complete">Mission complétée</SelectItem>
                    <SelectItem value="referral">Parrainage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="expired">Expiré</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Édition */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier la récompense</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-value">Valeur</Label>
                <Input
                  id="edit-value"
                  type="number"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: parseInt(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="expired">Expiré</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Modification..." : "Modifier"}
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
              Supprimer la récompense
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement la récompense{" "}
              <span className="font-semibold text-gray-900">
                {rewardToDelete?.name}
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
                setRewardToDelete(null);
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
    </div>
  );
}
