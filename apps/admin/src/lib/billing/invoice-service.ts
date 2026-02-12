// src/lib/billing/invoice-service.ts
import { prisma } from "@/lib/prisma";

export async function ensureInvoiceForPlanSubscription(args: {
  workspaceId: string;
  workspacePlanSubscriptionId: string;
  amountCents: number;
  currency?: string;  
  metadata?: unknown;
}) {
  const { workspaceId, workspacePlanSubscriptionId, amountCents, currency = "XOF", metadata } = args;

  // 1) idempotent: si existe déjà, on renvoie
  const existing = await prisma.invoice.findUnique({
    where: { workspacePlanSubscriptionId }, // ok car @@unique([workspacePlanSubscriptionId])
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      issuedAt: true,
      workspaceId: true,
      workspacePlanSubscriptionId: true,
      amountCents: true,
      currency: true,
    },
  });

  if (existing) return existing;

  // 2) create (invoiceNumber généré par la DB)
  try {
    return await prisma.invoice.create({
      data: {
        workspace: { connect: { id: workspaceId } },
        workspacePlanSubscription: {
          connect: { id: workspacePlanSubscriptionId },
        },
        metadata: (metadata as any) ?? null,
        amountCents,
        currency,
      },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issuedAt: true,
        workspaceId: true,
        workspacePlanSubscriptionId: true,
      },
    });
  } catch (e: any) {
    // 3) race condition (unique constraint) => re-fetch
    const fallback = await prisma.invoice.findUnique({
      where: { workspacePlanSubscriptionId },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issuedAt: true,
        workspaceId: true,
        workspacePlanSubscriptionId: true,
        amountCents: true,
        currency: true,
      },
    });

    if (fallback) return fallback;
    throw e;
  }
}
