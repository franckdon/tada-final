import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { workspaceId: string; missionId: string } },
) {
  const { workspaceId, missionId } = params;
  const debug = req.nextUrl.searchParams.get("debug"); // ?debug=1 pour debug

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1) Récupérer la mission
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
  });

  if (!mission) {
    return NextResponse.json({ error: "Mission not found" }, { status: 404 });
  }

  // 2) Vérifier qu’elle appartient bien à ce workspace
  if (mission.workspaceId !== workspaceId) {
    const payload = {
      error: "Mission does not belong to this workspace",
      missionWorkspaceId: mission.workspaceId,
      requestedWorkspaceId: workspaceId,
    };

    if (debug === "1") {
      return NextResponse.json(payload, { status: 400 });
    }

    return NextResponse.json(
      { error: payload.error },
      { status: 400 },
    );
  }

  // 3) Récupérer le workspace + le rôle de l’utilisateur dans ce workspace
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      ownerId: true,
      members: {
        where: { userId: user.id },
        select: { role: true, userId: true },
      },
    },
  });

  if (!workspace) {
    return NextResponse.json(
      { error: "Workspace not found" },
      { status: 404 },
    );
  }

  const memberRole = workspace.members[0]?.role;
  const isWorkspaceOwner = workspace.ownerId === user.id;
  const isWorkspaceAdmin =
    memberRole && ["owner", "admin"].includes(memberRole);

  const debugPayload = {
    userId: user.id,
    missionId,
    missionStatus: mission.status,
    missionWorkspaceId: mission.workspaceId,
    requestedWorkspaceId: workspaceId,
    workspaceOwnerId: workspace.ownerId,
    memberRole: memberRole ?? null,
    isWorkspaceOwner,
    isWorkspaceAdmin,
  };

  // Log serveur (dans la console de ton process Next.js)
  console.log("[DELETE_MISSION_DEBUG]", debugPayload);

  // Si tu ajoutes ?debug=1 à l’URL, on renvoie les infos au lieu de supprimer
  if (debug === "1") {
    return NextResponse.json(
      {
        debug: debugPayload,
        note:
          "Mode debug activé: aucune suppression effectuée. Enlève ?debug=1 pour faire la vraie suppression.",
      },
      { status: 200 },
    );
  }

  if (!isWorkspaceOwner && !isWorkspaceAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 4) Règles métier sur le statut
  // Ici on gère bien "on hold" (avec espace)
  if (!["draft", "on hold"].includes(mission.status ?? "")) {
    return NextResponse.json(
      {
        error:
          "Mission cannot be deleted unless it is in draft or on hold status.",
      },
      { status: 400 },
    );
  }

  // 5) Suppression
  await prisma.mission.delete({
    where: { id: missionId },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
