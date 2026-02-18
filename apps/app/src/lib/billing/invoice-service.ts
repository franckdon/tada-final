// src/lib/billing/invoice-service.ts
import { prisma } from "@/lib/prisma";

export async function ensureInvoiceForPlanSubscription(args: {
  workspaceId: string;
  workspacePlanSubscriptionId: string;
  amountCents: number; // treated as XOF integer
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
        // issuedAt: new Date(), // optionnel: si tu veux "ré-émettre" la facture à chaque assign
      },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issuedAt: true,
        workspaceId: true,
        workspacePlanSubscriptionId: true,
        amountCents: true,
        currency: true,
        metadata: true,
      },
    });
  }

  // 2) create (invoiceNumber généré par la DB)
  try {
    return await prisma.invoice.create({
      data: {
        workspace: { connect: { id: workspaceId } },
        workspacePlanSubscription: { connect: { id: workspacePlanSubscriptionId } },
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
        amountCents: true,
        currency: true,
        metadata: true,
      },
    });
  } catch (e: any) {
    // race condition -> fetch
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
        metadata: true,
      },
    });

    if (fallback) return fallback;
    throw e;
  }
}

export async function ensureInvoiceForCreditTopup(args: {
  workspaceId: string;
  amountCents: number; // XOF integer
  currency?: string;
  metadata?: unknown;
}) {
  const { workspaceId, amountCents, currency = "XOF", metadata } = args;

  return await prisma.invoice.create({
    data: {
      workspace: { connect: { id: workspaceId } },
      amountCents,
      currency,
      metadata: (metadata as any) ?? null,
      // workspacePlanSubscriptionId: null (si optionnel dans schema)
    },
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      issuedAt: true,
      workspaceId: true,
      workspacePlanSubscriptionId: true,
      amountCents: true,
      currency: true,
      metadata: true,
    },
  });
}