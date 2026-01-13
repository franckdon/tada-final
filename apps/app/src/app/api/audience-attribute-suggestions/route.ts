// src/app/api/audience-attribute-suggestions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      organizationId,
      missionId,
      groupId,
      filterId,
      label,
      description,
      createdById,
    } = body;

    if (!organizationId || !label) {
      return NextResponse.json(
        { error: "organizationId and label are required" },
        { status: 400 }
      );
    }

    const suggestion = await prisma.audienceAttributeSuggestion.create({
      data: {
        organizationId,
        missionId: missionId || null,
        groupId: groupId || null,
        filterId: filterId || null,
        label,
        description: description || null,
        createdById: createdById || null,
      },
    });

    return NextResponse.json(suggestion, { status: 201 });
  } catch (error) {
    console.error("Error creating audience attribute suggestion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
