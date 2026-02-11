// apps/admin/src/app/api/contributors/module-rewards/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ORDERED_MODULE_KEYS } from "@/lib/contributor-modules-config";

const ModuleKeySchema = z.string().min(1);

const CreateSchema = z.object({
  moduleKey: ModuleKeySchema,
  moduleLabel: z.string().min(1),
  order: z.number().int().min(1),
  dependsOn: z.string().min(1).nullable().optional(),
  rewardXof: z.number().int().min(0),
  isActive: z.boolean(),
});

export async function GET() {
  const rows = await prisma.contributorModuleRewardConfig.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // validation basique "dependsOn doit être un module connu"
  if (data.dependsOn && !ORDERED_MODULE_KEYS.includes(data.dependsOn as any)) {
    return NextResponse.json(
      { error: "dependsOn invalide" },
      { status: 400 }
    );
  }

  // validation : pas de boucle directe (dependsOn === moduleKey)
  if (data.dependsOn && data.dependsOn === data.moduleKey) {
    return NextResponse.json(
      { error: "Un module ne peut pas dépendre de lui-même" },
      { status: 400 }
    );
  }

  try {
    const created = await prisma.contributorModuleRewardConfig.create({
      data: {
        moduleKey: data.moduleKey,
        moduleLabel: data.moduleLabel,
        order: data.order,
        dependsOn: data.dependsOn ?? null,
        rewardXof: data.rewardXof,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e: any) {
    // unique constraint moduleKey
    return NextResponse.json(
      { error: "Impossible de créer (moduleKey déjà existant ?)" },
      { status: 409 }
    );
  }
}
