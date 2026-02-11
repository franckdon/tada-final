import { prisma } from "@/lib/prisma";
import { BlogPostForm } from "@/components/blog/blog-post-form";

export const metadata = { title: "New Post | Blog Admin" };

export default async function NewBlogPostPage() {
  const topics = await prisma.blogTopic.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { label: "asc" }],
  });

  return (
    <div className="p-6">
      <BlogPostForm mode="create" topics={topics} />
    </div>
  );
}
