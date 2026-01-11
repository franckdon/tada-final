// app/api/workspaces/[workspaceId]/credits/topup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  const { workspaceId } = params;
  const body = await req.json();
  const amount = Number(body?.amount ?? 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { success: false, error: "Invalid amount" },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const account = await tx.workspaceCreditAccount.upsert({
      where: { workspaceId },
      create: { workspaceId, balance: 0, currency: "EUR" },
      update: {},
      select: { id: true, balance: true },
    });

    const newBalance = account.balance + amount;

    await tx.workspaceCreditAccount.update({
      where: { workspaceId },
      data: { balance: newBalance },
    });

    await tx.workspaceCreditTransaction.create({
      data: {
        creditAccountId: account.id,
        direction: "credit",
        amount,
        reason: "topup",
        balanceAfter: newBalance,
      },
    });

    return { balance: newBalance };
  });

  return NextResponse.json({ success: true, data: result });
}
