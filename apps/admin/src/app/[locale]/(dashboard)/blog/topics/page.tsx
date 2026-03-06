import { prisma } from "@/lib/prisma";
import { BlogTopicsManagement } from "@/components/blog/topics/blog-topics-management";

export const metadata = {
  title: "Topics du Blog | Tada",
};

export default async function BlogTopicsPage() {
  const topics = await prisma.blogTopic.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      translations: {
        orderBy: { locale: "asc" },
      },
      _count: { select: { posts: true } },
    },
  });

  const initialTopics = topics.map((topic) => {
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

  return (
    <div className="p-6">
      <BlogTopicsManagement initialTopics={initialTopics} />
    </div>
  );
}
