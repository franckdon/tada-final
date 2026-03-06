import { prisma } from "@/lib/prisma";
import { BlogManagement } from "@/components/blog/blog-management";

export const metadata = { title: "Blog | Admin" };

export default async function BlogAdminPage() {
  const topicsRaw = await prisma.blogTopic.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      translations: {
        orderBy: { locale: "asc" },
      },
    },
  });

  const postsRaw = await prisma.blogPost.findMany({
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

  const posts = postsRaw.map((post) => {
    const fr = post.translations.find((t) => t.locale === "fr");
    const en = post.translations.find((t) => t.locale === "en");
    const preferred = fr || en || null;

    const topicFr = post.topic?.translations.find((t) => t.locale === "fr");
    const topicEn = post.topic?.translations.find((t) => t.locale === "en");

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
      topic: post.topic
        ? {
            ...post.topic,
            label: topicFr?.label || topicEn?.label || "",
            labels: {
              fr: topicFr?.label || "",
              en: topicEn?.label || "",
            },
          }
        : null,
    };
  });

  return (
    <div className="p-6">
      <BlogManagement initialTopics={topics} initialPosts={posts} />
    </div>
  );
}
