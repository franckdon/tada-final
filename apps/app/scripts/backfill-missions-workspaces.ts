// scripts/backfill-missions-workspaces.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Backfill des missions vers les workspaces ===");

  // on récupère toutes les orgs avec leurs workspaces
  const organizations = await prisma.organization.findMany({
    include: {
      workspaces: true,
    },
  });

  let totalUpdated = 0;

  for (const org of organizations) {
  if (!org.workspaces || org.workspaces.length === 0) {
    console.log(
      `➡️ Organisation "${org.name}" (${org.id}) n'a pas de workspace, skip.`,
    );
    continue;
  }

  const defaultWorkspace = org.workspaces[0];
  if (!defaultWorkspace) {
    console.log(
      `❓ Organisation "${org.name}" (${org.id}) a une liste de workspaces vide, skip.`,
    );
    continue;
  }

  console.log(
    `🧩 Organisation "${org.name}" → workspace par défaut "${defaultWorkspace.name}" (${defaultWorkspace.id})`,
  );

  const result = await prisma.mission.updateMany({
    where: {
      organizationId: org.id,
      workspaceId: null,
    },
    data: {
      workspaceId: defaultWorkspace.id,
    },
  });

  console.log(`   ↪ Missions mises à jour pour cette org : ${result.count}`);
  totalUpdated += result.count;
}


  console.log("=== Backfill terminé ===");
  console.log(`Missions mises à jour au total : ${totalUpdated}`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur dans le script de backfill missions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
