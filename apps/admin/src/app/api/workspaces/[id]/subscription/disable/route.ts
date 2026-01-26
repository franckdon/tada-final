import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.id;
    const body = await req.json().catch(() => ({}));
    const note = body?.note ? String(body.note).trim() : null;

    const existing = await prisma.workspacePlanSubscription.findUnique({
      where: { workspaceId },
      select: { id: true, status: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "No subscription found for this workspace" },
        { status: 404 },
      );
    }

    const sub = await prisma.workspacePlanSubscription.update({
      where: { workspaceId },
      data: {
        status: "inactive",
        // IMPORTANT: on ne change pas startsAt/endsAt -> on garde la période payée,
        // mais l'accès est coupé car status=inactive.
        note,
        assignedByUserId: session.user.id,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        planCode: true,
        status: true,
        startsAt: true,
        endsAt: true,
        note: true,
        source: true,
        assignedByUser: { select: { id: true, name: true, email: true } },
        updatedAt: true,
      },
    });

    return NextResponse.json({ subscription: sub }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unexpected error" },
      { status: 500 },
    );
  }
}
