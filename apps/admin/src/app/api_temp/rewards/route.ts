import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/rewards
 * Récupère toutes les configurations de récompenses
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const rewards = await prisma.rewardConfig.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: rewards,
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch rewards",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rewards
 * Crée une nouvelle configuration de récompense
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, type, trigger, value, status, conditions } = body;

    if (!name || !type || !trigger || value === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, type, trigger, value",
        },
        { status: 400 }
      );
    }

    const reward = await prisma.rewardConfig.create({
      data: {
        name,
        description: description || null,
        type,
        trigger,
        value: parseInt(value),
        status: status || "active",
        conditions: conditions || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: reward,
      message: "Reward configuration created successfully",
    });
  } catch (error) {
    console.error("Error creating reward:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create reward",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
