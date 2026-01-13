//src/app/api/workspaces/[workspaceId]/members/[memberId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { assertWorkspaceAdmin } from "@/lib/workspaces";

type RouteParams = {
  params: {
    workspaceId: string;
    memberId: string;
  };
};

/**
 * PATCH /api/workspaces/[workspaceId]/members/[memberId]
 * Change le rôle d’un membre du workspace
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId, memberId } = params;

    // Vérifier que le user est admin/owner dans CE workspace
    try {
      await assertWorkspaceAdmin(workspaceId, user.id);
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { role } = body as { role?: string };

    if (!role || typeof role !== "string") {
      return NextResponse.json(
        { error: "Le rôle est obligatoire" },
        { status: 400 },
      );
    }

    // On s'assure que ce membership appartient bien à ce workspace
    const member = await prisma.workspaceMember.findFirst({
      where: {
        id: memberId,
        workspaceId,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Membre introuvable dans ce workspace" },
        { status: 404 },
      );
    }

    const updated = await prisma.workspaceMember.update({
      where: { id: member.id },
      data: {
        role,
      },
    });

    return NextResponse.json(
      {
        success: true,
        member: updated,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "[WORKSPACE_MEMBER_PATCH] error",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/members/[memberId]
 * Retire un membre du workspace (soft : status = "removed")
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId, memberId } = params;

    // Vérifier que le user est admin/owner dans CE workspace
    try {
      await assertWorkspaceAdmin(workspaceId, user.id);
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const member = await prisma.workspaceMember.findFirst({
      where: {
        id: memberId,
        workspaceId,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Membre introuvable dans ce workspace" },
        { status: 404 },
      );
    }

    // TODO (optionnel) : empêcher de retirer le dernier "owner"

    const updated = await prisma.workspaceMember.update({
      where: { id: member.id },
      data: {
        status: "removed",
      },
    });

    return NextResponse.json(
      {
        success: true,
        member: updated,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "[WORKSPACE_MEMBER_DELETE] error",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
