import { prisma } from "@/lib/prisma";
import { RewardsManagement } from "@/components/rewards/rewards-management";

export const metadata = {
  title: "Gestion des Récompenses | Tada",
};

export default async function RewardsPage() {
  const rewards = await prisma.rewardConfig.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { history: true },
      },
    },
  });

  return (
    <div className="p-6">
      <RewardsManagement initialRewards={rewards} />
    </div>
  );
}
