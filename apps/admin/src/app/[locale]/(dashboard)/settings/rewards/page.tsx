// apps/admin/src/app/[locale]/(dashboard)/settings/rewards/page.tsx
import { prisma } from "@/lib/prisma";
import { ContributorModuleRewardsManagement } from "@/components/rewards/contributor-module-rewards-management";

export const metadata = {
  title: "Récompenses Modules Contributeurs | Tada",
};

export default async function RewardsPage() {
  const modules = await prisma.contributorModuleRewardConfig.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="p-6">
      <ContributorModuleRewardsManagement initialModules={modules} />
    </div>
  );
}
