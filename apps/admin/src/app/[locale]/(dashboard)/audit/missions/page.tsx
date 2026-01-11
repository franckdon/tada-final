import { prisma } from "@/lib/prisma";
import { MissionAuditDashboard } from "@/components/audit/mission-audit-dashboard";

export const metadata = {
  title: "Audit des Missions | Tada",
};

export default async function MissionsAuditPage() {
  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const totalMissions = await prisma.mission.count();
  const missionsByStatus = await prisma.mission.groupBy({
    by: ["status"],
    _count: true,
  });

  const recentMissions = await prisma.mission.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      organization: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="p-6">
      <MissionAuditDashboard
        organizations={organizations}
        initialStats={{
          total: totalMissions,
          byStatus: missionsByStatus.reduce((acc, item) => {
            acc[item.status || "unknown"] = item._count;
            return acc;
          }, {} as Record<string, number>),
        }}
        recentMissions={recentMissions}
      />
    </div>
  );
}
