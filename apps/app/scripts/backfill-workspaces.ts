// scripts/backfill-workspaces.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("=== Backfill des workspaces par défaut ===");

  // 1. On récupère toutes les organisations avec leurs workspaces existants
  const organizations = await prisma.organization.findMany({
    include: { workspaces: true },
  });

  console.log(`Organisations trouvées : ${organizations.length}`);

  // 2. On choisit un user par défaut si on n’a rien d'autre (à adapter si tu as une logique d'owner par org)
  const defaultOwner = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!defaultOwner) {
    console.error("❌ Aucun utilisateur trouvé dans la base. Impossible de définir un owner.");
    process.exit(1);
  }

  console.log(
    `Utilisateur par défaut pour owner des workspaces : ${defaultOwner.email} (${defaultOwner.id})`
  );

  let created = 0;
  let skipped = 0;

  for (const org of organizations) {
    if (org.workspaces && org.workspaces.length > 0) {
      console.log(
        `➡️  Organisation "${org.name}" (${org.id}) a déjà ${org.workspaces.length} workspace(s). Skip.`
      );
      skipped++;
      continue;
    }

    const base = org.slug || slugify(org.name);
    const slug = `${base}-workspace`;

    console.log(
      `🆕 Création d'un workspace par défaut pour l'organisation "${org.name}" (${org.id}) avec le slug "${slug}"`
    );

    try {
      await prisma.workspace.create({
        data: {
          name: org.name, // workspace porte le nom de l'entreprise
          slug,
          organizationId: org.id,
          ownerId: defaultOwner.id,
          members: {
            create: {
              userId: defaultOwner.id,
              role: "owner",
              status: "active",
            },
          },
        },
      });

      created++;
    } catch (error) {
      console.error(
        `❌ Erreur lors de la création du workspace pour org ${org.id} (${org.name}) :`,
        error
      );
    }
  }

  console.log("=== Backfill terminé ===");
  console.log(`Workspaces créés : ${created}`);
  console.log(`Organisations déjà pourvues : ${skipped}`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur dans le script de backfill :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
