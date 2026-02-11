// apps/admin/src/app/api/contributors/module-rewards/[id]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ORDERED_MODULE_KEYS } from "@/lib/contributor-modules-config";

const PatchSchema = z.object({
  moduleLabel: z.string().min(1).optional(),
  order: z.number().int().min(1).optional(),
  dependsOn: z.string().min(1).nullable().optional(),
  rewardXof: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;
  const body = await req.json();

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const patch = parsed.data;

  if (patch.dependsOn && !ORDERED_MODULE_KEYS.includes(patch.dependsOn as any)) {
    return NextResponse.json({ error: "dependsOn invalide" }, { status: 400 });
  }

  const current = await prisma.contributorModuleRewardConfig.findUnique({
    where: { id },
  });
  if (!current) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  if (patch.dependsOn && patch.dependsOn === current.moduleKey) {
    return NextResponse.json(
      { error: "Un module ne peut pas dépendre de lui-même" },
      { status: 400 }
    );
  }

  const updated = await prisma.contributorModuleRewardConfig.update({
    where: { id },
    data: {
      moduleLabel: patch.moduleLabel,
      order: patch.order,
      dependsOn: typeof patch.dependsOn === "undefined" ? undefined : patch.dependsOn,
      rewardXof: patch.rewardXof,
      isActive: patch.isActive,
    },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;

  const current = await prisma.contributorModuleRewardConfig.findUnique({
    where: { id },
  });
  if (!current) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  await prisma.contributorModuleRewardConfig.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
