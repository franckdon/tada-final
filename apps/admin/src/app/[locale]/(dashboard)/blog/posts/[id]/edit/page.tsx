import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogPostForm } from "@/components/blog/blog-post-form";

export const metadata = {
  title: "Modifier article | Blog Admin",
};

export default async function EditBlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const [topicsRaw, postRaw] = await Promise.all([
    prisma.blogTopic.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        translations: {
          orderBy: { locale: "asc" },
        },
      },
    }),
    prisma.blogPost.findUnique({
      where: { id: params.id },
      include: {
        translations: {
          orderBy: { locale: "asc" },
        },
      },
    }),
  ]);

  if (!postRaw) {
    notFound();
  }

  const topics = topicsRaw.map((topic) => {
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
  });

  const fr = postRaw.translations.find((t) => t.locale === "fr");
  const en = postRaw.translations.find((t) => t.locale === "en");

  const initial = {
    id: postRaw.id,
    coverPath: postRaw.coverPath,
    status: postRaw.status,
    topicId: postRaw.topicId,
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

  return (
    <div className="p-6">
      <BlogPostForm mode="edit" topics={topics} initial={initial} />
    </div>
  );
}
