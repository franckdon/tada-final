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

type CreatePlanInput = {
  name: string;
  description?: string | null;
  priceCents: number;
  bulletsFr: string;
  bulletsEn: string;
  sortOrder?: number;
  isActive?: boolean;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CreatePlanInput>;

    const errors: Record<string, string> = {};

    if (!isNonEmptyString(body.name, 2)) errors.name = "name requis (min 2 caractères)";
    if (body.description != null && typeof body.description !== "string")
      errors.description = "description doit être une string ou null";

    if (!isInt(body.priceCents) || (body.priceCents as number) < 0)
      errors.priceCents = "priceCents doit être un entier >= 0";

    if (!isNonEmptyString(body.bulletsFr, 1)) errors.bulletsFr = "bulletsFr requis";
    if (!isNonEmptyString(body.bulletsEn, 1)) errors.bulletsEn = "bulletsEn requis";

    if (body.sortOrder != null && (!isInt(body.sortOrder) || (body.sortOrder as number) < 0))
      errors.sortOrder = "sortOrder doit être un entier >= 0";

    if (body.isActive != null && typeof body.isActive !== "boolean")
      errors.isActive = "isActive doit être un booléen";

    if (Object.keys(errors).length) return jsonError(400, "Validation failed", errors);

    const created = await prisma.plan.create({
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

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/pricing/plans error:", error);
    return jsonError(500, "Failed to create plan", error?.message ?? "Unknown error");
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "10", 10), 1), 100);
    const skip = (page - 1) * limit;

    const search = (searchParams.get("search") || "").trim();
    const isActiveParam = searchParams.get("isActive"); // "true" | "false" | null
    const sort = (searchParams.get("sort") || "sortOrder").trim(); // sortOrder | createdAt | price
    const dir = (searchParams.get("dir") || "asc").trim().toLowerCase(); // asc|desc

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { bulletsFr: { contains: search, mode: "insensitive" } },
        { bulletsEn: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActiveParam === "true") where.isActive = true;
    if (isActiveParam === "false") where.isActive = false;

    const direction = dir === "desc" ? "desc" : "asc";
    const orderBy: any[] = [];

    if (sort === "createdAt") orderBy.push({ createdAt: direction });
    else if (sort === "price") orderBy.push({ priceCents: direction });
    else orderBy.push({ sortOrder: direction });

    orderBy.push({ createdAt: "desc" }); // fallback stable

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
      }),
      prisma.plan.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: plans,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("GET /api/pricing/plans error:", error);
    return jsonError(500, "Failed to fetch plans", error?.message ?? "Unknown error");
  }
}
