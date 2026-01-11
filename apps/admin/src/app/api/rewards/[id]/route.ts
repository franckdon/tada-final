import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/rewards/[id]
 * Récupère une configuration de récompense
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reward = await prisma.rewardConfig.findUnique({
      where: { id: params.id },
      include: {
        history: {
          take: 10,
          orderBy: { awardedAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!reward) {
      return NextResponse.json(
        {
          success: false,
          error: "Reward configuration not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: reward,
    });
  } catch (error) {
    console.error("Error fetching reward:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reward",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/rewards/[id]
 * Met à jour une configuration de récompense
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, description, type, trigger, value, status, conditions } = body;

    const reward = await prisma.rewardConfig.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(trigger && { trigger }),
        ...(value !== undefined && { value: parseInt(value) }),
        ...(status && { status }),
        ...(conditions !== undefined && { conditions }),
      },
    });

    return NextResponse.json({
      success: true,
      data: reward,
      message: "Reward configuration updated successfully",
    });
  } catch (error) {
    console.error("Error updating reward:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update reward",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rewards/[id]
 * Supprime une configuration de récompense
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.rewardConfig.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Reward configuration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reward:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete reward",
      },
      { status: 500 }
    );
  }
}
