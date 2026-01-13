//src/app/api/workspaces/invitations/resolve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 });
    }

    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: { workspace: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "Cette invitation n'est plus valide" }, { status: 400 });
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: "expired" },
      });
      return NextResponse.json({ error: "Cette invitation a expiré" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
      select: { id: true },
    });

    return NextResponse.json(
      {
        ok: true,
        token,
        email: invitation.email,
        hasAccount: Boolean(existingUser),
        workspace: {
          id: invitation.workspaceId,
          slug: invitation.workspace.slug,
          name: invitation.workspace.name,
        },
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("/api/workspaces/invitations/resolve error", e);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
