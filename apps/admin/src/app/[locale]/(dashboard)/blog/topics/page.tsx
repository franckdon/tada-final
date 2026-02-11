import { prisma } from "@/lib/prisma";
import { BlogTopicsManagement } from "@/components/blog/topics/blog-topics-management";

export const metadata = {
  title: "Topics du Blog | Tada",
};

export default async function BlogTopicsPage() {
  const topics = await prisma.blogTopic.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { posts: true } },
    },
  });

  return (
    <div className="p-6">
      <BlogTopicsManagement initialTopics={topics} />
    </div>
  );
}
