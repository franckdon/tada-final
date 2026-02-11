"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import { Badge } from "@tada/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@tada/ui/components/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@tada/ui/components/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@tada/ui/components/table";

import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import { getPublicUrlFromPath } from "@/lib/uploads/public-url";

type Topic = {
  id: string;
  key: string;
  label: string;
  order: number;
  isActive: boolean;
};

type PostStatus = "draft" | "published" | "archived";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverPath: string | null;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  topicId: string | null;
  topic: Topic | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function statusBadge(status: PostStatus) {
  const map: Record<PostStatus, string> = {
    draft: "bg-gray-100 text-gray-800",
    published: "bg-green-100 text-green-800",
    archived: "bg-orange-100 text-orange-800",
  };
  return <Badge className={map[status]}>{status}</Badge>;
}

export function BlogManagement({
  initialTopics,
  initialPosts,
}: {
  initialTopics: Topic[];
  initialPosts: Post[];
}) {
  const router = useRouter();

  const [topics] = useState<Topic[]>(initialTopics);
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  // Filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | PostStatus>("all");
  const [topicId, setTopicId] = useState<string>("all");

  // Sorting
  const [sortBy, setSortBy] = useState<"createdAt" | "title" | "status">(
    "createdAt",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    let list = [...posts];

    if (topicId !== "all") {
      list = list.filter((p) => p.topicId === topicId);
    }

    if (status !== "all") {
      list = list.filter((p) => p.status === status);
    }

    if (needle) {
      list = list.filter((p) => {
        const t = (p.title ?? "").toLowerCase();
        const s = (p.slug ?? "").toLowerCase();
        const e = (p.excerpt ?? "").toLowerCase();
        const topicLabel = (p.topic?.label ?? "").toLowerCase();
        return (
          t.includes(needle) ||
          s.includes(needle) ||
          e.includes(needle) ||
          topicLabel.includes(needle)
        );
      });
    }

    // sort
    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;

      if (sortBy === "createdAt") {
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          dir
        );
      }

      if (sortBy === "title") {
        return (a.title ?? "").localeCompare(b.title ?? "") * dir;
      }

      // status
      return (a.status ?? "").localeCompare(b.status ?? "") * dir;
    });

    return list;
  }, [posts, q, status, topicId, sortBy, sortDir]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const paged = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, totalPages]);

  // reset page when filters change
  useMemo(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, topicId]);

  function openCreate() {
    router.push("/blog/posts/new");
  }

  function openEdit(p: Post) {
    router.push(`/blog/posts/${p.id}/edit`);
  }

  function openView(p: Post) {
    setSelectedPost(p);
    setViewOpen(true);
  }

  function openDelete(p: Post) {
    setPostToDelete(p);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/blog/posts/${postToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Delete failed");

      setPosts((prev) => prev.filter((x) => x.id !== postToDelete.id));
      setDeleteOpen(false);
      setPostToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const sortLabel = (key: typeof sortBy) => {
    if (key === "createdAt") return "Date création";
    if (key === "title") return "Titre";
    return "Statut";
  };

  function toggleSort(key: typeof sortBy) {
    if (sortBy !== key) {
      setSortBy(key);
      setSortDir("desc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }

  return (
    <div className="bg-white rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="text-gray-500 mt-1">Gérer les articles et les topics</p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        <div className="md:col-span-6">
          <Label className="sr-only">Recherche</Label>
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (titre, slug, excerpt, topic...)"
              className="pl-9"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <Label className="sr-only">Topic</Label>
          <Select value={topicId} onValueChange={setTopicId}>
            <SelectTrigger>
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les topics</SelectItem>
              {topics.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3">
          <Label className="sr-only">Statut</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">draft</SelectItem>
              <SelectItem value="published">published</SelectItem>
              <SelectItem value="archived">archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats + sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
        <div className="text-sm text-gray-500">
          {total} article{total > 1 ? "s" : ""} • page {page} / {totalPages}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Trier par</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("createdAt")}
          >
            {sortLabel("createdAt")}
            {sortBy === "createdAt" ? (sortDir === "asc" ? " ↑" : " ↓") : null}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("title")}
          >
            {sortLabel("title")}
            {sortBy === "title" ? (sortDir === "asc" ? " ↑" : " ↓") : null}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("status")}
          >
            {sortLabel("status")}
            {sortBy === "status" ? (sortDir === "asc" ? " ↑" : " ↓") : null}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Article</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Publié</TableHead>
              <TableHead>Créé</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-gray-500 py-8"
                >
                  Aucun article trouvé
                </TableCell>
              </TableRow>
            ) : (
              paged.map((p) => {
                const cover =
                  getPublicUrlFromPath({
                    bucket: "tada",
                    pathOrUrl: p.coverPath,
                  }) ?? null;

                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded-md border overflow-hidden bg-slate-900 flex items-center justify-center">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cover}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-slate-300" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-[520px]">
                            {p.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[520px]">
                            /{p.slug}
                            {p.excerpt ? ` • ${p.excerpt}` : ""}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{p.topic?.label ?? "—"}</Badge>
                    </TableCell>

                    <TableCell>{statusBadge(p.status)}</TableCell>

                    <TableCell className="text-sm">
                      {formatDate(p.publishedAt)}
                    </TableCell>

                    <TableCell className="text-sm">
                      {formatDate(p.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openView(p)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDelete(p)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Précédent
        </Button>

        <div className="text-sm text-gray-500">
          {total === 0 ? "0" : (page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, total)} sur {total}
        </div>

        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Suivant
        </Button>
      </div>

      {/* View modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails article</DialogTitle>
          </DialogHeader>

          {selectedPost ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="text-lg font-semibold">
                    {selectedPost.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    /{selectedPost.slug}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {selectedPost.topic?.label ?? "—"}
                  </Badge>
                  {statusBadge(selectedPost.status)}
                </div>
              </div>

              {selectedPost.coverPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    getPublicUrlFromPath({
                      bucket: "tada",
                      pathOrUrl: selectedPost.coverPath,
                    }) ?? ""
                  }
                  alt="cover"
                  className="h-48 w-full object-cover rounded-md border"
                />
              ) : null}

              {selectedPost.excerpt ? (
                <div className="text-sm text-gray-700">
                  {selectedPost.excerpt}
                </div>
              ) : null}

              <div className="text-sm text-gray-500 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>Créé: {formatDate(selectedPost.createdAt)}</div>
                <div>Publié: {formatDate(selectedPost.publishedAt)}</div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setViewOpen(false)}>
                  Fermer
                </Button>
                <Button onClick={() => selectedPost && openEdit(selectedPost)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Supprimer l’article
            </DialogTitle>
            <DialogDescription>
              Confirmer la suppression de{" "}
              <span className="font-semibold text-gray-900">
                {postToDelete?.title}
              </span>{" "}
              ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setPostToDelete(null);
              }}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
