import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

function isNonEmptyString(v: unknown, min = 1) {
  return typeof v === "string" && v.trim().length >= min;
}

function isInt(v: unknown) {
  return typeof v === "number" && Number.isInteger(v);
}

type PutPlanInput = {
  name: string;
  description?: string | null;
  priceCents: number;
  bulletsFr: string;
  bulletsEn: string;
  sortOrder?: number;
  isActive?: boolean;
};

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        priceCents: true,
        bulletsFr: true,
        bulletsEn: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!plan) return jsonError(404, "Plan not found");
    return NextResponse.json({ success: true, data: plan });
  } catch (error: any) {
    console.error("GET /api/pricing/plans/[id] error:", error);
    return jsonError(500, "Failed to fetch plan", error?.message ?? "Unknown error");
  }
}

/**
 * PUT = update complet (on attend tous les champs obligatoires)
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as Partial<PutPlanInput>;

    const errors: Record<string, string> = {};

    if (!isNonEmptyString(body.name, 2)) errors.name = "name requis (min 2 caractères)";

    if (body.description != null && typeof body.description !== "string")
      errors.description = "description doit être string ou null";

    if (!isInt(body.priceCents) || (body.priceCents as number) < 0)
      errors.priceCents = "priceCents doit être un entier >= 0";

    if (!isNonEmptyString(body.bulletsFr, 1)) errors.bulletsFr = "bulletsFr requis";
    if (!isNonEmptyString(body.bulletsEn, 1)) errors.bulletsEn = "bulletsEn requis";

    if (body.sortOrder != null && (!isInt(body.sortOrder) || (body.sortOrder as number) < 0))
      errors.sortOrder = "sortOrder doit être un entier >= 0";

    if (body.isActive != null && typeof body.isActive !== "boolean")
      errors.isActive = "isActive doit être un booléen";

    if (Object.keys(errors).length) return jsonError(400, "Validation failed", errors);

    const updated = await prisma.plan.update({
      where: { id: params.id },
      data: {
        name: body.name!.trim(),
        description: body.description?.trim() || null,
        priceCents: body.priceCents!,
        bulletsFr: body.bulletsFr!,
        bulletsEn: body.bulletsEn!,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        priceCents: true,
        bulletsFr: true,
        bulletsEn: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/pricing/plans/[id] error:", error);
    if (error?.code === "P2025") return jsonError(404, "Plan not found");
    return jsonError(500, "Failed to update plan", error?.message ?? "Unknown error");
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.plan.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/pricing/plans/[id] error:", error);
    if (error?.code === "P2025") return jsonError(404, "Plan not found");
    return jsonError(500, "Failed to delete plan", error?.message ?? "Unknown error");
  }
}
