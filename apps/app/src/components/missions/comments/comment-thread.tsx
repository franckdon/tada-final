// src/components/missions/comments/comment-thread.tsx
"use client";

import { useState } from "react";
import { Clock, CheckCircle2, Circle, MoreHorizontal } from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@tada/ui/components/avatar";
import { Textarea } from "@tada/ui/components/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@tada/ui/components/dropdown-menu";
import {
  CommentLite,
  WorkspaceMember,
} from "@/components/comments/comments-types";
import { useI18n } from "@/locales/client";

type CommentThreadProps = {
  comment: CommentLite;
  currentUserId: string;
  isReplying: boolean;
  replyContent: string;
  onOpenReply: () => void;
  onChangeReply: (v: string) => void;
  onSubmitReply: () => void;
  statusLabel: (s: string) => string;
  showMentionList: boolean;
  mentionCandidates: WorkspaceMember[];
  onSelectMention: (m: WorkspaceMember) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onUpdateStatus: (commentId: string, status: "open" | "resolved") => void;
  onDeleteComment: (commentId: string) => void;
};

export function CommentThread({
  comment,
  currentUserId,
  isReplying,
  replyContent,
  onOpenReply,
  onChangeReply,
  onSubmitReply,
  statusLabel,
  showMentionList,
  mentionCandidates,
  onSelectMention,
  onUpdateComment,
  onUpdateStatus,
  onDeleteComment,
}: CommentThreadProps) {
  const t = useI18n();

  const createdAt = new Date(comment.createdAt);
  const initials =
    comment.createdBy?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "?";

  const isOwner = comment.createdBy?.id === currentUserId;

  const [isEditingRoot, setIsEditingRoot] = useState(false);
  const [editRootContent, setEditRootContent] = useState(comment.content);

  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");

  const normalizedStatus =
    (comment.status || "").toString().toLowerCase() || "open";
  const isResolved = normalizedStatus === "resolved";

  const isReplyTyping = !!replyContent.trim() && isReplying;

  const handleJumpToQuestion = () => {
    if (!comment.questionKey) return;
    if (typeof window === "undefined") return;

    window.dispatchEvent(
      new CustomEvent("scroll-to-question", {
        detail: { questionKey: comment.questionKey },
      })
    );
  };

  return (
    <div className="rounded-xl px-4 py-3 hover:bg-slate-50 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8">
          {comment.createdBy?.image && (
            <AvatarImage
              src={comment.createdBy.image}
              alt={comment.createdBy.name}
            />
          )}
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1">
          {/* Header principal : nom + date + actions à droite */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col">
              {/* Ligne “#x · Page 1” → pour l’instant on affiche la question si dispo */}
              {comment.questionKey && (
                <button
                  type="button"
                  onClick={handleJumpToQuestion}
                  className="text-[11px] text-slate-500 hover:underline text-left"
                >
                  {comment.questionKey}
                </button>
              )}

              <div className="flex flex-wrap items-center gap-1 text-xs">
                <span className="font-medium text-slate-900">
                  {comment.createdBy?.name}
                </span>
                <span className="text-slate-400">·</span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Clock className="h-3 w-3" />
                  {createdAt.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Menu ... avec Reply / Edit / Delete */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  <DropdownMenuItem
                    onClick={() => {
                      onOpenReply();
                    }}
                  >
                    {t("comments.actions.reply") || "Reply"}
                  </DropdownMenuItem>

                  {isOwner && (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          setIsEditingRoot(true);
                          setEditRootContent(comment.content);
                        }}
                      >
                        {t("comments.actions.edit") || "Edit"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        {t("comments.actions.delete") || "Delete"}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Bouton open / resolved façon Figma : simple cercle check */}
              <button
                type="button"
                onClick={() =>
                  onUpdateStatus(comment.id, isResolved ? "open" : "resolved")
                }
                className={`
      flex h-7 w-7 items-center justify-center rounded-full border
      transition-colors
      ${
        isResolved
          ? "border-emerald-500 bg-emerald-500 text-white"
          : "border-slate-300 text-slate-400 hover:bg-slate-50"
      }
    `}
                aria-label={
                  isResolved
                    ? t("comments.actions.markOpen") || "Mark as open"
                    : t("comments.actions.markResolved") || "Mark as resolved"
                }
              >
                {/* Même icône pour les deux états, c'est le style qui change */}
                <CheckCircle2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Contenu principal */}
          {!isEditingRoot ? (
            <p className="mt-0.5 text-[13px] text-slate-900 whitespace-pre-line">
              {comment.content}
            </p>
          ) : (
            <div className="mt-1 space-y-1">
              <Textarea
                className="min-h-[60px] text-xs rounded-md bg-white border-slate-200"
                value={editRootContent}
                onChange={(e) => setEditRootContent(e.target.value)}
              />
              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingRoot(false);
                    setEditRootContent(comment.content);
                  }}
                  className="text-[12px] text-slate-500 hover:text-slate-700"
                >
                  {t("comments.actions.cancel") || "Cancel"}
                </button>
                <button
                  type="button"
                  disabled={!editRootContent.trim()}
                  onClick={() => {
                    onUpdateComment(comment.id, editRootContent);
                    setIsEditingRoot(false);
                  }}
                  className="
                    h-7 px-4 rounded-full text-[12px] font-medium
                    bg-slate-900 text-white
                    hover:bg-slate-800
                    disabled:opacity-40 disabled:cursor-not-allowed
                    shadow-[0_1px_2px_rgba(0,0,0,0.12)]
                  "
                >
                  {t("comments.actions.save") || "Save"}
                </button>
              </div>
            </div>
          )}

          {/* Nombre de replies */}
          {!isEditingRoot && (comment.replies?.length ?? 0) > 0 && (
            <button
              type="button"
              className="mt-1 text-[11px] text-slate-500 hover:underline"
              onClick={onOpenReply}
            >
              {(comment.replies?.length ?? 0) === 1
                ? "1 reply"
                : `${comment.replies?.length ?? 0} replies`}
            </button>
          )}
        </div>
      </div>

      {/* Réponses */}
      {(comment.replies?.length ?? 0) > 0 && (
        <div className="mt-3 space-y-2 pl-11">
          {(comment.replies ?? []).map((reply) => {
            const replyDate = new Date(reply.createdAt);
            const replyInitials =
              reply.createdBy?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() ?? "?";

            const isReplyOwner = reply.createdBy?.id === currentUserId;
            const isEditingThisReply = editingReplyId === reply.id;

            return (
              <div key={reply.id} className="flex gap-2">
                <Avatar className="h-7 w-7 mt-1">
                  {reply.createdBy?.image && (
                    <AvatarImage
                      src={reply.createdBy.image}
                      alt={reply.createdBy.name}
                    />
                  )}
                  <AvatarFallback className="text-[9px]">
                    {replyInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-slate-900">
                        {reply.createdBy?.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {replyDate.toLocaleString()}
                      </span>
                    </div>

                    {isReplyOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-[140px]"
                        >
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingReplyId(reply.id);
                              setEditReplyContent(reply.content);
                            }}
                          >
                            {t("comments.actions.edit") || "Edit"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteComment(reply.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            {t("comments.actions.delete") || "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {!isEditingThisReply ? (
                    <p className="mt-1 rounded-2xl bg-slate-50 px-3 py-1.5 text-[11px] text-slate-800 whitespace-pre-line">
                      {reply.content}
                    </p>
                  ) : (
                    <div className="mt-1 space-y-1">
                      <Textarea
                        className="min-h-[40px] text-xs rounded-md bg-white border-slate-200"
                        value={editReplyContent}
                        onChange={(e) => setEditReplyContent(e.target.value)}
                      />
                      <div className="mt-2 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingReplyId(null);
                            setEditReplyContent("");
                          }}
                          className="text-[12px] text-slate-500 hover:text-slate-700"
                        >
                          {t("comments.actions.cancel") || "Cancel"}
                        </button>
                        <button
                          type="button"
                          disabled={!editReplyContent.trim()}
                          onClick={() => {
                            onUpdateComment(reply.id, editReplyContent);
                            setEditingReplyId(null);
                            setEditReplyContent("");
                          }}
                          className="
                            h-7 px-4 rounded-full text-[12px] font-medium
                            bg-slate-900 text-white
                            hover:bg-slate-800
                            disabled:opacity-40 disabled:cursor-not-allowed
                            shadow-[0_1px_2px_rgba(0,0,0,0.12)]
                          "
                        >
                          {t("comments.actions.save") || "Save"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Zone de réponse inline */}
      {isReplying && (
        <div className="mt-3 ml-11 space-y-1 relative">
          <Textarea
            className="min-h-[50px] text-xs rounded-md bg-white border-slate-200"
            value={replyContent}
            onChange={(e) => onChangeReply(e.target.value)}
            placeholder={
              t("comments.replyPlaceholder") || "Reply to this comment…"
            }
          />

          {showMentionList && mentionCandidates.length > 0 && (
            <MentionDropdown
              members={mentionCandidates}
              onSelect={onSelectMention}
            />
          )}

          {isReplyTyping && (
            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="inline-flex h-4 w-7 items-center justify-center rounded-full bg-slate-100">
                <span className="flex gap-0.5">
                  <span className="h-1 w-1 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.2s]" />
                  <span className="h-1 w-1 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.1s]" />
                  <span className="h-1 w-1 rounded-full bg-slate-400 animate-bounce" />
                </span>
              </span>
              <span>{t("comments.typing") || "Typing…"}</span>
            </div>
          )}

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onChangeReply("")}
              className="text-[12px] text-slate-500 hover:text-slate-700"
            >
              {t("comments.actions.cancel") || "Cancel"}
            </button>
            <button
              type="button"
              disabled={!replyContent.trim()}
              onClick={onSubmitReply}
              className="
                h-7 px-4 rounded-full text-[12px] font-medium
                bg-slate-900 text-white
                hover:bg-slate-800
                disabled:opacity-40 disabled:cursor-not-allowed
                shadow-[0_1px_2px_rgba(0,0,0,0.12)]
              "
            >
              {t("comments.actions.sendReply") || "Reply"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MentionDropdown({
  members,
  onSelect,
}: {
  members: WorkspaceMember[];
  onSelect: (m: WorkspaceMember) => void;
}) {
  return (
    <div className="absolute bottom-[72px] left-0 z-50 w-full max-h-48 overflow-y-auto rounded-md border bg-white shadow-lg">
      {members.map((m) => {
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
            onClick={() => onSelect(m)}
          >
            <Avatar className="h-6 w-6">
              {m.image && <AvatarImage src={m.image} alt={m.name} />}
              <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{m.name}</span>
              <span className="text-[10px] text-slate-500">{m.email}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
