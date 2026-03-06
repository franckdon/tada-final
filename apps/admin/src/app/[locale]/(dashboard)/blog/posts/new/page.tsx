import { prisma } from "@/lib/prisma";
import { BlogPostForm } from "@/components/blog/blog-post-form";

export const metadata = {
  title: "Nouvel article | Blog Admin",
};

export default async function NewBlogPostPage() {
  const topicsRaw = await prisma.blogTopic.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
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

  return (
    <div className="p-6">
      <BlogPostForm mode="create" topics={topics} />
    </div>
  );
}
