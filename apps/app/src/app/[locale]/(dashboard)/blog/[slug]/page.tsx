// app/[locale]/blog/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getPublicUrlForPath } from "@/lib/uploads.public";

type PageProps = {
  params: { locale: string; slug: string };
};

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

export default async function BlogPostPage({ params }: PageProps) {
  const { slug, locale } = params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { topic: true },
  });

  // 🔒 gate simple: only published visible
  if (!post || post.status !== "published") {
    notFound();
  }

  const coverUrl =
    getPublicUrlForPath({
      category: "blogCover",
      pathOrUrl: post.coverPath,
    }) ?? null;

  const publishedLabel = formatDate(post.publishedAt, locale);

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <article className="max-w-3xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-500">
          <Link href={`/${locale}`} className="hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${locale}/blog`} className="hover:underline">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{post.title}</span>
        </div>

        {/* Header */}
        <header className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {coverUrl ? (
            <div className="relative w-full h-[240px] sm:h-[320px]">
              <Image
                src={coverUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : null}

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {post.topic?.label ? (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {post.topic.label}
                </span>
              ) : null}

              {publishedLabel ? (
                <span className="text-xs text-gray-500">{publishedLabel}</span>
              ) : null}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {post.title}
            </h1>

            {post.excerpt ? (
              <p className="mt-3 text-gray-600 leading-relaxed">
                {post.excerpt}
              </p>
            ) : null}
          </div>
        </header>

        {/* Body */}
        <section className="mt-6 bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          {/* ✅ Choisis une des 2 options ci-dessous pour afficher le content */}
          <BlogContent content={post.content} />
        </section>

        {/* Footer actions */}
        <footer className="mt-6 flex items-center justify-between">
          <Link
            href={`/${locale}/blog`}
            className="text-sm text-blue-700 hover:underline"
          >
            ← Back to blog
          </Link>

          {/* Optionnel: partager */}
          <div className="text-xs text-gray-500">
            Slug: <span className="font-mono">{post.slug}</span>
          </div>
        </footer>
      </article>
    </main>
  );
}

/**
 * Rendu du contenu:
 * - si tu stockes du Markdown => utilise react-markdown
 * - si tu stockes du HTML => utilise dangerouslySetInnerHTML (avec sanitation côté back)
 *
 * Je te mets Markdown (recommandé) ci-dessous.
 */
function BlogContent({ content }: { content: string }) {
  return (
    <div
      className="prose prose-gray max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
