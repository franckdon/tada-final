// src/components/missions/comments/question-comments-bubble.tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@tada/ui/components/button";
import { Textarea } from "@tada/ui/components/textarea";
import { useI18n } from "@/locales/client";
import {
  CommentLite,
  WorkspaceMember,
} from "@/components/comments/comments-types";
import { CommentThread } from "@/components/missions/comments/comment-thread";

type QuestionCommentsBubbleProps = {
  missionId: string;
  questionKey: string;
  questionLabel: string;
  currentUserId: string;
  workspaceMembers: WorkspaceMember[];
  onClose: () => void;
};

export function QuestionCommentsBubble({
  missionId,
  questionKey,
  questionLabel,
  currentUserId,
  workspaceMembers,
  onClose,
}: QuestionCommentsBubbleProps) {
  const t = useI18n();

  const [threads, setThreads] = useState<CommentLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [newContent, setNewContent] = useState("");
  const [replyForId, setReplyForId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // charge uniquement les commentaires de cette question
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const url = new URL("/api/comments", window.location.origin);
        url.searchParams.set("missionId", missionId);
        url.searchParams.set("questionKey", questionKey);

        const res = await fetch(url.toString());
        if (!res.ok) {
          console.error(
            "Erreur chargement commentaires question",
            await res.text()
          );
          return;
        }

        const data = (await res.json()) as CommentLite[];
        setThreads(
          data.map((c) => ({
            ...c,
            replies: c.replies ?? [],
          }))
        );
      } catch (e) {
        console.error("Erreur réseau commentaires question", e);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [missionId, questionKey]);

  // création d’un nouveau thread pour cette question
  const handleCreateRootComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      setSending(true);

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId,
          content: newContent.trim(),
          questionKey,
        }),
      });

      if (!res.ok) {
        console.error("Erreur POST /api/comments (bubble)", await res.text());
        return;
      }

      const created = (await res.json()) as CommentLite;
      setThreads((prev) => [
        { ...created, replies: created.replies ?? [] },
        ...prev,
      ]);
      setNewContent("");
    } catch (err) {
      console.error("Erreur création commentaire (bubble)", err);
    } finally {
      setSending(false);
    }
  };

  // réponse à un thread
  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) return;

    try {
      setSending(true);

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId,
          content: replyContent.trim(),
          parentId: commentId,
          questionKey,
        }),
      });

      if (!res.ok) {
        console.error(
          "Erreur POST /api/comments (reply bubble)",
          await res.text()
        );
        return;
      }

      const created = (await res.json()) as CommentLite;

      setThreads((prev) =>
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
    } catch (err) {
      console.error("Erreur réponse commentaire (bubble)", err);
    } finally {
      setSending(false);
    }
  };

  // update / status / delete délégés au drawer (ici on ne fait que l’UI Figma)
  const handleUpdateComment = async () => {};
  const handleUpdateStatus = async () => {};
  const handleDeleteComment = async () => {};

  return (
    <div className="absolute left-1/2 top-4 z-40 w-full max-w-md -translate-x-1/2">
      <div className="rounded-2xl border border-sky-400 bg-white shadow-xl shadow-slate-300/40 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-50/80">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-900">
              {t("comments.bubble.title") || "Comment"}
            </span>
            <span className="text-[11px] text-slate-500 line-clamp-1">
              {questionLabel}
            </span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* liste de threads */}
        <div className="max-h-72 overflow-y-auto px-4 py-3 space-y-3">
          {loading && (
            <p className="text-xs text-slate-500">
              {t("comments.loading") || "Chargement..."}
            </p>
          )}

          {!loading && threads.length === 0 && (
            <p className="text-xs text-slate-500">
              {t("comments.emptyQuestion") ||
                "Aucun commentaire pour cette question."}
            </p>
          )}

          {threads.map((comment, index) => (
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
              onChangeReply={(v) => setReplyContent(v)}
              onSubmitReply={() => handleReply(comment.id)}
              statusLabel={(s) => s}
              showMentionList={false}
              mentionCandidates={workspaceMembers}
              onSelectMention={() => {}}
              onUpdateComment={handleUpdateComment as any}
              onUpdateStatus={handleUpdateStatus as any}
              onDeleteComment={handleDeleteComment as any}
            />
          ))}
        </div>

        {/* composer root */}
        <form
          onSubmit={handleCreateRootComment}
          className="border-t px-4 py-2 space-y-1"
        >
          <p className="text-[11px] font-medium text-slate-600">
            {t("comments.bubble.new") || "Add a comment"}
          </p>
          <Textarea
            className="min-h-[48px] text-xs"
            placeholder={t("comments.bubble.placeholder") || "Reply…"}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              size="xs"
              type="submit"
              disabled={sending || !newContent.trim()}
              className="rounded-full px-4"
            >
              {sending
                ? t("comments.sending") || "Envoi..."
                : t("comments.send") || "Commenter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
