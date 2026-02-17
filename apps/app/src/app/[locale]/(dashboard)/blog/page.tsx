// app/[locale]/blog/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getPublicUrlForPath } from "@/lib/uploads.public";
import { notFound } from "next/navigation";

type PageProps = {
  params: { locale: string };
  searchParams?: { topic?: string; page?: string };
};

const PAGE_SIZE = 9;

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

export default async function BlogIndexPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = params;

  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const topicKey = (searchParams?.topic ?? "").trim() || null;

  // Topics (pour filtre)
  const topics = await prisma.blogTopic.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  // validate topic key if provided
  if (topicKey && !topics.some((t) => t.key === topicKey)) {
    // topic invalide => 404 (ou ignore, à toi de voir)
    notFound();
  }

  const where = {
    status: "published" as const,
    ...(topicKey ? { topic: { key: topicKey } } : {}),
  };

  const [total, posts] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: { topic: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Blog
              </h1>
              <p className="mt-2 text-gray-600">
                Latest updates, guides and product notes.
              </p>
            </div>

            <Link
              href={`/${locale}`}
              className="text-sm text-blue-700 hover:underline"
            >
              ← Back home
            </Link>
          </div>

          {/* Topics filter */}
          <div className="mt-5 flex flex-wrap gap-2">
            <TopicPill
              href={`/${locale}/blog`}
              active={!topicKey}
              label="All"
            />
            {topics.map((t) => (
              <TopicPill
                key={t.id}
                href={`/${locale}/blog?topic=${encodeURIComponent(t.key)}`}
                active={topicKey === t.key}
                label={t.label}
              />
            ))}
          </div>
        </div>

        {/* Grid */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-gray-200 p-6 text-gray-600">
              No posts yet.
            </div>
          ) : (
            posts.map((p) => {
              const coverUrl =
                getPublicUrlForPath({
                  category: "blogCover",
                  pathOrUrl: p.coverPath,
                }) ?? null;

              const dateLabel = formatDate(p.publishedAt, locale);

              return (
                <Link
                  key={p.id}
                  href={`/${locale}/blog/${p.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow"
                >
                  {coverUrl ? (
                    <div className="relative w-full h-[180px]">
                      <Image
                        src={coverUrl}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-[1.01] transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-[180px] bg-gray-50" />
                  )}

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {p.topic?.label ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {p.topic.label}
                        </span>
                      ) : null}

                      {dateLabel ? (
                        <span className="text-xs text-gray-500">
                          {dateLabel}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="font-semibold text-gray-900 leading-snug line-clamp-2">
                      {p.title}
                    </h2>

                    <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {p.excerpt ?? ""}
                    </p>

                    <div className="mt-4 text-sm text-blue-700 font-medium">
                      Read more →
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-between">
            <PaginationLink
              disabled={page <= 1}
              href={buildPageHref(locale, page - 1, topicKey)}
              label="← Previous"
            />

            <div className="text-sm text-gray-600">
              Page <span className="font-semibold">{page}</span> /{" "}
              <span className="font-semibold">{totalPages}</span>
            </div>

            <PaginationLink
              disabled={page >= totalPages}
              href={buildPageHref(locale, page + 1, topicKey)}
              label="Next →"
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
        "text-sm px-3 py-1 rounded-full border transition-colors",
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
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
      <span className="text-sm px-3 py-2 rounded-md border border-gray-200 text-gray-400 cursor-not-allowed">
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="text-sm px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
    >
      {label}
    </Link>
  );
}
