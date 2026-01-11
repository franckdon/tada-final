// src/components/missions/comments/mission-comments-drawer.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { X, MessageCircle, SlidersHorizontal } from "lucide-react";
import { Button } from "@tada/ui/components/button";
import { Textarea } from "@tada/ui/components/textarea";
import { Input } from "@tada/ui/components/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@tada/ui/components/dropdown-menu";
import { useI18n } from "@/locales/client";
import {
  CommentLite,
  WorkspaceMember,
} from "@/components/comments/comments-types";
import { CommentThread } from "@/components/missions/comments/comment-thread";

type MentionTarget = { type: "root" } | { type: "reply"; commentId: string };
type DrawerMode = "global" | "question";
type SortMode = "date" | "unread";

function updateCommentInTree(
  comments: CommentLite[],
  updated: CommentLite
): CommentLite[] {
  return comments.map((c) => {
    if (c.id === updated.id) {
      return { ...c, ...updated, replies: updated.replies ?? c.replies ?? [] };
    }
    return {
      ...c,
      replies: c.replies ? updateCommentInTree(c.replies, updated) : c.replies,
    };
  });
}

function removeCommentFromTree(
  comments: CommentLite[],
  idToRemove: string
): CommentLite[] {
  return comments
    .filter((c) => c.id !== idToRemove)
    .map((c) => ({
      ...c,
      replies: c.replies
        ? removeCommentFromTree(c.replies, idToRemove)
        : c.replies,
    }));
}

type MissionCommentsDrawerProps = {
  missionId: string;
  workspaceId: string;
  workspaceMembers: WorkspaceMember[];
  currentUserId: string;
  initialComments: CommentLite[];
};

export function MissionCommentsDrawer({
  missionId,
  workspaceMembers,
  currentUserId,
  initialComments,
}: MissionCommentsDrawerProps) {
  const t = useI18n();
  const searchParams = useSearchParams();

  const questionKeyFromUrl = searchParams.get("commentQuestionKey");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DrawerMode>("global");

  const [comments, setComments] = useState<CommentLite[]>(
    initialComments.map((c) => ({
      ...c,
      replies: c.replies ?? [],
    }))
  );

  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [showResolved, setShowResolved] = useState<boolean>(false);
  const [onlyMine, setOnlyMine] = useState<boolean>(false);
  const [search, setSearch] = useState("");

  const [newContent, setNewContent] = useState("");
  const [replyForId, setReplyForId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Mentions
  const [selectedMentionIds, setSelectedMentionIds] = useState<string[]>([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionTarget, setMentionTarget] = useState<MentionTarget | null>(
    null
  );
  const [showMentionList, setShowMentionList] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const availableMembers = useMemo(
    () => workspaceMembers.filter((m) => m.id !== currentUserId),
    [workspaceMembers, currentUserId]
  );

  const mentionCandidates = useMemo(
    () =>
      availableMembers.filter((m) => {
        if (!mentionQuery) return true;
        const q = mentionQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
        );
      }),
    [availableMembers, mentionQuery]
  );

  const resetMentionState = () => {
    setMentionQuery("");
    setMentionTarget(null);
    setShowMentionList(false);
  };

  const detectMention = (value: string, target: MentionTarget) => {
    const lastAt = value.lastIndexOf("@");
    if (lastAt === -1) {
      resetMentionState();
      return;
    }

    const afterAt = value.slice(lastAt + 1);
    if (afterAt.includes(" ") || afterAt.includes("\n")) {
      resetMentionState();
      return;
    }

    setMentionQuery(afterAt);
    setMentionTarget(target);
    setShowMentionList(true);
  };

  const replaceCurrentMention = (text: string, insert: string) => {
    const lastAt = text.lastIndexOf("@");
    if (lastAt === -1) return text;
    return text.slice(0, lastAt) + insert + " ";
  };

  const handleSelectMention = (member: WorkspaceMember) => {
    if (!mentionTarget) return;

    const insert = `@${member.name}`;

    if (mentionTarget.type === "root") {
      setNewContent((prev) => replaceCurrentMention(prev, insert));
    } else {
      setReplyContent((prev) => replaceCurrentMention(prev, insert));
    }

    setSelectedMentionIds((prev) =>
      prev.includes(member.id) ? prev : [...prev, member.id]
    );

    resetMentionState();
  };

  // Ouverture depuis une question (event "open-comments")
  useEffect(() => {
    const handler = () => {
      setMode("question");
      setOpen(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("open-comments", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("open-comments", handler);
      }
    };
  }, []);

  // Auto-open si URL a un commentQuestionKey
  useEffect(() => {
    if (questionKeyFromUrl) {
      setMode("question");
      setOpen(true);
    }
  }, [questionKeyFromUrl]);

  // Reload des commentaires selon mode
  useEffect(() => {
    if (!open) return;

    const fetchComments = async () => {
      try {
        setLoadingComments(true);

        const url = new URL("/api/comments", window.location.origin);
        url.searchParams.set("missionId", missionId);

        if (mode === "question" && questionKeyFromUrl) {
          url.searchParams.set("questionKey", questionKeyFromUrl);
        }

        const res = await fetch(url.toString());
        if (!res.ok) {
          console.error("Erreur chargement commentaires", await res.text());
          return;
        }

        const data = (await res.json()) as CommentLite[];

        setComments(
          data.map((c) => ({
            ...c,
            replies: c.replies ?? [],
          }))
        );
      } catch (e) {
        console.error("Erreur réseau commentaires", e);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [open, missionId, questionKeyFromUrl, mode]);

  // Création commentaire racine
  const handleCreateRootComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      setLoading(true);

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId,
          content: newContent.trim(),
          mentions: selectedMentionIds,
          questionKey:
            mode === "question" && questionKeyFromUrl
              ? questionKeyFromUrl
              : undefined,
        }),
      });

      if (!res.ok) {
        console.error("Erreur POST /api/comments", await res.text());
        return;
      }

      const created = (await res.json()) as CommentLite;

      setComments((prev) => [
        { ...created, replies: created.replies ?? [] },
        ...prev,
      ]);
      setNewContent("");
      setSelectedMentionIds([]);
      resetMentionState();
    } catch (err) {
      console.error("Erreur création commentaire", err);
    } finally {
      setLoading(false);
    }
  };

  // Réponse
  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) return;

    try {
      setLoading(true);

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId,
          content: replyContent.trim(),
          parentId: commentId,
          questionKey:
            mode === "question" && questionKeyFromUrl
              ? questionKeyFromUrl
              : undefined,
        }),
      });

      if (!res.ok) {
        console.error("Erreur POST /api/comments (reply)", await res.text());
        return;
      }

      const created = (await res.json()) as CommentLite;

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                replies: [...(c.replies ?? []), created],
              }
            : c
        )
      );

      setReplyContent("");
      setReplyForId(null);
      resetMentionState();
    } catch (err) {
      console.error("Erreur réponse commentaire", err);
    } finally {
      setLoading(false);
    }
  };

  // Update contenu
  const handleUpdateComment = async (commentId: string, content: string) => {
    if (!content.trim()) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        console.error("Erreur PATCH /api/comments/[id]", await res.text());
        return;
      }

      const updated = (await res.json()) as CommentLite;

      setComments((prev) =>
        updateCommentInTree(prev, {
          ...updated,
          replies: updated.replies ?? [],
        })
      );
    } catch (err) {
      console.error("Erreur update commentaire", err);
    }
  };

  // Update statut (open / resolved) via endpoint dédié /resolve
  const handleUpdateStatus = async (
    commentId: string,
    status: "open" | "resolved" | "archived"
  ) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        console.error(
          "Erreur POST /api/comments/[id]/resolve",
          await res.text()
        );
        return;
      }

      const updated = (await res.json()) as CommentLite;

      setComments((prev) =>
        updateCommentInTree(prev, {
          ...updated,
          replies: updated.replies ?? [],
        })
      );
    } catch (err) {
      console.error("Erreur update statut commentaire", err);
    }
  };

  // Delete
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        console.error("Erreur DELETE /api/comments/[id]", await res.text());
        return;
      }

      setComments((prev) => removeCommentFromTree(prev, commentId));
    } catch (err) {
      console.error("Erreur suppression commentaire", err);
    }
  };

  const statusLabel = (status: string) => {
    if (status === "resolved") return t("comments.status.resolved") || "Résolu";
    if (status === "archived")
      return t("comments.status.archived") || "Archivé";
    return t("comments.status.open") || "Ouvert";
  };

  const isQuestionMode = mode === "question" && !!questionKeyFromUrl;

  // Filtres + tri façon Figma
  const filteredComments = useMemo(() => {
    let list = [...comments];

    // Show / hide résolus (toggle "Show resolved comments")
    if (!showResolved) {
      list = list.filter(
        (c) =>
          c.status !== "resolved" &&
          c.status !== "RESOLVED" &&
          c.status !== "archived"
      );
    }

    // Only your threads
    if (onlyMine) {
      list = list.filter((c) => c.createdBy?.id === currentUserId);
    }

    // Search (contenu, auteur, questionKey)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const content = c.content?.toLowerCase() ?? "";
        const author = c.createdBy?.name?.toLowerCase() ?? "";
        const qKey = c.questionKey?.toLowerCase() ?? "";
        return content.includes(q) || author.includes(q) || qKey.includes(q);
      });
    }

    // Tri
    list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();

      if (sortMode === "date") {
        // plus récent en premier
        return db - da;
      }

      // "Sort by unread" ≈ threads ouverts d'abord, puis résolus, tout en gardant l'ordre par date
      const aOpen =
        a.status === "open" || a.status === "OPEN" || !a.status ? 1 : 0;
      const bOpen =
        b.status === "open" || b.status === "OPEN" || !b.status ? 1 : 0;

      if (aOpen !== bOpen) return bOpen - aOpen;
      return db - da;
    });

    return list;
  }, [comments, showResolved, onlyMine, search, sortMode, currentUserId]);

  const totalThreadsLabel = `${filteredComments.length} ${
    t("comments.countLabel") || "fil(s) de discussion"
  }`;

  return (
    <>
      {/* Bouton flottant global (comme Figma : ouvre le panneau de droite) */}
      <Button
        type="button"
        size="sm"
        className="fixed bottom-24 flex items-center justify-center h-12 w-12 rounded-full bg-primary right-4 z-50"
        onClick={() => {
          setMode("global");
          setOpen(true);
        }}
      >
        <MessageCircle className=" h-8 w-8" />
        {/* {t("comments.openButton") || "Voir les commentaires"} */}
      </Button>

      {/* Drawer / panneau latéral */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setOpen(false)} />

          <div className="w-full max-w-md h-full bg-white shadow-xl border-l flex flex-col">
            {/* Header + search + filtre façon Figma */}
            <div className="px-4 pt-3 pb-2 border-b space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-semibold">
                      {isQuestionMode
                        ? t("comments.titleQuestion") ||
                          "Commentaires sur la question"
                        : t("comments.title") || "Commentaires de la mission"}
                    </p>
                  </div>

                  {isQuestionMode && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {questionKeyFromUrl}
                    </p>
                  )}

                  <p className="text-xs text-slate-500">{totalThreadsLabel}</p>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search + menu filtre */}
              <div className="flex items-center gap-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("comments.searchPlaceholder") || "Search"}
                  className="h-8 text-xs"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full border border-slate-200"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 text-xs">
                    <DropdownMenuItem
                      onClick={() => setSortMode("date")}
                      className={sortMode === "date" ? "font-semibold" : ""}
                    >
                      {t("comments.filters.sortByDate") || "Sort by date"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortMode("unread")}
                      className={sortMode === "unread" ? "font-semibold" : ""}
                    >
                      {t("comments.filters.sortByUnread") || "Sort by unread"}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => setShowResolved((v) => !v)}
                      className={showResolved ? "font-semibold" : ""}
                    >
                      {t("comments.filters.showResolved") ||
                        "Show resolved comments"}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setOnlyMine((v) => !v)}
                      className={onlyMine ? "font-semibold" : ""}
                    >
                      {t("comments.filters.onlyYours") || "Only your threads"}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() =>
                        setMode((m) =>
                          m === "question" ? "global" : "question"
                        )
                      }
                    >
                      {t("comments.filters.onlyCurrentPage") ||
                        "Only current page"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Liste des threads */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {!loadingComments && filteredComments.length === 0 && (
                <p className="text-xs text-slate-500">
                  {isQuestionMode
                    ? t("comments.emptyQuestion") ||
                      "Aucun commentaire pour cette question."
                    : t("comments.empty") ||
                      "Aucun commentaire pour le moment. Soyez le premier à commenter."}
                </p>
              )}

              {filteredComments.map((comment, index) => (
                <CommentThread
                  key={`${comment.id}-${index}`}
                  comment={comment}
                  currentUserId={currentUserId}
                  isReplying={replyForId === comment.id}
                  replyContent={replyContent}
                  onOpenReply={() => {
                    setReplyForId(comment.id);
                    setReplyContent("");
                  }}
                  onChangeReply={(v) => {
                    setReplyContent(v);
                    detectMention(v, { type: "reply", commentId: comment.id });
                  }}
                  onSubmitReply={() => handleReply(comment.id)}
                  statusLabel={statusLabel}
                  showMentionList={
                    showMentionList &&
                    mentionTarget?.type === "reply" &&
                    mentionTarget.commentId === comment.id
                  }
                  mentionCandidates={mentionCandidates}
                  onSelectMention={handleSelectMention}
                  onUpdateComment={handleUpdateComment}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteComment={handleDeleteComment}
                />
              ))}
            </div>

            {/* Composer global / question */}
            <form
              onSubmit={handleCreateRootComment}
              className="border-t px-4 py-3 space-y-2"
            >
              <p className="text-xs font-medium text-slate-600">
                {isQuestionMode
                  ? t("comments.newQuestion") ||
                    "Nouveau commentaire sur cette question"
                  : t("comments.newGlobal") ||
                    "Nouveau commentaire global sur la mission"}
              </p>
              <div className="relative">
                <Textarea
                  className="min-h-[60px] text-xs"
                  placeholder={
                    isQuestionMode
                      ? t("comments.newPlaceholderQuestion") ||
                        "Ajouter un commentaire sur cette question..."
                      : t("comments.newPlaceholder") ||
                        "Ajouter un commentaire sur cette mission..."
                  }
                  value={newContent}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewContent(val);
                    detectMention(val, { type: "root" });
                  }}
                />

                {showMentionList &&
                  mentionTarget?.type === "root" &&
                  mentionCandidates.length > 0 && (
                    <div className="absolute bottom-[72px] left-0 z-50 w-full max-h-48 overflow-y-auto rounded-md border bg-white shadow-lg">
                      {mentionCandidates.map((m) => {
                        const initials = m.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase();

                        return (
                          <button
                            key={m.id}
                            type="button"
                            className="flex w-full items-center gap-2 px-2 py-1 text-left text-xs hover:bg-slate-50"
                            onClick={() => handleSelectMention(m)}
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[9px] font-medium">
                              {initials}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-medium">{m.name}</span>
                              <span className="text-[10px] text-slate-500">
                                {m.email}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  type="submit"
                  disabled={loading || !newContent.trim()}
                >
                  {loading
                    ? t("comments.sending") || "Envoi..."
                    : t("comments.send") || "Commenter"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
