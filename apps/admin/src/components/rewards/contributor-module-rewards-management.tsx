"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";

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
import { Badge } from "@tada/ui/components/badge";
import { useToast } from "@/hooks/use-toast";

import type { ContributorModuleRewardConfigRow } from "@/types/contributor-rewards";
import {
  ModuleKey,
  MODULES,
  ORDERED_MODULE_KEYS,
} from "@/lib/contributor-modules-config";

type FormState = {
  moduleKey: ModuleKey | "";
  moduleLabel: string;
  order: number;
  dependsOn: ModuleKey | "";
  rewardXof: number;
  isActive: boolean;
};

function toNumber(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function ContributorModuleRewardsManagement({
  initialModules,
}: {
  initialModules: ContributorModuleRewardConfigRow[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [modules, setModules] =
    useState<ContributorModuleRewardConfigRow[]>(initialModules);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selected, setSelected] =
    useState<ContributorModuleRewardConfigRow | null>(null);
  const [toDelete, setToDelete] =
    useState<ContributorModuleRewardConfigRow | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState<FormState>({
    moduleKey: "",
    moduleLabel: "",
    order: 1,
    dependsOn: "",
    rewardXof: 0,
    isActive: true,
  });

  const usedKeys = useMemo(
    () => new Set(modules.map((m) => m.moduleKey)),
    [modules],
  );

  const availableKeys = useMemo(
    () => ORDERED_MODULE_KEYS.filter((k) => !usedKeys.has(k)),
    [usedKeys],
  );

  function applyModuleDefaults(key: ModuleKey) {
    const cfg = MODULES[key];
    setForm((p) => ({
      ...p,
      moduleKey: key,
      moduleLabel: cfg.label,
      order: cfg.defaultOrder,
      dependsOn: (cfg.defaultDependsOn ?? "") as any,
    }));
  }

  function openCreate() {
    setForm({
      moduleKey: "",
      moduleLabel: "",
      order: 1,
      dependsOn: "",
      rewardXof: 0,
      isActive: true,
    });
    setIsCreateOpen(true);
  }

  function openEdit(row: ContributorModuleRewardConfigRow) {
    setSelected(row);
    setForm({
      moduleKey: row.moduleKey as any,
      moduleLabel: row.moduleLabel,
      order: row.order,
      dependsOn: (row.dependsOn ?? "") as any,
      rewardXof: row.rewardXof,
      isActive: row.isActive,
    });
    setIsEditOpen(true);
  }

  function openDelete(row: ContributorModuleRewardConfigRow) {
    setToDelete(row);
    setIsDeleteOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!form.moduleKey) {
      toast({
        title: "Erreur",
        description: "Choisis un module",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contributors/module-rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleKey: form.moduleKey,
          moduleLabel: form.moduleLabel,
          order: Number(form.order),
          dependsOn: form.dependsOn ? form.dependsOn : null,
          rewardXof: Math.max(0, Number(form.rewardXof) || 0),
          isActive: !!form.isActive,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Impossible de créer");
      }

      setModules((prev) => {
        const next = [json.data, ...prev];
        next.sort((a, b) => a.order - b.order);
        return next;
      });

      toast({ title: "OK", description: "Configuration créée." });
      setIsCreateOpen(false);
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message ?? "Erreur",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/contributors/module-rewards/${selected.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleLabel: form.moduleLabel,
            order: Number(form.order),
            dependsOn: form.dependsOn ? form.dependsOn : null,
            rewardXof: Math.max(0, Number(form.rewardXof) || 0),
            isActive: !!form.isActive,
          }),
        },
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Impossible de modifier");
      }

      setModules((prev) => {
        const next = prev.map((m) => (m.id === selected.id ? json.data : m));
        next.sort((a, b) => a.order - b.order);
        return next;
      });

      toast({ title: "OK", description: "Configuration mise à jour." });
      setIsEditOpen(false);
      setSelected(null);
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message ?? "Erreur",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/contributors/module-rewards/${toDelete.id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) throw new Error("Impossible de supprimer");

      setModules((prev) => prev.filter((m) => m.id !== toDelete.id));
      toast({ title: "OK", description: "Configuration supprimée." });

      setIsDeleteOpen(false);
      setToDelete(null);
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message ?? "Erreur",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Récompenses modules contributeurs
          </h1>
          <p className="text-gray-500 mt-1">
            Configure les montants (XOF), l’ordre et les dépendances.
          </p>
        </div>

        <Button onClick={openCreate} disabled={availableKeys.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Module</TableHead>
              <TableHead>Ordre</TableHead>
              <TableHead>Dépend de</TableHead>
              <TableHead>Montant (XOF)</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {modules.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-gray-500 py-8"
                >
                  Aucune configuration
                </TableCell>
              </TableRow>
            ) : (
              modules.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="font-medium">{m.moduleLabel}</div>
                    <div className="text-xs text-gray-500">{m.moduleKey}</div>
                  </TableCell>
                  <TableCell>{m.order}</TableCell>
                  <TableCell className="text-sm">
                    {m.dependsOn ? (
                      <span>{m.dependsOn}</span>
                    ) : (
                      <span className="text-gray-400">Aucune</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{m.rewardXof}</TableCell>
                  <TableCell>
                    {m.isActive ? (
                      <Badge className="bg-green-100 text-green-800">
                        Actif
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        Inactif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(m)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDelete(m)}
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

      {/* CREATE */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter une configuration</DialogTitle>
            <DialogDescription>
              Choisis un module puis ajuste rang, dépendance et montant.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="space-y-2">
              <Label>Module (moduleKey)</Label>
              <Select
                value={form.moduleKey || "none"}
                onValueChange={(v) => {
                  if (v === "none") {
                    setForm((p) => ({
                      ...p,
                      moduleKey: "",
                      moduleLabel: "",
                      order: 1,
                      dependsOn: "",
                    }));
                    return;
                  }
                  applyModuleDefaults(v as ModuleKey);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un module..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Choisir…</SelectItem>
                  {availableKeys.map((k) => (
                    <SelectItem key={k} value={k}>
                      {MODULES[k].label} ({k})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Libellé</Label>
              <Input
                value={form.moduleLabel}
                onChange={(e) =>
                  setForm((p) => ({ ...p, moduleLabel: e.target.value }))
                }
                placeholder="Ex: Données de Localisation"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ordre</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.order}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, order: toNumber(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Dépend de</Label>
                <Select
                  value={form.dependsOn || "none"}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      dependsOn: v === "none" ? "" : (v as any),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucune" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {ORDERED_MODULE_KEYS.filter(
                      (k) => k !== form.moduleKey,
                    ).map((k) => (
                      <SelectItem key={k} value={k}>
                        {MODULES[k].label} ({k})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Récompense (XOF)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.rewardXof}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      rewardXof: toNumber(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={form.isActive ? "active" : "inactive"}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, isActive: v === "active" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
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

      {/* EDIT */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier la configuration</DialogTitle>
            <DialogDescription>Le moduleKey ne change pas.</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleUpdate}>
            <div className="space-y-2">
              <Label>Module (moduleKey)</Label>
              <Select
                value={form.moduleKey || "none"}
                onValueChange={() => {}}
                disabled
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDERED_MODULE_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {MODULES[k].label} ({k})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Libellé</Label>
              <Input
                value={form.moduleLabel}
                onChange={(e) =>
                  setForm((p) => ({ ...p, moduleLabel: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ordre</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.order}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, order: toNumber(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Dépend de</Label>
                <Select
                  value={form.dependsOn || "none"}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      dependsOn: v === "none" ? "" : (v as any),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {ORDERED_MODULE_KEYS.filter(
                      (k) => k !== form.moduleKey,
                    ).map((k) => (
                      <SelectItem key={k} value={k}>
                        {MODULES[k].label} ({k})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Récompense (XOF)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.rewardXof}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      rewardXof: toNumber(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={form.isActive ? "active" : "inactive"}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, isActive: v === "active" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
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
                {isSubmitting ? "Sauvegarde..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Supprimer</DialogTitle>
            <DialogDescription>
              Supprimer définitivement la configuration :
              <span className="font-semibold"> {toDelete?.moduleLabel}</span> ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setToDelete(null);
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
