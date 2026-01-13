// src/app/api/custom-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});


const BodySchema = z.object({
  credits: z.number().int().positive().max(1_000_000),
  unitPrice: z.number().positive().max(10_000),
  currency: z
    .string()
    .default("eur")
    .transform((v) => v.toLowerCase())
    .refine((v) => ["eur", "usd", "gbp"].includes(v), "Unsupported currency"),
  workspaceId: z.string().min(1),
  organizationId: z.string().min(1).optional().nullable(),
  user: z.object({
    id: z.string().min(1),
    email: z.string().email(),
    name: z.string().optional().nullable(),
  }),
  // strongly recommended for Stripe idempotency
  metadata: z
    .object({
      requestId: z.string().min(8).optional(), // ideally uuid
    })
    .passthrough()
    .optional()
    .default({}),
});

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function POST(req: NextRequest) {
  try {
    requireEnv("STRIPE_SECRET_KEY");
    requireEnv("NEXT_PUBLIC_APP_URL");

    const json = await req.json();
    const parsed = BodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      credits,
      unitPrice,
      currency,
      workspaceId,
      organizationId,
      user,
      metadata,
    } = parsed.data;

    // SECURITY: verify the caller is authenticated and matches the payload user
    // If you want to allow guest checkout, remove this block (not recommended).
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.id !== user.id || session.user.email !== user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // SECURITY: verify workspace exists and caller has access
    // Adjust the membership relation names to match your schema if needed.
    const ws = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        organizationId: true,
        ownerId: true,
        members: { select: { userId: true, status: true } },
      },
    });

    if (!ws) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const isOwner = ws.ownerId === user.id;
    const isActiveMember = ws.members.some(
      (m) => m.userId === user.id && m.status === "active"
    );

    if (!isOwner && !isActiveMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If client sent organizationId, ensure it matches the workspace’s organization
    if (organizationId && ws.organizationId && organizationId !== ws.organizationId) {
      return NextResponse.json(
        { error: "organizationId does not match workspace.organizationId" },
        { status: 400 }
      );
    }

    const totalAmountCents = Math.round(credits * unitPrice * 100);
    if (totalAmountCents <= 0) {
      return NextResponse.json({ error: "Invalid total amount" }, { status: 400 });
    }

    // Stripe customer lookup/create
    let customer: Stripe.Customer;
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]!;
      // Optional: keep metadata up to date
      await stripe.customers.update(customer.id, {
        name: user.name ?? undefined,
        metadata: {
          userId: user.id,
          ...(ws.organizationId ? { organizationId: ws.organizationId } : {}),
        },
      });
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: {
          userId: user.id,
          ...(ws.organizationId ? { organizationId: ws.organizationId } : {}),
        },
      });
    }

    // Strongly recommended: idempotency (client should pass metadata.requestId)
    // This prevents duplicate sessions if user double-clicks or network retries.
    const idempotencyKey = metadata.requestId
      ? `wca:${workspaceId}:${user.id}:${metadata.requestId}`
      : crypto.randomUUID();

    const checkoutSession = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer: customer.id,
        payment_method_types: ["card"],

        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: `${credits} crédits de recherche`,
                description: `Achat de ${credits} crédits à ${(unitPrice).toFixed(
                  2
                )} ${currency.toUpperCase()} l'unité`,
                metadata: {
                  type: "workspace_credits",
                  workspaceId,
                  ...(ws.organizationId ? { organizationId: ws.organizationId } : {}),
                },
              },
              unit_amount: Math.round(unitPrice * 100),
            },
            quantity: credits,
          },
        ],

        metadata: {
          type: "workspace_credits",
          workspaceId,
          ...(ws.organizationId ? { organizationId: ws.organizationId } : {}),
          actorUserId: user.id,
          userEmail: user.email,
          credits: String(credits),
          unitPriceCents: String(Math.round(unitPrice * 100)),
          amountTotalCents: String(totalAmountCents),
          ...(metadata ?? {}),
        },

        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/custom-billing-success?session_id={CHECKOUT_SESSION_ID}&type=workspace_credits`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,

        invoice_creation: {
          enabled: true,
          invoice_data: {
            description: `Achat de ${credits} crédits de recherche`,
            metadata: {
              type: "workspace_credits",
              workspaceId,
              ...(ws.organizationId ? { organizationId: ws.organizationId } : {}),
              credits: String(credits),
            },
          },
        },

        customer_update: { address: "auto", name: "auto" },
      },
      { idempotencyKey }
    );

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      amountCents: totalAmountCents,
      credits,
      currency,
    });
  } catch (error) {
    console.error("Error creating custom payment session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
