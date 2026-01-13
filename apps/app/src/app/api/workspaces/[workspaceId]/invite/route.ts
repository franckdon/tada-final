// app/api/workspaces/[workspaceId]/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { assertWorkspaceAdmin } from "@/lib/workspaces";
import { transporter } from "@/lib/transporter";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, role } = body as {
      email: string;
      role?: string;
    };

    if (!email) {
      return NextResponse.json(
        { error: "L'email est obligatoire" },
        { status: 400 },
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace introuvable" },
        { status: 404 },
      );
    }

    try {
      await assertWorkspaceAdmin(workspaceId, user.id);
    } catch (e) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const existingMembership = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: existingUser.id,
          status: "active",
        },
      });

      if (existingMembership) {
        return NextResponse.json(
          { error: "Cet utilisateur est déjà membre du workspace" },
          { status: 400 },
        );
      }
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        email,
        role: role || "member",
        token,
        status: "pending",
        expiresAt,
        invitedById: user.id,
      },
    });

    const inviteUrl = `${APP_URL}/fr/invitations/accept?token=${token}`;

    console.log("====================================");
    console.log("🔐 Email confirm link (LOCAL) :");
    console.log(inviteUrl);
    console.log("====================================");

    try {
      await transporter.sendMail({
        from: "no-reply@monrezo.net",
        to: [email],
        subject: `[Tada] Invitation à rejoindre un workspace`,
        html: `
          <p>Bonjour,</p>
          <p>${user.name || user.email} vous a invité à rejoindre le workspace <b>${workspace.name}</b> sur Tada.</p>
          <p>Cliquez sur le lien ci-dessous pour accepter l'invitation :</p>
          <p><a href="${inviteUrl}">${inviteUrl}</a></p>
          <p>Ce lien expire le ${expiresAt.toLocaleDateString("fr-FR")}.</p>
        `,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email d'invitation :", error);
    }

    return NextResponse.json(
      {
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          ...(process.env.NODE_ENV !== "production" && {
            token: invitation.token,
          }),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur /api/workspaces/[workspaceId]/invite", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérif admin/owner
    try {
      await assertWorkspaceAdmin(workspaceId, user.id);
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const invitationId = body?.invitationId as string | undefined;

    if (!invitationId) {
      return NextResponse.json(
        { error: "invitationId est requis" },
        { status: 400 },
      );
    }

    const invitation = await prisma.workspaceInvitation.findFirst({
      where: {
        id: invitationId,
        workspaceId,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation introuvable" },
        { status: 404 },
      );
    }

    // Soit on supprime, soit on "annule" (soft delete).
    // Ici je supprime vraiment, tu peux passer en update({ status: "cancelled" }) si tu veux garder l'historique.
    await prisma.workspaceInvitation.delete({
      where: { id: invitationId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(
      "Erreur DELETE /api/workspaces/[workspaceId]/invite",
      error,
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}