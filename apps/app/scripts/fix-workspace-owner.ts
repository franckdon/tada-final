// scripts/fix-workspace-owner.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * À ADAPTER avec les vrais IDs que tu as vus dans le log :
 *  - WORKSPACE_ID = missionWorkspaceId / requestedWorkspaceId
 *  - NEW_OWNER_ID = ton userId (dod1IIEW7jD6tsdzK0LyEanAeAWYM9bN)
 */
const WORKSPACE_ID = "16988786-41a0-47b0-8f0b-7a5796559b9e";
const NEW_OWNER_ID = "dod1IIEW7jD6tsdzK0LyEanAeAWYM9bN";

async function main() {
  // 1) Mettre à jour ownerId du workspace
  const updatedWorkspace = await prisma.workspace.update({
    where: { id: WORKSPACE_ID },
    data: { ownerId: NEW_OWNER_ID },
  });

  console.log("Workspace updated:", updatedWorkspace);

  // 2) S'assurer que tu es bien membre 'owner' dans WorkspaceMember
  const workspaceMember = await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: WORKSPACE_ID,
        userId: NEW_OWNER_ID,
      },
    },
    update: {
      role: "owner",
      status: "active",
    },
    create: {
      workspaceId: WORKSPACE_ID,
      userId: NEW_OWNER_ID,
      role: "owner",
      status: "active",
    },
  });

  console.log("WorkspaceMember updated:", workspaceMember);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
