import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getPublicUrlForPath } from "@/lib/uploads.public";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ topic?: string; page?: string }>;
};

const PAGE_SIZE = 9;

type Locale = "fr" | "en";

function getSafeLocale(locale?: string): Locale {
  return locale === "en" ? "en" : "fr";
}

function getTranslations(locale: Locale) {
  if (locale === "en") {
    return {
      pageTitle: "Blog",
      pageDescription: "Latest updates, guides and product notes.",
      backHome: "← Back home",
      all: "All",
      noPosts: "No posts yet.",
      readMore: "Read more →",
      previous: "← Previous",
      next: "Next →",
      page: "Page",
    };
  }

  return {
    pageTitle: "Blog",
    pageDescription: "Dernières nouveautés, guides et notes produit.",
    backHome: "← Retour à l’accueil",
    all: "Tous",
    noPosts: "Aucun article pour le moment.",
    readMore: "Lire plus →",
    previous: "← Précédent",
    next: "Suivant →",
    page: "Page",
  };
}

function formatDate(d?: Date | null, locale = "fr") {
  if (!d) return null;
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max = 160) {
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
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

function getLocalizedPostTranslation(post: any, locale: Locale) {
  const primary = post.translations?.find((t: any) => t.locale === locale);
  const fallback = post.translations?.find((t: any) =>
    locale === "fr" ? t.locale === "en" : t.locale === "fr",
  );

  return primary || fallback || null;
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: PageProps) {
  const [{ locale: rawLocale }, sp] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({}),
  ]);

  const locale = getSafeLocale(rawLocale);
  const t = getTranslations(locale);

  const page = Math.max(1, Number(sp?.page ?? "1") || 1);
  const topicKey = (sp?.topic ?? "").trim() || null;

  const topicsRaw = await prisma.blogTopic.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      translations: {
        orderBy: { locale: "asc" },
      },
    },
  });

  if (topicKey && !topicsRaw.some((topic) => topic.key === topicKey)) {
    notFound();
  }

  const where = {
    status: "published" as const,
    ...(topicKey ? { topic: { key: topicKey } } : {}),
    translations: {
      some: {
        locale,
      },
    },
  };

  const [total, postsRaw] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
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
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const topics = topicsRaw.map((topic) => ({
    ...topic,
    label: getLocalizedTopic(topic, locale)?.label || "",
  }));

  const posts = postsRaw
    .map((post) => {
      const translation = getLocalizedPostTranslation(post, locale);
      if (!translation) return null;

      const topic = getLocalizedTopic(post.topic, locale);
      const description =
        translation.excerpt?.trim() ||
        truncate(stripHtml(translation.content || ""), 160);

      return {
        id: post.id,
        coverPath: post.coverPath,
        publishedAt: post.publishedAt,
        topic,
        title: translation.title,
        slug: translation.slug,
        excerpt: description,
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    coverPath: string | null;
    publishedAt: Date | null;
    topic: { label: string } | null;
    title: string;
    slug: string;
    excerpt: string;
  }>;

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {t.pageTitle}
              </h1>
              <p className="mt-2 text-gray-600">{t.pageDescription}</p>
            </div>

            <Link
              href={`/${locale}`}
              className="text-sm text-blue-700 hover:underline"
            >
              {t.backHome}
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <TopicPill
              href={`/${locale}/blog`}
              active={!topicKey}
              label={t.all}
            />
            {topics.map((topic) => (
              <TopicPill
                key={topic.id}
                href={`/${locale}/blog?topic=${encodeURIComponent(topic.key)}`}
                active={topicKey === topic.key}
                label={topic.label}
              />
            ))}
          </div>
        </div>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.length === 0 ? (
            <div className="col-span-full rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
              {t.noPosts}
            </div>
          ) : (
            posts.map((post) => {
              const coverUrl =
                getPublicUrlForPath({
                  category: "blogCover",
                  pathOrUrl: post.coverPath,
                }) ?? null;

              const dateLabel = formatDate(post.publishedAt, locale);

              return (
                <Link
                  key={post.id}
                  href={`/${locale}/blog/${post.slug}`}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-sm"
                >
                  {coverUrl ? (
                    <div className="relative h-[180px] w-full">
                      <Image
                        src={coverUrl}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-[1.01]"
                      />
                    </div>
                  ) : (
                    <div className="h-[180px] w-full bg-gray-50" />
                  )}

                  <div className="p-5">
                    <div className="mb-2 flex items-center gap-2">
                      {post.topic?.label ? (
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                          {post.topic.label}
                        </span>
                      ) : null}

                      {dateLabel ? (
                        <span className="text-xs text-gray-500">
                          {dateLabel}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="line-clamp-2 font-semibold leading-snug text-gray-900">
                      {post.title}
                    </h2>

                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">
                      {post.excerpt}
                    </p>

                    <div className="mt-4 text-sm font-medium text-blue-700">
                      {t.readMore}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </section>

        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-between">
            <PaginationLink
              disabled={page <= 1}
              href={buildPageHref(locale, page - 1, topicKey)}
              label={t.previous}
            />

            <div className="text-sm text-gray-600">
              {t.page} <span className="font-semibold">{page}</span> /{" "}
              <span className="font-semibold">{totalPages}</span>
            </div>

            <PaginationLink
              disabled={page >= totalPages}
              href={buildPageHref(locale, page + 1, topicKey)}
              label={t.next}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}

function buildPageHref(locale: string, page: number, topicKey: string | null) {
  const params = new URLSearchParams();
  if (topicKey) params.set("topic", topicKey);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/${locale}/blog${qs ? `?${qs}` : ""}`;
}

function TopicPill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function PaginationLink({
  href,
  disabled,
  label,
}: {
  href: string;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-400">
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
    >
      {label}
    </Link>
  );
}
