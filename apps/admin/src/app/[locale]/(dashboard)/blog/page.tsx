import { prisma } from "@/lib/prisma";
import { BlogManagement } from "@/components/blog/blog-management";

export const metadata = { title: "Blog | Admin" };

export default async function BlogAdminPage() {
  const topics = await prisma.blogTopic.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { label: "asc" }],
  });

  const posts = await prisma.blogPost.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { topic: true },
  });

  return (
    <div className="p-6">
      <BlogManagement initialTopics={topics} initialPosts={posts} />
    </div>
  );
}
