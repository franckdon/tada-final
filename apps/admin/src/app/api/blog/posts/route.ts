// apps/admin/src/app/api/blog/posts/route.ts
import { prisma } from "@/lib/prisma";


// apps/admin/src/app/api/blog/posts/route.ts (suite)
function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: Request) {
  const body = await req.json();

  const title = String(body.title ?? "").trim();
  const topicId = String(body.topicId ?? "");
  if (!title || !topicId) {
    return new Response(JSON.stringify({ error: "title et topicId requis" }), { status: 400 });
  }

  const slug = body.slug?.trim() ? String(body.slug) : slugify(title);

  const created = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt: body.excerpt ?? null,
      content: String(body.content ?? ""),
      coverPath: body.coverPath ?? null,
      status: body.status ?? "draft",
      publishedAt: body.status === "published" ? new Date() : null,
      topicId,
    },
    include: { topic: true },
  });

  return Response.json({ data: created });
}


export async function GET(req: Request) {
  const url = new URL(req.url);
  const topicKey = url.searchParams.get("topicKey");

  const posts = await prisma.blogPost.findMany({
    where: topicKey
      ? { topic: { key: topicKey } }
      : undefined,
    orderBy: [{ createdAt: "desc" }],
    include: { topic: true },
  });

  return Response.json({ data: posts });
}
