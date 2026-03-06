import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Locale = "fr" | "en";

type TopicTranslationPayload = {
  fr?: { label?: string };
  en?: { label?: string };
};

function sanitizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeOrder(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function hasOwn(obj: unknown, key: string) {
  return !!obj && typeof obj === "object" && Object.prototype.hasOwnProperty.call(obj, key);
}

function formatTopic(topic: {
  id: string;
  key: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: Array<{
    id: string;
    topicId: string;
    locale: Locale;
    label: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  _count?: { posts: number };
}) {
  const fr = topic.translations.find((t) => t.locale === "fr");
  const en = topic.translations.find((t) => t.locale === "en");

  return {
    ...topic,
    label: fr?.label || en?.label || "",
    labels: {
      fr: fr?.label || "",
      en: en?.label || "",
    },
  };
}

function prismaErrorMessage(error: any) {
  if (error?.code === "P2002") {
    return "Un topic avec cette clé existe déjà.";
  }

  if (error?.code === "P2025") {
    return "Topic introuvable.";
  }

  return error?.message || "Erreur serveur";
}

async function getFormattedTopic(id: string) {
  const topic = await prisma.blogTopic.findUnique({
    where: { id },
    include: {
      translations: {
        orderBy: { locale: "asc" },
      },
      _count: {
        select: { posts: true },
      },
    },
  });

  return topic ? formatTopic(topic) : null;
}

export async function PATCH(
  req: Request,
  ctx: { params: { id: string } },
) {
  try {
    const id = ctx.params.id;
    const body = await req.json().catch(() => ({}));

    const topicExists = await prisma.blogTopic.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!topicExists) {
      return NextResponse.json(
        { error: "Topic introuvable." },
        { status: 404 },
      );
    }

    const data: Record<string, any> = {};

    if (hasOwn(body, "key")) {
      const key = sanitizeString(body?.key);
      if (!key) {
        return NextResponse.json(
          { error: "key ne peut pas être vide." },
          { status: 400 },
        );
      }
      data.key = key;
    }

    if (hasOwn(body, "order")) {
      data.order = sanitizeOrder(body?.order);
    }

    if (typeof body?.isActive === "boolean") {
      data.isActive = body.isActive;
    }

    const translationsInput = (body?.translations ?? {}) as TopicTranslationPayload;

    await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        await tx.blogTopic.update({
          where: { id },
          data,
        });
      }

      if (hasOwn(translationsInput, "fr")) {
        const frLabel = sanitizeString(translationsInput.fr?.label);

        if (frLabel) {
          await tx.blogTopicTranslation.upsert({
            where: {
              topicId_locale: {
                topicId: id,
                locale: "fr",
              },
            },
            update: {
              label: frLabel,
            },
            create: {
              topicId: id,
              locale: "fr",
              label: frLabel,
            },
          });
        }
      }

      if (hasOwn(translationsInput, "en")) {
        const enLabel = sanitizeString(translationsInput.en?.label);

        if (enLabel) {
          await tx.blogTopicTranslation.upsert({
            where: {
              topicId_locale: {
                topicId: id,
                locale: "en",
              },
            },
            update: {
              label: enLabel,
            },
            create: {
              topicId: id,
              locale: "en",
              label: enLabel,
            },
          });
        }
      }
    });

    const updated = await getFormattedTopic(id);

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    const message = prismaErrorMessage(error);
    const status =
      error?.code === "P2002"
        ? 409
        : error?.code === "P2025"
          ? 404
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } },
) {
  try {
    const id = ctx.params.id;

    const topic = await prisma.blogTopic.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic introuvable." },
        { status: 404 },
      );
    }

    if (topic._count.posts > 0) {
      return NextResponse.json(
        {
          error: "Impossible de supprimer ce topic car il contient encore des articles.",
        },
        { status: 400 },
      );
    }

    await prisma.blogTopic.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: prismaErrorMessage(error) },
      { status: 500 },
    );
  }
}