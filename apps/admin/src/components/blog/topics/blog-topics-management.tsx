"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import { Switch } from "@tada/ui/components/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@tada/ui/components/dialog";
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
import { Plus, Edit, Trash2, Loader2, Tags } from "lucide-react";

type Topic = {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  order: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: { posts: number };
};

interface Props {
  initialTopics: Topic[];
}

function normalizeKey(v: string) {
  return v
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function BlogTopicsManagement({ initialTopics }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [topics, setTopics] = useState<Topic[]>(initialTopics);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selected, setSelected] = useState<Topic | null>(null);
  const [toDelete, setToDelete] = useState<Topic | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    key: "",
    label: "",
    order: 0,
    isActive: true,
  });

  const usedKeys = useMemo(() => new Set(topics.map((t) => t.key)), [topics]);

  const resetForm = () =>
    setForm({
      key: "",
      label: "",
      order: 0,
      isActive: true,
    });

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = (t: Topic) => {
    setSelected(t);
    setForm({
      key: t.key,
      label: t.label,
      order: t.order ?? 0,
      isActive: !!t.isActive,
    });
    setIsEditOpen(true);
  };

  const openDelete = (t: Topic) => {
    setToDelete(t);
    setIsDeleteOpen(true);
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        key: normalizeKey(form.key),
        label: form.label.trim(),
      };

      const res = await fetch("/api/blog/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json?.error || "Impossible de créer le topic");

      setTopics((prev) =>
        [json.data, ...prev].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      );

      toast({
        title: "Topic créé",
        description: `${json.data.label} a été créé.`,
      });
      setIsCreateOpen(false);
      resetForm();
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message || "Une erreur est survenue",
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
      const payload = {
        label: form.label.trim(),
        order: Number(form.order || 0),
        isActive: !!form.isActive,
        // clé éditable si tu veux; sinon commente la ligne suivante
        key: normalizeKey(form.key),
      };

      const res = await fetch(`/api/blog/topics/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json?.error || "Impossible de modifier le topic");

      setTopics((prev) =>
        prev
          .map((t) => (t.id === selected.id ? { ...t, ...json.data } : t))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      );

      toast({
        title: "Topic modifié",
        description: "Modifications enregistrées.",
      });
      setIsEditOpen(false);
      setSelected(null);
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message || "Une erreur est survenue",
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
      const res = await fetch(`/api/blog/topics/${toDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json?.error || "Impossible de supprimer le topic");

      setTopics((prev) => prev.filter((t) => t.id !== toDelete.id));
      toast({
        title: "Topic supprimé",
        description: "Les articles liés ont été détachés (topic = null).",
      });

      setIsDeleteOpen(false);
      setToDelete(null);
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const createDisabled =
    !form.label.trim() ||
    !normalizeKey(form.key) ||
    usedKeys.has(normalizeKey(form.key));

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tags className="h-6 w-6 text-blue-600" />
            Topics du Blog
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez les catégories du blog (topic uniquement).
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau topic
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Label</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Ordre</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {topics.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-gray-500 py-8"
                >
                  Aucun topic
                </TableCell>
              </TableRow>
            ) : (
              topics.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.label}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {t.key}
                  </TableCell>
                  <TableCell>{t.order}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        t.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {t.isActive ? "active" : "inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{t._count?.posts ?? 0}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(t)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDelete(t)}
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
            <DialogTitle>Créer un topic</DialogTitle>
            <DialogDescription>
              Ex: Fundamentals, Indicators, Technical analysis…
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input
                value={form.label}
                onChange={(e) =>
                  setForm((p) => ({ ...p, label: e.target.value }))
                }
                placeholder="Ex: Fundamentals"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Key *</Label>
              <Input
                value={form.key}
                onChange={(e) =>
                  setForm((p) => ({ ...p, key: e.target.value }))
                }
                placeholder="Ex: fundamentals"
                required
              />
              <div className="text-xs text-gray-500">
                Normalisé:{" "}
                <span className="font-mono">
                  {normalizeKey(form.key) || "—"}
                </span>
                {normalizeKey(form.key) &&
                usedKeys.has(normalizeKey(form.key)) ? (
                  <span className="text-red-600"> (déjà utilisé)</span>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ordre</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      order: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Actif</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) =>
                      setForm((p) => ({ ...p, isActive: v }))
                    }
                  />
                  <span className="text-sm text-gray-600">
                    {form.isActive ? "Oui" : "Non"}
                  </span>
                </div>
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
              <Button type="submit" disabled={isSubmitting || createDisabled}>
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
            <DialogTitle>Modifier le topic</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input
                value={form.label}
                onChange={(e) =>
                  setForm((p) => ({ ...p, label: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Key *</Label>
              <Input
                value={form.key}
                onChange={(e) =>
                  setForm((p) => ({ ...p, key: e.target.value }))
                }
                required
              />
              <div className="text-xs text-gray-500">
                Normalisé:{" "}
                <span className="font-mono">
                  {normalizeKey(form.key) || "—"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ordre</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      order: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Actif</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) =>
                      setForm((p) => ({ ...p, isActive: v }))
                    }
                  />
                  <span className="text-sm text-gray-600">
                    {form.isActive ? "Oui" : "Non"}
                  </span>
                </div>
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
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Supprimer le topic
            </DialogTitle>
            <DialogDescription>
              Le topic{" "}
              <span className="font-semibold text-gray-900">
                {toDelete?.label}
              </span>{" "}
              sera supprimé.
              <br />
              Les articles liés seront conservés mais auront{" "}
              <span className="font-semibold">topic = null</span>.
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
