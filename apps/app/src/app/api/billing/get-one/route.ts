// src/app/api/billing/get-one/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GetBillingInfoSchema = z.object({
  organizationId: z.string().min(1),
  workspaceId: z.string().min(1).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const organizationId = searchParams.get("organizationId") ?? "";
  const workspaceId = searchParams.get("workspaceId") ?? undefined;

  const parsed = GetBillingInfoSchema.safeParse({ organizationId, workspaceId });

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Paramètres invalides",
        issues: parsed.error.format(),
      },
      { status: 400 }
    );
  }

  try {
    const [billingInfo, workspaceAccount] = await Promise.all([
      prisma.billingInfo.findUnique({
        where: { organizationId: parsed.data.organizationId },
      }),
      parsed.data.workspaceId
        ? prisma.workspaceCreditAccount.findUnique({
            where: { workspaceId: parsed.data.workspaceId },
            select: {
              workspaceId: true,
              balance: true,
              currency: true,
              updatedAt: true,
            },
          })
        : Promise.resolve(null),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          billingInfo,
          workspaceCredits: workspaceAccount
            ? {
                workspaceId: workspaceAccount.workspaceId,
                balance: workspaceAccount.balance,
                currency: workspaceAccount.currency,
                updatedAt: workspaceAccount.updatedAt,
              }
            : null,
        },
      },
      {
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("[GET_BILLING_INFO_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
