import { prisma } from "@/lib/prisma";
import { BlogPostForm } from "@/components/blog/blog-post-form";

export default async function EditBlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await prisma.blogPost.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    return <div>Article introuvable</div>;
  }

  const topics = await prisma.blogTopic.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }],
  });

  return (
    <div className="p-6">
      <BlogPostForm
        mode="edit"
        topics={topics}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverPath: post.coverPath,
          status: post.status,
          topicId: post.topicId,
        }}
      />
    </div>
  );
}
