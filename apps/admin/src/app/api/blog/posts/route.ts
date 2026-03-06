import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Locale = "fr" | "en";
type BlogPostStatus = "draft" | "published" | "archived";

type TranslationPayload = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
};

type PostTranslationsPayload = {
  fr?: TranslationPayload;
  en?: TranslationPayload;
};

function sanitizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeNullableString(value: unknown) {
  if (value == null) return null;
  const v = sanitizeString(value);
  return v || null;
}

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

function normalizeStatus(value: unknown): BlogPostStatus {
  return value === "published" || value === "archived" || value === "draft"
    ? value
    : "draft";
}

function buildTranslationInput(
  locale: Locale,
  input?: TranslationPayload,
) {
  if (!input || typeof input !== "object") return null;

  const title = sanitizeString(input.title);
  const rawSlug = sanitizeString(input.slug);
  const excerpt = sanitizeNullableString(input.excerpt);
  const content = sanitizeString(input.content);

  if (!title || !content) return null;

  return {
    locale,
    title,
    slug: rawSlug || slugify(title),
    excerpt,
    content,
  };
}

function formatPost(post: any) {
  const fr = post.translations?.find((t: any) => t.locale === "fr");
  const en = post.translations?.find((t: any) => t.locale === "en");
  const preferred = fr || en || null;

  return {
    ...post,
    title: preferred?.title || "",
    slug: preferred?.slug || "",
    excerpt: preferred?.excerpt || null,
    content: preferred?.content || "",
    labels: {
      fr: fr
        ? {
            title: fr.title,
            slug: fr.slug,
            excerpt: fr.excerpt,
            content: fr.content,
          }
        : null,
      en: en
        ? {
            title: en.title,
            slug: en.slug,
            excerpt: en.excerpt,
            content: en.content,
          }
        : null,
    },
  };
}

function prismaErrorMessage(error: any) {
  if (error?.code === "P2002") {
    return "Un article avec ce slug existe déjà pour cette langue.";
  }

  if (error?.code === "P2025") {
    return "Article introuvable.";
  }

  if (error?.code === "P2003") {
    return "Le topic sélectionné est invalide.";
  }

  return error?.message || "Erreur serveur";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const topicKey = sanitizeString(url.searchParams.get("topicKey"));
    const topicId = sanitizeString(url.searchParams.get("topicId"));
    const localeParam = sanitizeString(url.searchParams.get("locale"));
    const statusParam = sanitizeString(url.searchParams.get("status"));

    const locale: Locale | undefined =
      localeParam === "fr" || localeParam === "en" ? localeParam : undefined;

    const status: BlogPostStatus | undefined =
      statusParam === "draft" ||
      statusParam === "published" ||
      statusParam === "archived"
        ? statusParam
        : undefined;

    const posts = await prisma.blogPost.findMany({
      where: {
        ...(topicId ? { topicId } : {}),
        ...(topicKey ? { topic: { key: topicKey } } : {}),
        ...(status ? { status } : {}),
        ...(locale
          ? {
              translations: {
                some: { locale },
              },
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }],
      include: {
        topic: {
          include: {
            translations: {
              orderBy: { locale: "asc" },
            },
          },
        },
        translations: {
          orderBy: { locale: "asc" },
        },
      },
    });

    const data = posts.map((post) => {
      const formatted = formatPost(post);

      if (!locale) return formatted;

      const selected = post.translations.find((t) => t.locale === locale);

      return {
        ...formatted,
        title: selected?.title || "",
        slug: selected?.slug || "",
        excerpt: selected?.excerpt || null,
        content: selected?.content || "",
      };
    });

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: prismaErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const topicId = sanitizeString(body?.topicId);
    const coverPath = sanitizeNullableString(body?.coverPath);
    const status = normalizeStatus(body?.status);

    if (!topicId) {
      return NextResponse.json(
        { error: "topicId est requis." },
        { status: 400 },
      );
    }

    const fr = buildTranslationInput("fr", body?.translations?.fr);
    const en = buildTranslationInput("en", body?.translations?.en);

    const translations = [fr, en].filter(Boolean) as Array<{
      locale: Locale;
      title: string;
      slug: string;
      excerpt: string | null;
      content: string;
    }>;

    if (translations.length === 0) {
      return NextResponse.json(
        {
          error:
            "Au moins une traduction complète est requise (title + content) en fr ou en.",
        },
        { status: 400 },
      );
    }

    const created = await prisma.blogPost.create({
      data: {
        topicId,
        coverPath,
        status,
        publishedAt: status === "published" ? new Date() : null,
        translations: {
          create: translations,
        },
      },
      include: {
        topic: {
          include: {
            translations: {
              orderBy: { locale: "asc" },
            },
          },
        },
        translations: {
          orderBy: { locale: "asc" },
        },
      },
    });

    return NextResponse.json(
      { data: formatPost(created) },
      { status: 201 },
    );
  } catch (error: any) {
    const message = prismaErrorMessage(error);
    const status =
      error?.code === "P2002"
        ? 409
        : error?.code === "P2003"
          ? 400
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}