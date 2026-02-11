import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const topics = await prisma.blogTopic.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { posts: true } } },
  });
  return NextResponse.json({ data: topics });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const key = String(body?.key || "").trim();
    const label = String(body?.label || "").trim();
    const order = Number(body?.order || 0);
    const isActive = typeof body?.isActive === "boolean" ? body.isActive : true;

    if (!key || !label) {
      return NextResponse.json({ error: "key et label sont requis" }, { status: 400 });
    }

    const created = await prisma.blogTopic.create({
      data: { key, label, order, isActive },
      include: { _count: { select: { posts: true } } },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e: any) {
    const msg = e?.message || "Erreur serveur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
