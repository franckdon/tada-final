// src/lib/workspaces.ts
import { prisma } from "./prisma";

export async function getUserWorkspaces(userId: string) {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: { userId, status: "active" },
      },
    },
    include: {
      organization: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createWorkspace(params: {
  name: string;
  slug: string;
  organizationId?: string;
  ownerId: string;
}) {
  const { name, slug, organizationId, ownerId } = params;

  return prisma.workspace.create({
    data: {
      name,
      slug,
      organizationId,
      ownerId,
      members: {
        create: {
          userId: ownerId,
          role: "owner",
          status: "active",
        },
      },
    },
  });
}

export async function assertWorkspaceAdmin(
  workspaceId: string,
  userId: string,
) {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
      status: "active",
    },
  });

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    throw new Error("FORBIDDEN");
  }

  return membership;
}

// 🔹 Assure qu'une org a au moins un workspace, sinon le crée
export async function ensureDefaultWorkspaceForOrganization(params: {
  organizationId: string;
  ownerUserId: string;
}) {
  const { organizationId, ownerUserId } = params;

  // 1. Est-ce qu'il y a déjà un workspace pour cette org ?
  const existing = await prisma.workspace.findFirst({
    where: { organizationId },
  });

  if (existing) return existing;

  // 2. Récupérer l'org pour le nom / slug
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  const base = org.slug || org.name.toLowerCase().replace(/\s+/g, "-");
  const slug = `${base}-workspace`;

  const workspace = await createWorkspace({
    name: org.name,
    slug,
    organizationId: org.id,
    ownerId: ownerUserId,
  });

  return workspace;
}
