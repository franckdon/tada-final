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

function extractTranslations(input: unknown) {
  const translations = (input ?? {}) as TopicTranslationPayload;

  const fr = sanitizeString(translations?.fr?.label);
  const en = sanitizeString(translations?.en?.label);

  const items: Array<{ locale: Locale; label: string }> = [];

  if (fr) items.push({ locale: "fr", label: fr });
  if (en) items.push({ locale: "en", label: en });

  return {
    fr,
    en,
    items,
  };
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

export async function GET() {
  try {
    const topics = await prisma.blogTopic.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        translations: {
          orderBy: { locale: "asc" },
        },
        _count: {
          select: { posts: true },
        },
      },
    });

    return NextResponse.json({
      data: topics.map(formatTopic),
    });
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

    const key = sanitizeString(body?.key);
    const order = sanitizeOrder(body?.order);
    const isActive =
      typeof body?.isActive === "boolean" ? body.isActive : true;

    const { items } = extractTranslations(body?.translations);

    if (!key) {
      return NextResponse.json(
        { error: "key est requis" },
        { status: 400 },
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Au moins une traduction est requise (fr ou en)." },
        { status: 400 },
      );
    }

    const created = await prisma.blogTopic.create({
      data: {
        key,
        order,
        isActive,
        translations: {
          create: items,
        },
      },
      include: {
        translations: {
          orderBy: { locale: "asc" },
        },
        _count: {
          select: { posts: true },
        },
      },
    });

    return NextResponse.json(
      { data: formatTopic(created) },
      { status: 201 },
    );
  } catch (error: any) {
    const message = prismaErrorMessage(error);
    const status = error?.code === "P2002" ? 409 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}