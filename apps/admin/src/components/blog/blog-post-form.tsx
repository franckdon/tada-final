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
import { Languages } from "lucide-react";

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

type TranslationInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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
    coverPath: string | null;
    status: PostStatus;
    topicId: string;
    labels: {
      fr: {
        title: string;
        slug: string;
        excerpt: string | null;
        content: string;
      } | null;
      en: {
        title: string;
        slug: string;
        excerpt: string | null;
        content: string;
      } | null;
    };
  };
}) {
  const router = useRouter();
  const { uploadFile, isLoading: isUploading } = useUpload();

  const [autoSlugFr, setAutoSlugFr] = useState(mode === "create");
  const [autoSlugEn, setAutoSlugEn] = useState(mode === "create");

  const [form, setForm] = useState({
    topicId: initial?.topicId ?? topics[0]?.id ?? "",
    status: (initial?.status ?? "draft") as PostStatus,
    coverPath: initial?.coverPath ?? "",
    coverUrl:
      getPublicUrlFromPath({ bucket: "tada", pathOrUrl: initial?.coverPath }) ??
      "",

    fr: {
      title: initial?.labels?.fr?.title ?? "",
      slug: initial?.labels?.fr?.slug ?? "",
      excerpt: initial?.labels?.fr?.excerpt ?? "",
    },
    en: {
      title: initial?.labels?.en?.title ?? "",
      slug: initial?.labels?.en?.slug ?? "",
      excerpt: initial?.labels?.en?.excerpt ?? "",
    },
  });

  const editorFr = useEditor({
    extensions: [StarterKit],
    content: initial?.labels?.fr?.content ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[220px] focus:outline-none p-3",
      },
    },
  });

  const editorEn = useEditor({
    extensions: [StarterKit],
    content: initial?.labels?.en?.content ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[220px] focus:outline-none p-3",
      },
    },
  });

  useEffect(() => {
    if (!autoSlugFr) return;
    const next = slugify(form.fr.title || "");
    setForm((f) => ({ ...f, fr: { ...f.fr, slug: next } }));
  }, [form.fr.title, autoSlugFr]);

  useEffect(() => {
    if (!autoSlugEn) return;
    const next = slugify(form.en.title || "");
    setForm((f) => ({ ...f, en: { ...f.en, slug: next } }));
  }, [form.en.title, autoSlugEn]);

  const canSubmit = useMemo(() => {
    if (!form.topicId) return false;
    if (!editorFr || !editorEn) return false;

    const hasFr = Boolean(form.fr.title.trim() && form.fr.slug.trim());
    const hasEn = Boolean(form.en.title.trim() && form.en.slug.trim());

    return hasFr || hasEn;
  }, [form, editorFr, editorEn]);

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
    if (!editorFr || !editorEn) return;

    const frContent = editorFr.getHTML();
    const enContent = editorEn.getHTML();

    const payload = {
      topicId: form.topicId,
      status: form.status,
      coverPath: form.coverPath || null,
      translations: {
        fr: {
          title: form.fr.title.trim(),
          slug: form.fr.slug.trim(),
          excerpt: form.fr.excerpt.trim() || null,
          content: frContent,
        },
        en: {
          title: form.en.title.trim(),
          slug: form.en.slug.trim(),
          excerpt: form.en.excerpt.trim() || null,
          content: enContent,
        },
      },
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

  function renderEditorToolbar(editor: ReturnType<typeof useEditor>) {
    return (
      <div className="flex flex-wrap gap-2 border-b bg-gray-50 p-2">
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
    );
  }

  return (
    <div className="space-y-6 rounded-lg bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Nouvel article" : "Modifier l’article"}
          </h1>
          <p className="mt-1 text-gray-500">
            Topic, contenu riche, couverture, statut, FR & EN
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{form.status}</Badge>
          {form.fr.title ? <Badge variant="outline">FR</Badge> : null}
          {form.en.title ? <Badge variant="outline">EN</Badge> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  {t.labels?.fr || t.labels?.en || t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, status: v as PostStatus }))
            }
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
            className="h-48 w-full rounded-md border object-cover"
          />
        ) : null}
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <div className="mb-1 flex items-center gap-2 text-sm font-medium text-blue-700">
          <Languages className="h-4 w-4" />
          Traductions
        </div>
        <p className="text-xs text-blue-600">
          Tu peux renseigner le français, l’anglais, ou les deux. Au moins une
          traduction complète est requise.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4 rounded-lg border p-4">
          <div className="text-sm font-semibold text-gray-900">
            Version française
          </div>

          <div className="space-y-2">
            <Label>Titre FR</Label>
            <Input
              value={form.fr.title}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  fr: { ...f.fr, title: e.target.value },
                }))
              }
              placeholder="Ex: 5 métriques de short interest"
            />
          </div>

          <div className="space-y-2">
            <Label>Slug FR</Label>
            <Input
              value={form.fr.slug}
              onChange={(e) => {
                setAutoSlugFr(false);
                setForm((f) => ({
                  ...f,
                  fr: { ...f.fr, slug: e.target.value },
                }));
              }}
              placeholder="Ex: 5-metriques-de-short-interest"
            />
            <div className="text-xs text-gray-500">
              Auto: {autoSlugFr ? "ON" : "OFF"}
              {!autoSlugFr ? (
                <button
                  className="ml-1 underline"
                  type="button"
                  onClick={() => setAutoSlugFr(true)}
                >
                  réactiver
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Excerpt FR</Label>
            <Textarea
              rows={3}
              value={form.fr.excerpt}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  fr: { ...f.fr, excerpt: e.target.value },
                }))
              }
              placeholder="Résumé court en français"
            />
          </div>

          <div className="space-y-2">
            <Label>Contenu FR</Label>
            <div className="rounded-md border">
              {renderEditorToolbar(editorFr)}
              <EditorContent editor={editorFr} />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="text-sm font-semibold text-gray-900">
            Version anglaise
          </div>

          <div className="space-y-2">
            <Label>Title EN</Label>
            <Input
              value={form.en.title}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  en: { ...f.en, title: e.target.value },
                }))
              }
              placeholder="Ex: 5 short interest metrics"
            />
          </div>

          <div className="space-y-2">
            <Label>Slug EN</Label>
            <Input
              value={form.en.slug}
              onChange={(e) => {
                setAutoSlugEn(false);
                setForm((f) => ({
                  ...f,
                  en: { ...f.en, slug: e.target.value },
                }));
              }}
              placeholder="Ex: 5-short-interest-metrics"
            />
            <div className="text-xs text-gray-500">
              Auto: {autoSlugEn ? "ON" : "OFF"}
              {!autoSlugEn ? (
                <button
                  className="ml-1 underline"
                  type="button"
                  onClick={() => setAutoSlugEn(true)}
                >
                  reactivate
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Excerpt EN</Label>
            <Textarea
              rows={3}
              value={form.en.excerpt}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  en: { ...f.en, excerpt: e.target.value },
                }))
              }
              placeholder="Short summary in English"
            />
          </div>

          <div className="space-y-2">
            <Label>Content EN</Label>
            <div className="rounded-md border">
              {renderEditorToolbar(editorEn)}
              <EditorContent editor={editorEn} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button disabled={!canSubmit} onClick={() => void submit()}>
          {mode === "create" ? "Créer" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
