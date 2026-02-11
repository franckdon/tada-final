import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id;
    const body = await req.json().catch(() => ({}));

    const data: any = {};
    if (typeof body?.label === "string") data.label = body.label.trim();
    if (typeof body?.key === "string") data.key = body.key.trim();
    if (typeof body?.order !== "undefined") data.order = Number(body.order || 0);
    if (typeof body?.isActive === "boolean") data.isActive = body.isActive;

    const updated = await prisma.blogTopic.update({
      where: { id },
      data,
      include: { _count: { select: { posts: true } } },
    });

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    const msg = e?.message || "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id;

    // ✅ détacher les posts
    await prisma.blogPost.updateMany({
      where: { topicId: id },
      data: { topicId: null },
    });

    await prisma.blogTopic.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message || "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
