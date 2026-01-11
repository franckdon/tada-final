//src/app/api/workspaces/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { getCurrentUser } from "@/lib/current-user";
import { getUserWorkspaces } from "@/lib/workspaces";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/transporter";
import { uploadFileToSupabase, deleteFromSupabase } from "@/lib/uploads.server";

export const runtime = "nodejs";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1) Orgs où le user est admin/owner
  const orgMemberships = await prisma.member.findMany({
    where: {
      userId: user.id,
      role: { in: ["admin", "owner"] },
    },
    select: { organizationId: true },
  });

  const adminOrgIds = orgMemberships.map((m) => m.organizationId);

  // 2) Workspaces visibles
  const workspaces = await prisma.workspace.findMany({
    where: adminOrgIds.length
      ? {
          OR: [
            { ownerId: user.id },
            { organizationId: { in: adminOrgIds } }, // règle business
          ],
        }
      : {
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
    select: { id: true, name: true, slug: true, logo: true, organizationId: true },
    orderBy: { createdAt: "asc" },
  });

  console.log("adminOrgIds:", adminOrgIds);
  console.log("workspaces:", workspaces);

  return NextResponse.json(workspaces);
}


export async function POST(req: NextRequest) {
  // Pour cleanup si la transaction échoue après upload
  let uploadedLogoPath: string | null = null;

  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = req.headers.get("content-type") || "";

    let name = "";
    let slug = "";
    let organizationId: string | null = null;
    let invitedEmails: string[] = [];
    let logoFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      name = String(formData.get("name") ?? "").trim();
      slug = String(formData.get("slug") ?? "").trim();
      organizationId = (formData.get("organizationId") as string) || null;

      invitedEmails = formData
        .getAll("invitedEmails[]")
        .map((e) => String(e).toLowerCase().trim())
        .filter(Boolean);

      const rawLogo = formData.get("logo");
      logoFile = rawLogo instanceof File ? rawLogo : null;
    } else {
      const body = await req.json().catch(() => ({}));

      name = String(body.name ?? "").trim();
      slug = String(body.slug ?? "").trim();
      organizationId = body.organizationId ?? null;

      if (Array.isArray(body.invitedEmails)) {
        invitedEmails = body.invitedEmails
          .map((e: string) => String(e).toLowerCase().trim())
          .filter(Boolean);
      }
    }

    if (!name) {
      return NextResponse.json(
        { error: "Le nom du workspace est obligatoire" },
        { status: 400 },
      );
    }

    // 1) slug final unique AVANT upload
    const sourceForSlug = slug || name;
    const slugBase = normalizeSlug(sourceForSlug);
    let finalSlug = slugBase || `workspace-${Date.now()}`;

    const existingWithSameSlug = await prisma.workspace.findUnique({
      where: { slug: finalSlug },
      select: { id: true },
    });

    if (existingWithSameSlug) {
      finalSlug = `${slugBase || "workspace"}-${Date.now()}`;
    }

    // 2) upload logo (si fourni) => on stocke le PATH dans workspace.logo
    let logo: string | null = null;

    if (logoFile && logoFile.size > 0) {
      const maxMb = 5;
      const maxBytes = maxMb * 1024 * 1024;

      if (!logoFile.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Logo must be an image" },
          { status: 400 },
        );
      }

      if (logoFile.size > maxBytes) {
        return NextResponse.json(
          { error: `Logo too large (max ${maxMb}MB)` },
          { status: 400 },
        );
      }

      const uploaded = await uploadFileToSupabase({
        file: logoFile,
        category: "workspaceLogo",
        baseName: finalSlug,
      });

      // IMPORTANT: on stocke le PATH et pas l'URL
      logo = uploaded.path;
      uploadedLogoPath = uploaded.path;
    }

    // Invitations pour email après transaction
    const invitationsForEmail: {
      email: string;
      token: string;
      expiresAt: Date;
      workspaceName: string;
    }[] = [];

    // 3) transaction create workspace + owner + invitations
    const workspace = await prisma.$transaction(async (tx) => {
      const created = await tx.workspace.create({
        data: {
          name,
          slug: finalSlug,
          organizationId,
          ownerId: user.id,
          logo, // <- path supabase (ou null)

          members: {
            create: {
              userId: user.id,
              role: "owner",
              status: "active",
              invitedById: user.id,
            },
          },
        },
      });

      for (const emailRaw of invitedEmails) {
        const email = emailRaw.toLowerCase().trim();
        if (!email || email === user.email) continue;

        const existingUser = await tx.user.findUnique({
          where: { email },
          select: { id: true },
        });

        if (existingUser) {
          const alreadyMember = await tx.workspaceMember.findFirst({
            where: {
              workspaceId: created.id,
              userId: existingUser.id,
              status: "active",
            },
            select: { id: true },
          });

          if (!alreadyMember) {
            await tx.workspaceMember.create({
              data: {
                workspaceId: created.id,
                userId: existingUser.id,
                role: "member",
                status: "active",
                invitedById: user.id,
              },
            });
          }
        } else {
          const token = crypto.randomUUID();
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);

          await tx.workspaceInvitation.create({
            data: {
              workspaceId: created.id,
              email,
              role: "member",
              token,
              status: "pending",
              expiresAt,
              invitedById: user.id,
            },
          });

          invitationsForEmail.push({
            email,
            token,
            expiresAt,
            workspaceName: created.name,
          });
        }
      }

      return created;
    });

    // upload OK + transaction OK => on ne cleanup plus
    uploadedLogoPath = null;

    // 4) emails hors transaction
    for (const invite of invitationsForEmail) {
      const inviteUrl = `${APP_URL}/fr/invitations/accept?token=${invite.token}`;

      try {
        await transporter.sendMail({
          from: "no-reply@monrezo.net",
          to: [invite.email],
          subject: `[Tada] Invitation à rejoindre un workspace`,
          html: `
            <p>Bonjour,</p>
            <p>${user.name || user.email} vous a invité à rejoindre le workspace <b>${invite.workspaceName}</b> sur Tada.</p>
            <p>Cliquez sur le lien ci-dessous pour accepter l'invitation :</p>
            <p><a href="${inviteUrl}">${inviteUrl}</a></p>
            <p>Ce lien expire le ${invite.expiresAt.toLocaleDateString("fr-FR")}.</p>
          `,
        });
      } catch (error) {
        console.error("[WORKSPACE_INVITE_EMAIL_ERROR]", error);
      }
    }

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("[CREATE_WORKSPACE_API_ERROR]", error);

    // Cleanup du logo uploadé si la transaction a planté après upload
    if (uploadedLogoPath) {
      try {
        await deleteFromSupabase({
          category: "workspaceLogo",
          path: uploadedLogoPath,
        });
      } catch (cleanupError) {
        console.error("[CREATE_WORKSPACE_CLEANUP_ERROR]", cleanupError);
      }
    }

    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        message: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 },
    );
  }
}