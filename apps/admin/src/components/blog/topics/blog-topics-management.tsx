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
import { Plus, Edit, Trash2, Loader2, Tags, Languages } from "lucide-react";

type TopicTranslation = {
  id?: string;
  topicId?: string;
  locale: "fr" | "en";
  label: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type Topic = {
  id: string;
  key: string;
  label: string;
  labels: {
    fr: string;
    en: string;
  };
  isActive: boolean;
  order: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  translations?: TopicTranslation[];
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

function normalizeTopic(topic: any): Topic {
  const labels = {
    fr: topic?.labels?.fr || "",
    en: topic?.labels?.en || "",
  };

  return {
    ...topic,
    label: labels.fr || labels.en || "",
    labels,
  };
}

export function BlogTopicsManagement({ initialTopics }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [topics, setTopics] = useState<Topic[]>(
    initialTopics.map(normalizeTopic),
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selected, setSelected] = useState<Topic | null>(null);
  const [toDelete, setToDelete] = useState<Topic | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    key: "",
    labelFr: "",
    labelEn: "",
    order: 0,
    isActive: true,
  });

  const usedKeys = useMemo(() => new Set(topics.map((t) => t.key)), [topics]);

  const normalizedCreateKey = normalizeKey(form.key);

  const editKeyAlreadyUsed = useMemo(() => {
    if (!selected) return false;
    const normalized = normalizeKey(form.key);
    if (!normalized) return false;

    return topics.some((t) => t.id !== selected.id && t.key === normalized);
  }, [topics, selected, form.key]);

  const resetForm = () =>
    setForm({
      key: "",
      labelFr: "",
      labelEn: "",
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
      labelFr: t.labels?.fr || "",
      labelEn: t.labels?.en || "",
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
        key: normalizeKey(form.key),
        order: Number(form.order || 0),
        isActive: !!form.isActive,
        translations: {
          fr: { label: form.labelFr.trim() },
          en: { label: form.labelEn.trim() },
        },
      };

      const res = await fetch("/api/blog/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Impossible de créer le topic");
      }

      const created = normalizeTopic(json.data);

      setTopics((prev) =>
        [...prev, created].sort(
          (a, b) =>
            (a.order ?? 0) - (b.order ?? 0) ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );

      toast({
        title: "Topic créé",
        description: created.label || created.key,
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
        key: normalizeKey(form.key),
        order: Number(form.order || 0),
        isActive: !!form.isActive,
        translations: {
          fr: { label: form.labelFr.trim() },
          en: { label: form.labelEn.trim() },
        },
      };

      const res = await fetch(`/api/blog/topics/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Impossible de modifier le topic");
      }

      const updated = normalizeTopic(json.data);

      setTopics((prev) =>
        prev
          .map((t) => (t.id === selected.id ? updated : t))
          .sort(
            (a, b) =>
              (a.order ?? 0) - (b.order ?? 0) ||
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
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
      if (!res.ok) {
        throw new Error(json?.error || "Impossible de supprimer le topic");
      }

      setTopics((prev) => prev.filter((t) => t.id !== toDelete.id));

      toast({
        title: "Topic supprimé",
        description: `${toDelete.label || toDelete.key} a été supprimé.`,
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
    !normalizedCreateKey ||
    usedKeys.has(normalizedCreateKey) ||
    (!form.labelFr.trim() && !form.labelEn.trim());

  const updateDisabled =
    !normalizeKey(form.key) ||
    editKeyAlreadyUsed ||
    (!form.labelFr.trim() && !form.labelEn.trim());

  return (
    <div className="rounded-lg bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Tags className="h-6 w-6 text-blue-600" />
            Topics du Blog
          </h1>
          <p className="mt-1 text-gray-500">
            Gérez les catégories du blog en français et en anglais.
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau topic
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Label FR</TableHead>
              <TableHead>Label EN</TableHead>
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
                  colSpan={7}
                  className="py-8 text-center text-gray-500"
                >
                  Aucun topic
                </TableCell>
              </TableRow>
            ) : (
              topics.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">
                    {t.labels?.fr || "—"}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {t.labels?.en || "—"}
                  </TableCell>
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
                    <div className="flex justify-end gap-2">
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
              Ajoute les libellés en français et/ou en anglais.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                <Languages className="h-4 w-4" />
                Traductions
              </div>
              <p className="mt-1 text-xs text-blue-600">
                Au moins un label est requis : français ou anglais.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Label FR</Label>
              <Input
                value={form.labelFr}
                onChange={(e) =>
                  setForm((p) => ({ ...p, labelFr: e.target.value }))
                }
                placeholder="Ex: Fondamentaux"
              />
            </div>

            <div className="space-y-2">
              <Label>Label EN</Label>
              <Input
                value={form.labelEn}
                onChange={(e) =>
                  setForm((p) => ({ ...p, labelEn: e.target.value }))
                }
                placeholder="Ex: Fundamentals"
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
                Normalisé :{" "}
                <span className="font-mono">{normalizedCreateKey || "—"}</span>
                {normalizedCreateKey && usedKeys.has(normalizedCreateKey) ? (
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
            <DialogDescription>
              Mets à jour les traductions et la configuration du topic.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                <Languages className="h-4 w-4" />
                Traductions
              </div>
              <p className="mt-1 text-xs text-blue-600">
                Tu peux renseigner le français, l’anglais, ou les deux.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Label FR</Label>
              <Input
                value={form.labelFr}
                onChange={(e) =>
                  setForm((p) => ({ ...p, labelFr: e.target.value }))
                }
                placeholder="Ex: Fondamentaux"
              />
            </div>

            <div className="space-y-2">
              <Label>Label EN</Label>
              <Input
                value={form.labelEn}
                onChange={(e) =>
                  setForm((p) => ({ ...p, labelEn: e.target.value }))
                }
                placeholder="Ex: Fundamentals"
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
                Normalisé :{" "}
                <span className="font-mono">
                  {normalizeKey(form.key) || "—"}
                </span>
                {editKeyAlreadyUsed ? (
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
                onClick={() => setIsEditOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || updateDisabled}>
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
                {toDelete?.label || toDelete?.key}
              </span>{" "}
              sera supprimé uniquement s’il ne contient aucun article.
              <br />
              {toDelete && (toDelete._count?.posts ?? 0) > 0 ? (
                <span className="mt-2 inline-block font-medium text-red-600">
                  Ce topic contient {toDelete._count?.posts ?? 0} article(s). La
                  suppression sera refusée.
                </span>
              ) : null}
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
              disabled={isDeleting || (toDelete?._count?.posts ?? 0) > 0}
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
