"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import { Textarea } from "@tada/ui/components/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@tada/ui/components/select";
import { Badge } from "@tada/ui/components/badge";

import { useUpload } from "@/hooks/use-upload";
import { getPublicUrlFromPath } from "@/lib/uploads/public-url";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Topic = {
  id: string;
  key: string;
  label: string;
  order: number;
  isActive: boolean;
};

type PostStatus = "draft" | "published" | "archived";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function BlogPostForm({
  mode,
  topics,
  initial,
}: {
  mode: "create" | "edit";
  topics: Topic[];
  initial?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverPath: string | null;
    status: PostStatus;
    topicId: string | null;
  };
}) {
  const router = useRouter();
  const { uploadFile, isLoading: isUploading } = useUpload();

  const [autoSlug, setAutoSlug] = useState(mode === "create");

  const [form, setForm] = useState({
    topicId: initial?.topicId ?? topics[0]?.id ?? "",
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    status: (initial?.status ?? "draft") as PostStatus,
    coverPath: initial?.coverPath ?? "",
    coverUrl:
      getPublicUrlFromPath({ bucket: "tada", pathOrUrl: initial?.coverPath }) ??
      "",
  });

  // Tiptap editor (HTML)
  const editor = useEditor({
    extensions: [StarterKit],
    content: initial?.content ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[260px] focus:outline-none p-3",
      },
    },
  });

  // auto slug when title changes
  useEffect(() => {
    if (!autoSlug) return;
    const next = slugify(form.title || "");
    setForm((f) => ({ ...f, slug: next }));
  }, [form.title, autoSlug]);

  const canSubmit = useMemo(() => {
    return Boolean(
      form.topicId && form.title.trim() && form.slug.trim() && editor,
    );
  }, [form.topicId, form.title, form.slug, editor]);

  async function onPickCover(file: File) {
    const filename = `${Date.now()}-${file.name}`.replace(/\s+/g, "-");
    const path = ["blog", "covers", filename];

    const up = await uploadFile({ file, bucket: "tada", path });

    setForm((f) => ({
      ...f,
      coverPath: up.path,
      coverUrl: up.url,
    }));
  }

  async function submit() {
    if (!editor) return;

    const payload = {
      topicId: form.topicId || null,
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt?.trim() || null,
      content: editor.getHTML(),
      status: form.status,
      coverPath: form.coverPath || null,
    };

    const url =
      mode === "create" ? "/api/blog/posts" : `/api/blog/posts/${initial?.id}`;

    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json?.error || "Save failed");
    }

    router.push("/blog");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-lg p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Nouvel article" : "Modifier l’article"}
          </h1>
          <p className="text-gray-500 mt-1">
            Topic, contenu riche, couverture, statut
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{form.status}</Badge>
        </div>
      </div>

      {/* Topic + Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Topic</Label>
          <Select
            value={form.topicId}
            onValueChange={(v) => setForm((f) => ({ ...f, topicId: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un topic" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => setForm((f) => ({ ...f, status: v as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">draft</SelectItem>
              <SelectItem value="published">published</SelectItem>
              <SelectItem value="archived">archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Title + Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Titre</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Ex: 5 métriques de short interest"
          />
        </div>

        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            value={form.slug}
            onChange={(e) => {
              setAutoSlug(false); // ✅ stop auto
              setForm((f) => ({ ...f, slug: e.target.value }));
            }}
            placeholder="Ex: 5-short-interest-metrics"
          />
          <div className="text-xs text-gray-500">
            Auto: {autoSlug ? "ON" : "OFF"}{" "}
            {!autoSlug ? (
              <button
                className="underline ml-1"
                type="button"
                onClick={() => setAutoSlug(true)}
              >
                réactiver
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <Label>Excerpt</Label>
        <Textarea
          rows={3}
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          placeholder="Résumé court (optionnel)"
        />
      </div>

      {/* Cover */}
      <div className="space-y-2">
        <Label>Cover</Label>
        <Input
          type="file"
          accept="image/*"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onPickCover(file);
          }}
        />
        {form.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.coverUrl}
            alt="cover"
            className="h-48 w-full object-cover rounded-md border"
          />
        ) : null}
      </div>

      {/* Content editor */}
      <div className="space-y-2">
        <Label>Corps de l’article</Label>

        <div className="border rounded-md">
          {/* Toolbar minimal */}
          <div className="flex flex-wrap gap-2 p-2 border-b bg-gray-50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={!editor}
            >
              Bold
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={!editor}
            >
              Italic
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              disabled={!editor}
            >
              • List
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              disabled={!editor}
            >
              1. List
            </Button>
          </div>

          <EditorContent editor={editor} />
        </div>

        <div className="text-xs text-gray-500">
          Contenu stocké en <b>HTML</b> dans `blog_post.content`.
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button disabled={!canSubmit} onClick={() => void submit()}>
          Créer
        </Button>
      </div>
    </div>
  );
}
