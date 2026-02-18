// src/lib/billing/invoice-service.ts
import { prisma } from "@/lib/prisma";

export async function ensureInvoiceForPlanSubscription(args: {
  workspaceId: string;
  workspacePlanSubscriptionId: string;
  amountCents: number; // XOF integer
  currency?: string;
  metadata?: unknown;
}) {
  const {
    workspaceId,
    workspacePlanSubscriptionId,
    amountCents,
    currency = "XOF",
    metadata,
  } = args;

  const existing = await prisma.invoice.findUnique({
    where: { workspacePlanSubscriptionId }, // @@unique([workspacePlanSubscriptionId])
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      issuedAt: true,
      workspaceId: true,
      workspacePlanSubscriptionId: true,
      workspaceCreditTransactionId: true,
      amountCents: true,
      currency: true,
      metadata: true,
    },
  });

  if (existing) {
    return await prisma.invoice.update({
      where: { id: existing.id },
      data: {
        amountCents,
        currency,
        metadata: (metadata as any) ?? null,
      },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issuedAt: true,
        workspaceId: true,
        workspacePlanSubscriptionId: true,
        workspaceCreditTransactionId: true,
        amountCents: true,
        currency: true,
        metadata: true,
      },
    });
  }

  try {
    return await prisma.invoice.create({
      data: {
        workspace: { connect: { id: workspaceId } },
        workspacePlanSubscription: { connect: { id: workspacePlanSubscriptionId } },
        amountCents,
        currency,
        metadata: (metadata as any) ?? null,
        // ✅ workspaceCreditTransactionId reste NULL => OK (1 source)
      },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issuedAt: true,
        workspaceId: true,
        workspacePlanSubscriptionId: true,
        workspaceCreditTransactionId: true,
        amountCents: true,
        currency: true,
        metadata: true,
      },
    });
  } catch (e: any) {
    const fallback = await prisma.invoice.findUnique({
      where: { workspacePlanSubscriptionId },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issuedAt: true,
        workspaceId: true,
        workspacePlanSubscriptionId: true,
        workspaceCreditTransactionId: true,
        amountCents: true,
        currency: true,
        metadata: true,
      },
    });

    if (fallback) return fallback;
    throw e;
  }
}

/**
 * ✅ IMPORTANT:
 * Pour satisfaire invoice_one_source_chk, une invoice "credits_topup"
 * DOIT avoir workspaceCreditTransactionId défini.
 */
export async function ensureInvoiceForCreditTopup(args: {
  workspaceId: string;
  workspaceCreditTransactionId: string; // ✅ REQUIRED
  amountCents: number; // XOF integer
  currency?: string;
  metadata?: unknown;
}) {
  const {
    workspaceId,
    workspaceCreditTransactionId,
    amountCents,
    currency = "XOF",
    metadata,
  } = args;

  // si tu veux éviter doublons: @@unique([workspaceCreditTransactionId]) existe déjà
  // donc create suffira. En cas de race: catch + findUnique.
  try {
    return await prisma.invoice.create({
      data: {
        workspace: { connect: { id: workspaceId } },
        workspaceCreditTransaction: { connect: { id: workspaceCreditTransactionId } },
        amountCents,
        currency,
        metadata: (metadata as any) ?? null,
        // ✅ workspacePlanSubscriptionId reste NULL => OK (1 source)
      },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issuedAt: true,
        workspaceId: true,
        workspacePlanSubscriptionId: true,
        workspaceCreditTransactionId: true,
        amountCents: true,
        currency: true,
        metadata: true,
      },
    });
  } catch (e: any) {
    const fallback = await prisma.invoice.findUnique({
      where: { workspaceCreditTransactionId }, // @@unique([workspaceCreditTransactionId])
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issuedAt: true,
        workspaceId: true,
        workspacePlanSubscriptionId: true,
        workspaceCreditTransactionId: true,
        amountCents: true,
        currency: true,
        metadata: true,
      },
    });
    if (fallback) return fallback;
    throw e;
  }
}
