import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getPublicUrlForPath } from "@/lib/uploads.public";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

type Locale = "fr" | "en";

function getSafeLocale(locale?: string): Locale {
  return locale === "en" ? "en" : "fr";
}

function getTranslations(locale: Locale) {
  if (locale === "en") {
    return {
      home: "Home",
      blog: "Blog",
      backToBlog: "← Back to blog",
      slug: "Slug",
    };
  }

  return {
    home: "Accueil",
    blog: "Blog",
    backToBlog: "← Retour au blog",
    slug: "Slug",
  };
}

function formatDate(d?: Date | null, locale = "fr") {
  if (!d) return null;
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function getLocalizedTopic(topic: any, locale: Locale) {
  if (!topic) return null;

  const primary = topic.translations?.find((t: any) => t.locale === locale);
  const fallback = topic.translations?.find((t: any) =>
    locale === "fr" ? t.locale === "en" : t.locale === "fr",
  );

  return {
    ...topic,
    label: primary?.label || fallback?.label || "",
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug, locale: rawLocale } = await params;
  const locale = getSafeLocale(rawLocale);
  const t = getTranslations(locale);

  const translation = await prisma.blogPostTranslation.findFirst({
    where: {
      locale,
      slug,
      post: {
        status: "published",
      },
    },
    include: {
      post: {
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
      },
    },
  });

  if (
    !translation ||
    !translation.post ||
    translation.post.status !== "published"
  ) {
    notFound();
  }

  const post = translation.post;
  const topic = getLocalizedTopic(post.topic, locale);

  const coverUrl =
    getPublicUrlForPath({
      category: "blogCover",
      pathOrUrl: post.coverPath,
    }) ?? null;

  const publishedLabel = formatDate(post.publishedAt, locale);

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <article className="mx-auto max-w-3xl px-4">
        <div className="mb-4 text-sm text-gray-500">
          <Link href={`/${locale}`} className="hover:underline">
            {t.home}
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${locale}/blog`} className="hover:underline">
            {t.blog}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{translation.title}</span>
        </div>

        <header className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {coverUrl ? (
            <div className="relative h-[240px] w-full sm:h-[320px]">
              <Image
                src={coverUrl}
                alt={translation.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : null}

          <div className="p-6 sm:p-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {topic?.label ? (
                <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                  {topic.label}
                </span>
              ) : null}

              {publishedLabel ? (
                <span className="text-xs text-gray-500">{publishedLabel}</span>
              ) : null}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {translation.title}
            </h1>

            {translation.excerpt ? (
              <p className="mt-3 leading-relaxed text-gray-600">
                {translation.excerpt}
              </p>
            ) : null}
          </div>
        </header>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <BlogContent content={translation.content} />
        </section>

        <footer className="mt-6 flex items-center justify-between">
          <Link
            href={`/${locale}/blog`}
            className="text-sm text-blue-700 hover:underline"
          >
            {t.backToBlog}
          </Link>

          <div className="text-xs text-gray-500">
            {t.slug}: <span className="font-mono">{translation.slug}</span>
          </div>
        </footer>
      </article>
    </main>
  );
}

function BlogContent({ content }: { content: string }) {
  return (
    <div
      className="prose prose-gray max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
