// src/app/api/organizations/[organizationId]/subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;

    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json(
        { subscription: null, plan: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { subscription, plan: subscription.plan },
      { status: 200 }
    );
  } catch (err) {
    console.error("Subscription lookup failed", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
