import { prisma } from "@/lib/prisma";

import { HomeCardsSlider } from "@/components/home/HomeCardsSlider";
import { HomeQuickActionsSection } from "@/components/home/HomeQuickActionsSection";
import { GreetingSectionServer } from "./GreetingSection.server";
import { getPublicUrlForPath } from "@/lib/uploads.public";
import { HomeTemplatesSection } from "@/components/home/HomeTemplatesSection";
import { HomeScheduleCallSection } from "@/components/home/HomeScheduleCallSection";

type Locale = "fr" | "en";

function getSafeLocale(locale?: string): Locale {
  return locale === "en" ? "en" : "fr";
}

function getLocalizedText(locale: Locale) {
  if (locale === "en") {
    return {
      sectionTitle: "What's New",
      readMore: "Read more",
      fallbackDescription: "Discover this article",
    };
  }

  return {
    sectionTitle: "Nouveautés",
    readMore: "Lire plus",
    fallbackDescription: "Découvrir cet article",
  };
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max = 140) {
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getSafeLocale(rawLocale);
  const t = getLocalizedText(locale);

  const posts = await prisma.blogPost.findMany({
    where: {
      status: "published",
      translations: {
        some: {
          locale,
        },
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 10,
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

  const slides = posts
    .map((post) => {
      const localized =
        post.translations.find((tr) => tr.locale === locale) ||
        post.translations.find((tr) => tr.locale === "fr") ||
        post.translations.find((tr) => tr.locale === "en") ||
        null;

      if (!localized) return null;

      const plainContent = stripHtml(localized.content || "");
      const description =
        localized.excerpt?.trim() ||
        truncate(plainContent, 140) ||
        t.fallbackDescription;

      return {
        title: localized.title,
        description,
        ctaLabel: t.readMore,
        ctaHref: `/${locale}/blog/${localized.slug}`,
        imageSrc:
          getPublicUrlForPath({
            category: "blogCover",
            pathOrUrl: post.coverPath,
          }) ?? "/images/placeholder.jpg",
        imageAlt: localized.title,
      };
    })
    .filter(Boolean) as Array<{
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    imageSrc: string;
    imageAlt: string;
  }>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-8xl px-4">
        <div className="rounded-xl bg-white p-6 md:p-8">
          <GreetingSectionServer />

          <HomeQuickActionsSection />

          <HomeCardsSlider slides={slides} title={t.sectionTitle} />

          <HomeTemplatesSection />

          <HomeScheduleCallSection />
        </div>
      </div>
    </div>
  );
}
