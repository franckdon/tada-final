import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function jsonError(status: number, message: string, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

type PlanCode = "starter" | "growth" | "business" | "entreprise";
const ALLOWED_CODES: PlanCode[] = ["starter", "growth", "business", "entreprise"];

function bulletsToFeatures(text: string) {
  const lines = (text ?? "")
    .split("\n")
    .map((x) => x.trim().replace(/^\-\s*/, ""))
    .filter(Boolean);

  return lines.map((t) => ({ text: t, included: true }));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = (searchParams.get("locale") || "fr").toLowerCase();
    const isEn = locale.startsWith("en");

    const plans = await prisma.plan.findMany({
      where: {
        isActive: true,
        code: { in: ALLOWED_CODES },
      },
      orderBy: [{ sortOrder: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        priceCents: true,
        bulletsFr: true,
        bulletsEn: true,
        sortOrder: true,
      },
    });

    const data = plans.map((p) => ({
      id: p.id,
      code: p.code as PlanCode,
      name: p.name,
      description: p.description,
      price: p.priceCents / 100,
      currency: "EUR",
      interval: "year",
      features: bulletsToFeatures(isEn ? p.bulletsEn : p.bulletsFr),
      bulletsFr: p.bulletsFr,
      bulletsEn: p.bulletsEn,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("GET /api/plans error:", error);
    return jsonError(500, "Failed to fetch plans", error?.message ?? "Unknown error");
  }
}
