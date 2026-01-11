//src/app/api/workspaces/[workspaceId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { assertWorkspaceAdmin } from "@/lib/workspaces";
import { uploadFileToSupabase, deleteFromSupabase } from "@/lib/uploads.server";
import { slugify } from "@/lib/slugify";

export const runtime = "nodejs";

async function ensureUniqueWorkspaceSlug(base: string, workspaceId: string) {
  const cleanBase = slugify(base) || `workspace-${Date.now()}`;

  // 1) try base
  const exists = await prisma.workspace.findFirst({
    where: { slug: cleanBase, NOT: { id: workspaceId } },
    select: { id: true },
  });
  if (!exists) return cleanBase;

  // 2) try with suffixes
  for (let i = 2; i <= 50; i++) {
    const candidate = `${cleanBase}-${i}`;
    const clash = await prisma.workspace.findFirst({
      where: { slug: candidate, NOT: { id: workspaceId } },
      select: { id: true },
    });
    if (!clash) return candidate;
  }

  // fallback last resort
  return `${cleanBase}-${Date.now()}`;
}

/**
 * GET /api/workspaces/[workspaceId]
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: { include: { user: true } },
      invitations: true,
    },
  });

  if (!workspace) {
    return NextResponse.json(
      { error: "Workspace not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(workspace);
}

/**
 * PATCH /api/workspaces/[workspaceId]
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId } = await params;

  try {
    await assertWorkspaceAdmin(workspaceId, user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!existing) {
    return NextResponse.json({ error: "Workspace introuvable" }, { status: 404 });
  }

  const contentType = req.headers.get("content-type") || "";

  let name: string | undefined;
  let slug: string | undefined;
  let logoFile: File | null = null;

  // nouveaux champs
  let country: string | undefined;
  let industry: string | undefined;
  let companySize: string | undefined;
  let street: string | undefined;
  let city: string | undefined;
  let website: string | undefined;
  let phone: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();

    const getStr = (k: string) => {
      const v = formData.get(k);
      return typeof v === "string" ? v.trim() : undefined;
    };

    name = getStr("name");
    slug = getStr("slug");
    country = getStr("country");
    industry = getStr("industry");
    companySize = getStr("companySize");
    street = getStr("street");
    city = getStr("city");
    website = getStr("website");
    phone = getStr("phone");

    const rawLogo = formData.get("logo");
    if (rawLogo instanceof File) logoFile = rawLogo;
  } else {
    const body = await req.json().catch(() => ({}));
    if (typeof body.name === "string") name = body.name.trim();
    if (typeof body.slug === "string") slug = body.slug.trim();

    if (typeof body.country === "string") country = body.country.trim();
    if (typeof body.industry === "string") industry = body.industry.trim();
    if (typeof body.companySize === "string") companySize = body.companySize.trim();
    if (typeof body.street === "string") street = body.street.trim();
    if (typeof body.city === "string") city = body.city.trim();
    if (typeof body.website === "string") website = body.website.trim();
    if (typeof body.phone === "string") phone = body.phone.trim();
  }

  const finalName = name && name.length > 0 ? name : existing.name;

  // slug auto :
  // - si slug fourni -> base = slug
  // - sinon base = finalName
  const baseForSlug = (slug && slug.length > 0) ? slug : finalName;
  const finalSlug = await ensureUniqueWorkspaceSlug(baseForSlug, workspaceId);

  let finalLogo: string | null = existing.logo ?? null;

  if (logoFile && logoFile.size > 0) {
    const uploaded = await uploadFileToSupabase({
      file: logoFile,
      category: "workspaceLogo",
      baseName: finalSlug,
    });

    if (existing.logo) {
      await deleteFromSupabase({ category: "workspaceLogo", path: existing.logo });
    }

    finalLogo = uploaded.path;
  }

  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name: finalName,
      slug: finalSlug,
      logo: finalLogo,

      // nouveaux champs (nullable)
      country: country ?? existing.country ?? null,
      industry: industry ?? existing.industry ?? null,
      companySize: companySize ?? existing.companySize ?? null,
      street: street ?? existing.street ?? null,
      city: city ?? existing.city ?? null,
      website: website ?? existing.website ?? null,
      phone: phone ?? existing.phone ?? null,
    },
  });

  return NextResponse.json(updated);
}

/**
 * DELETE /api/workspaces/[workspaceId]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;

  try {
    await assertWorkspaceAdmin(workspaceId, user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    return NextResponse.json(
      { error: "Workspace introuvable" },
      { status: 404 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const confirmationName = body?.confirmationName ?? "";

  if (confirmationName !== workspace.name) {
    return NextResponse.json(
      { error: "Confirmation incorrecte" },
      { status: 400 },
    );
  }

  // Supprimer logo Supabase
  if (workspace.logo) {
    await deleteFromSupabase({ category: "workspaceLogo", path: workspace.logo });
  }

  await prisma.$transaction(async (tx) => {
    await tx.mission.updateMany({
      where: { workspaceId },
      data: { workspaceId: null },
    });

    await tx.workspace.delete({
      where: { id: workspaceId },
    });
  });

  return NextResponse.json({
    success: true,
    deletedWorkspaceId: workspaceId,
  });
}
