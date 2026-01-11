import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/workspaces/:workspaceId/missions
export async function GET(
  _req: Request,
  { params }: { params: { workspaceId: string } }
) {
  const { workspaceId } = params;

  if (!workspaceId) {
    return NextResponse.json(
      { error: "workspaceId is required" },
      { status: 400 }
    );
  }

  try {
    const missions = await prisma.mission.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
      // ajoute ici les select/include dont tu as besoin
      // select: { id: true, name: true, status: true, ... }
    });

    return NextResponse.json(missions);
  } catch (error) {
    console.error("[GET_MISSIONS_BY_WORKSPACE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
