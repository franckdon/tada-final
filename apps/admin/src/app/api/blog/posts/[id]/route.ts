import { prisma } from "@/lib/prisma";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const title = String(body.title ?? "").trim();

  const slug =
    body.slug?.trim() || (title ? slugify(title) : undefined);

  const updated = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      topicId: body.topicId ?? null,
      title,
      slug,
      excerpt: body.excerpt ?? null,
      content: body.content ?? "",
      coverPath: body.coverPath ?? null,
      status: body.status ?? "draft",
      publishedAt:
        body.status === "published" ? new Date() : null,
    },
    include: {
      topic: true,
    },
  });

  return Response.json({ data: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.blogPost.delete({
    where: { id: params.id },
  });

  return Response.json({ ok: true });
}
