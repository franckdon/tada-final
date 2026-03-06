"use client";

import { useEffect, useMemo, useState } from "react";
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
  Languages,
} from "lucide-react";
import { getPublicUrlFromPath } from "@/lib/uploads/public-url";
import { useToast } from "@/hooks/use-toast";

type Topic = {
  id: string;
  key: string;
  label: string;
  labels: {
    fr: string;
    en: string;
  };
  order: number;
  isActive: boolean;
};

type PostStatus = "draft" | "published" | "archived";

type PostTranslationData = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
};

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
  topicId: string;
  topic: Topic | null;
  labels: {
    fr: PostTranslationData | null;
    en: PostTranslationData | null;
  };
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR");
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
  const { toast } = useToast();

  const [topics] = useState<Topic[]>(initialTopics);
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | PostStatus>("all");
  const [topicId, setTopicId] = useState<string>("all");
  const [localeView, setLocaleView] = useState<"fr" | "en">("fr");

  const [sortBy, setSortBy] = useState<"createdAt" | "title" | "status">(
    "createdAt",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [q, status, topicId, localeView]);

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
        const frTitle = (p.labels?.fr?.title ?? "").toLowerCase();
        const enTitle = (p.labels?.en?.title ?? "").toLowerCase();

        const frSlug = (p.labels?.fr?.slug ?? "").toLowerCase();
        const enSlug = (p.labels?.en?.slug ?? "").toLowerCase();

        const frExcerpt = (p.labels?.fr?.excerpt ?? "").toLowerCase();
        const enExcerpt = (p.labels?.en?.excerpt ?? "").toLowerCase();

        const topicFr = (p.topic?.labels?.fr ?? "").toLowerCase();
        const topicEn = (p.topic?.labels?.en ?? "").toLowerCase();

        return (
          frTitle.includes(needle) ||
          enTitle.includes(needle) ||
          frSlug.includes(needle) ||
          enSlug.includes(needle) ||
          frExcerpt.includes(needle) ||
          enExcerpt.includes(needle) ||
          topicFr.includes(needle) ||
          topicEn.includes(needle)
        );
      });
    }

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;

      if (sortBy === "createdAt") {
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          dir
        );
      }

      if (sortBy === "title") {
        const aTitle =
          localeView === "fr"
            ? a.labels?.fr?.title || a.labels?.en?.title || ""
            : a.labels?.en?.title || a.labels?.fr?.title || "";

        const bTitle =
          localeView === "fr"
            ? b.labels?.fr?.title || b.labels?.en?.title || ""
            : b.labels?.en?.title || b.labels?.fr?.title || "";

        return (
          aTitle.localeCompare(bTitle, localeView === "fr" ? "fr" : "en") * dir
        );
      }

      return (a.status ?? "").localeCompare(b.status ?? "") * dir;
    });

    return list;
  }, [posts, q, status, topicId, sortBy, sortDir, localeView]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const paged = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, totalPages]);

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
      if (!res.ok) {
        throw new Error(json?.error || "Impossible de supprimer l’article");
      }

      setPosts((prev) => prev.filter((x) => x.id !== postToDelete.id));
      setDeleteOpen(false);
      setPostToDelete(null);

      toast({
        title: "Article supprimé",
        description: "L’article a été supprimé avec succès.",
      });
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

  function getLocalizedPostValue(post: Post, locale: "fr" | "en") {
    const primary = locale === "fr" ? post.labels?.fr : post.labels?.en;
    const fallback = locale === "fr" ? post.labels?.en : post.labels?.fr;
    return primary || fallback || null;
  }

  function getLocalizedTopicLabel(topic: Topic | null, locale: "fr" | "en") {
    if (!topic) return "—";
    return locale === "fr"
      ? topic.labels?.fr || topic.labels?.en || "—"
      : topic.labels?.en || topic.labels?.fr || "—";
  }

  return (
    <div className="rounded-lg bg-white p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="mt-1 text-gray-500">Gérer les articles et les topics</p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel article
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-5">
          <Label className="sr-only">Recherche</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                  {getLocalizedTopicLabel(t, localeView)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
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

        <div className="md:col-span-2">
          <Label className="sr-only">Langue</Label>
          <Select
            value={localeView}
            onValueChange={(v) => setLocaleView(v as "fr" | "en")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Langue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-3 flex flex-col justify-between gap-2 md:flex-row md:items-center">
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

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Article</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Langues</TableHead>
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
                  colSpan={7}
                  className="py-8 text-center text-gray-500"
                >
                  Aucun article trouvé
                </TableCell>
              </TableRow>
            ) : (
              paged.map((p) => {
                const localized = getLocalizedPostValue(p, localeView);
                const cover =
                  getPublicUrlFromPath({
                    bucket: "tada",
                    pathOrUrl: p.coverPath,
                  }) ?? null;

                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-md border bg-slate-900">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cover}
                              alt={localized?.title || "cover"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-slate-300" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="max-w-[520px] truncate font-medium">
                            {localized?.title || "—"}
                          </div>
                          <div className="max-w-[520px] truncate text-xs text-gray-500">
                            /{localized?.slug || "—"}
                            {localized?.excerpt
                              ? ` • ${localized.excerpt}`
                              : ""}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {getLocalizedTopicLabel(p.topic, localeView)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        {p.labels?.fr ? (
                          <Badge variant="outline">FR</Badge>
                        ) : null}
                        {p.labels?.en ? (
                          <Badge variant="outline">EN</Badge>
                        ) : null}
                      </div>
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

      <div className="mt-4 flex items-center justify-between">
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

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
          <div className="flex max-h-[90vh] flex-col">
            <DialogHeader className="shrink-0 border-b px-6 py-4">
              <DialogTitle>Détails article</DialogTitle>
            </DialogHeader>

            {selectedPost ? (
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="text-lg font-semibold">
                        {getLocalizedPostValue(selectedPost, localeView)
                          ?.title || "—"}
                      </div>
                      <div className="text-sm text-gray-500">
                        /
                        {getLocalizedPostValue(selectedPost, localeView)
                          ?.slug || "—"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {getLocalizedTopicLabel(selectedPost.topic, localeView)}
                      </Badge>
                      {selectedPost.labels?.fr ? (
                        <Badge variant="outline">FR</Badge>
                      ) : null}
                      {selectedPost.labels?.en ? (
                        <Badge variant="outline">EN</Badge>
                      ) : null}
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
                      className="h-56 w-full rounded-md border object-cover"
                    />
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Languages className="h-4 w-4" />
                        Version française
                      </div>
                      {selectedPost.labels?.fr ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <div className="text-xs text-gray-500">Titre</div>
                            <div className="font-medium">
                              {selectedPost.labels.fr.title}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Slug</div>
                            <div>/{selectedPost.labels.fr.slug}</div>
                          </div>
                          {selectedPost.labels.fr.excerpt ? (
                            <div>
                              <div className="text-xs text-gray-500">
                                Excerpt
                              </div>
                              <div>{selectedPost.labels.fr.excerpt}</div>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Aucune traduction FR
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                        <Languages className="h-4 w-4" />
                        Version anglaise
                      </div>
                      {selectedPost.labels?.en ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <div className="text-xs text-gray-500">Title</div>
                            <div className="font-medium">
                              {selectedPost.labels.en.title}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Slug</div>
                            <div>/{selectedPost.labels.en.slug}</div>
                          </div>
                          {selectedPost.labels.en.excerpt ? (
                            <div>
                              <div className="text-xs text-gray-500">
                                Excerpt
                              </div>
                              <div>{selectedPost.labels.en.excerpt}</div>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          No EN translation
                        </div>
                      )}
                    </div>
                  </div>

                  {getLocalizedPostValue(selectedPost, localeView)?.excerpt ? (
                    <div className="text-sm text-gray-700">
                      {getLocalizedPostValue(selectedPost, localeView)?.excerpt}
                    </div>
                  ) : null}

                  <div
                    className="prose prose-sm max-w-none rounded-md border p-4"
                    dangerouslySetInnerHTML={{
                      __html:
                        getLocalizedPostValue(selectedPost, localeView)
                          ?.content || "",
                    }}
                  />

                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-500 md:grid-cols-2">
                    <div>Créé: {formatDate(selectedPost.createdAt)}</div>
                    <div>Publié: {formatDate(selectedPost.publishedAt)}</div>
                  </div>
                </div>
              </div>
            ) : null}

            <DialogFooter className="shrink-0 border-t px-6 py-4">
              <Button variant="outline" onClick={() => setViewOpen(false)}>
                Fermer
              </Button>
              <Button onClick={() => selectedPost && openEdit(selectedPost)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Supprimer l’article
            </DialogTitle>
            <DialogDescription>
              Confirmer la suppression de{" "}
              <span className="font-semibold text-gray-900">
                {postToDelete
                  ? getLocalizedPostValue(postToDelete, localeView)?.title ||
                    postToDelete.title
                  : "cet article"}
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
