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

const ALLOWED_PLAN_CODES = new Set(["starter", "growth", "business", "entreprise"]);

function normalizePlanCode(v: string) {
  return v.trim().toLowerCase().replace(/\s+/g, "_");
}

function isAllowedPlanCode(code: string) {
  return ALLOWED_PLAN_CODES.has(code);
}

type PutPlanUpdateInput = {
  name: string;
  description?: string | null;
  priceCents: number;
  bulletsFr: string;
  bulletsEn: string;
  sortOrder?: number;
  isActive?: boolean;

  code?: string;
};

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        code: true, // NEW
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
 * PUT = update complet (on attend tous les champs obligatoires SAUF code)
 * Le code est NON modifiable.
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as Partial<PutPlanUpdateInput>;
    const errors: Record<string, string> = {};

    // ✅ Code: si présent, on refuse toute tentative de changement
    // (si tu préfères ignorer silencieusement, je te donne l’alternative après)
    if (body.code != null) {
      if (!isNonEmptyString(body.code, 2)) {
        errors.code = "code doit être une string non vide";
      } else {
        const incomingCode = normalizePlanCode(body.code);
        if (!isAllowedPlanCode(incomingCode)) {
          errors.code = "code invalide (starter|team|business|enterprise)";
        }
        // on vérifiera plus bas contre current.code si body.code est fourni
      }
    }

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

    // 1) Charger le plan existant pour verrouiller le code
    const current = await prisma.plan.findUnique({
      where: { id: params.id },
      select: { id: true, code: true },
    });
    if (!current) return jsonError(404, "Plan not found");

    // 2) Si quelqu’un envoie quand même code, on refuse s’il diffère
    if (body.code != null) {
      const incomingCode = normalizePlanCode(body.code);
      if (incomingCode !== current.code) {
        return jsonError(400, "Validation failed", {
          code: "code non modifiable.",
        });
      }
    }

    // 3) Update sans toucher code
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
        code: true,
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

    if (error?.code === "P2002") {
      const target = Array.isArray(error?.meta?.target) ? error.meta.target : [];
      return jsonError(409, "Duplicate value", {
        message: "Valeur dupliquée",
        target,
      });
    }

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
