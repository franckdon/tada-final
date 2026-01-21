import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

/**
 * PATCH /api/pricing/plans/:id/active
 * Body optionnel:
 *  - { isActive: true/false } => set explicite
 *  - sinon => toggle automatique
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      body = null;
    }

    const current = await prisma.plan.findUnique({
      where: { id: params.id },
      select: { id: true, isActive: true },
    });
    if (!current) return jsonError(404, "Plan not found");

    const nextIsActive =
      typeof body?.isActive === "boolean" ? body.isActive : !current.isActive;

    const updated = await prisma.plan.update({
      where: { id: params.id },
      data: { isActive: nextIsActive },
      select: {
        id: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH /api/pricing/plans/[id]/active error:", error);
    if (error?.code === "P2025") return jsonError(404, "Plan not found");
    return jsonError(500, "Failed to toggle plan", error?.message ?? "Unknown error");
  }
}
