import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const id = params.id;

  try {
    await prisma.$transaction(async (tx) => {
      // 1) supprimer ce qui référence workspace
      await tx.mission.deleteMany({ where: { workspaceId: id } });

      // 2) supprimer les autres dépendances directes du workspace si besoin
      await tx.workspaceMember.deleteMany({ where: { workspaceId: id } });
      await tx.workspaceInvitation.deleteMany({ where: { workspaceId: id } });

      // 3) enfin, delete workspace
      await tx.workspace.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: "Delete failed", code: e?.code },
      { status: 500 },
    );
  }
}
