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

function hasOwn(obj: unknown, key: string) {
  return !!obj && typeof obj === "object" && Object.prototype.hasOwnProperty.call(obj, key);
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

function normalizeStatus(value: unknown): BlogPostStatus | undefined {
  return value === "published" || value === "archived" || value === "draft"
    ? value
    : undefined;
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

async function getFormattedPost(id: string) {
  const post = await prisma.blogPost.findUnique({
    where: { id },
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

  return post ? formatPost(post) : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;
    const body = await req.json().catch(() => ({}));

    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        publishedAt: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Article introuvable." },
        { status: 404 },
      );
    }

    const data: Record<string, any> = {};

    if (hasOwn(body, "topicId")) {
      const topicId = sanitizeString(body?.topicId);
      if (!topicId) {
        return NextResponse.json(
          { error: "topicId ne peut pas être vide." },
          { status: 400 },
        );
      }
      data.topicId = topicId;
    }

    if (hasOwn(body, "coverPath")) {
      data.coverPath = sanitizeNullableString(body?.coverPath);
    }

    const nextStatus = normalizeStatus(body?.status);
    if (nextStatus) {
      data.status = nextStatus;

      if (nextStatus === "published") {
        data.publishedAt = existing.publishedAt ?? new Date();
      }

      if (nextStatus !== "published") {
        data.publishedAt = null;
      }
    }

    const translationsInput = (body?.translations ?? {}) as PostTranslationsPayload;

    await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        await tx.blogPost.update({
          where: { id },
          data,
        });
      }

      if (hasOwn(translationsInput, "fr")) {
        const raw = translationsInput.fr;
        const title = sanitizeString(raw?.title);
        const content = sanitizeString(raw?.content);
        const excerpt = sanitizeNullableString(raw?.excerpt);
        const inputSlug = sanitizeString(raw?.slug);

        if (title && content) {
          await tx.blogPostTranslation.upsert({
            where: {
              postId_locale: {
                postId: id,
                locale: "fr",
              },
            },
            update: {
              title,
              slug: inputSlug || slugify(title),
              excerpt,
              content,
            },
            create: {
              postId: id,
              locale: "fr",
              title,
              slug: inputSlug || slugify(title),
              excerpt,
              content,
            },
          });
        }
      }

      if (hasOwn(translationsInput, "en")) {
        const raw = translationsInput.en;
        const title = sanitizeString(raw?.title);
        const content = sanitizeString(raw?.content);
        const excerpt = sanitizeNullableString(raw?.excerpt);
        const inputSlug = sanitizeString(raw?.slug);

        if (title && content) {
          await tx.blogPostTranslation.upsert({
            where: {
              postId_locale: {
                postId: id,
                locale: "en",
              },
            },
            update: {
              title,
              slug: inputSlug || slugify(title),
              excerpt,
              content,
            },
            create: {
              postId: id,
              locale: "en",
              title,
              slug: inputSlug || slugify(title),
              excerpt,
              content,
            },
          });
        }
      }
    });

    const updated = await getFormattedPost(id);

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    const message = prismaErrorMessage(error);
    const status =
      error?.code === "P2002"
        ? 409
        : error?.code === "P2025"
          ? 404
          : error?.code === "P2003"
            ? 400
            : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.blogPost.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    const message = prismaErrorMessage(error);
    const status = error?.code === "P2025" ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}