// app/api/workspaces/invitations/dev-accept/route.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Cette route n'est pas disponible en production" },
        { status: 403 },
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accepter une invitation" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { token } = body as { token: string };

    if (!token) {
      return NextResponse.json(
        { error: "Token manquant" },
        { status: 400 },
      );
    }

    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation introuvable" },
        { status: 404 },
      );
    }

    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "Cette invitation n'est plus valide" },
        { status: 400 },
      );
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: "expired" },
      });
      return NextResponse.json(
        { error: "Cette invitation a expiré" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let membership = await tx.workspaceMember.findFirst({
        where: {
          workspaceId: invitation.workspaceId,
          userId: user.id,
        },
      });

      if (!membership) {
        membership = await tx.workspaceMember.create({
          data: {
            workspaceId: invitation.workspaceId,
            userId: user.id,
            role: invitation.role || "member",
            status: "active",
            invitedById: invitation.invitedById,
          },
        });
      } else if (membership.status !== "active") {
        membership = await tx.workspaceMember.update({
          where: { id: membership.id },
          data: {
            status: "active",
            role: invitation.role || membership.role,
          },
        });
      }

      await tx.workspaceInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "accepted",
          acceptedAt: new Date(),
        },
      });

      return { membership };
    });

    return NextResponse.json(
      {
        success: true,
        workspaceId: invitation.workspaceId,
        membership: result.membership,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("/api/workspaces/invitations/dev-accept error", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
