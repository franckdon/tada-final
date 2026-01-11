import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1) Workspaces à corriger
  const workspaces = await prisma.workspace.findMany({
    where: { organizationId: null },
    select: { id: true, ownerId: true, name: true },
  });

  console.log(`Workspaces sans organizationId: ${workspaces.length}`);

  let updated = 0;
  let skipped = 0;

  for (const ws of workspaces) {
    // 2) On déduit l'org via le membership du owner (owner/admin)
    const ownerOrg = await prisma.member.findFirst({
      where: {
        userId: ws.ownerId,
        role: { in: ["owner", "admin"] },
      },
      select: { organizationId: true },
      orderBy: { createdAt: "asc" }, // adapte si besoin
    });

    if (!ownerOrg?.organizationId) {
      skipped++;
      console.log(`SKIP workspace=${ws.id} (${ws.name}) ownerId=${ws.ownerId} : aucune org trouvée`);
      continue;
    }

    await prisma.workspace.update({
      where: { id: ws.id },
      data: { organizationId: ownerOrg.organizationId },
    });

    updated++;
    console.log(`UPDATED workspace=${ws.id} -> organizationId=${ownerOrg.organizationId}`);
  }

  console.log({ updated, skipped });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
