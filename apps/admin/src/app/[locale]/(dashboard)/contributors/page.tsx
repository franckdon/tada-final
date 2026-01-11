// import { ContributorsStats } from "@/components/contributors/contributors-stats";
import { ContributorsTable } from "@/components/contributors/contributors-table";
import StatCard from "@/components/contributors/stat-card";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/locales/server";
import {
  CheckCircle,
  Plus,
  Sparkles,
  TrendingUp,
  UserCheck,
} from "lucide-react";

export const metadata = {
  title: "Contributeurs | Tada",
};

// Déplacer les calculs côté serveur pour éviter les re-calculs
async function getContributorsWithStats() {
  const contributors = await prisma.user.findMany({
    where: {
      role: "contributor",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      kyc_status: true,
      image: true,
      location: true,
      job: true,
      banned: true,
      createdAt: true,
      missionAssignments: {
        select: {
          id: true,
          status: true,
          completedAt: true,
          mission: {
            select: {
              type: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculer toutes les statistiques côté serveur
  const totalContributors = contributors.length;
  const verifiedContributors = contributors.filter(
    (c) => c.kyc_status === "completed"
  ).length;
  const activeContributors = contributors.filter((c) =>
    c.missionAssignments.some((m) =>
      ["assigned", "accepted", "in_progress"].includes(m.status)
    )
  ).length;
  const bannedContributors = contributors.filter((c) => c.banned).length;

  const totalMissions = contributors.reduce(
    (sum, c) => sum + c.missionAssignments.length,
    0
  );
  const completedMissions = contributors.reduce(
    (sum, c) =>
      sum + c.missionAssignments.filter((m) => m.status === "completed").length,
    0
  );

  // Calculer les données mensuelles
  const months = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Jun",
    "Jul",
    "Aoû",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];
  const currentYear = new Date().getFullYear();

  const monthlyData = months.map((month, index) => {
    const monthContributors = contributors.filter((c) => {
      const createdDate = new Date(c.createdAt);
      return (
        createdDate.getFullYear() === currentYear &&
        createdDate.getMonth() === index
      );
    }).length;

    return { month, contributors: monthContributors };
  });

  // Calculer les top performers
  const topPerformers = contributors
    .map((contributor) => {
      const completedMissions = contributor.missionAssignments.filter(
        (m) => m.status === "completed"
      ).length;
      const totalEarnings = contributor.missionAssignments
        .filter((m) => m.status === "completed")
        .reduce(
          (sum, m) => sum + (m.mission.type === "premium" ? 5000 : 2500),
          0
        );

      return {
        ...contributor,
        completedMissions,
        totalEarnings,
      };
    })
    .sort((a, b) => b.completedMissions - a.completedMissions)
    .slice(0, 5);

  return {
    contributors,
    stats: {
      total: totalContributors,
      verified: verifiedContributors,
      active: activeContributors,
      banned: bannedContributors,
      totalMissions,
      completedMissions,
    },
    monthlyData,
    topPerformers,
  };
}

export default async function ContributorsPage() {
  const t = await getI18n();
  const { contributors, stats, monthlyData, topPerformers } =
    await getContributorsWithStats();

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
        {[
          {
            key: "total-contributors",
            label: t("contributors.stats.total"),
            value: contributors.length,
            icon: <TrendingUp className="h-8 w-8 text-green-600" />,
          },
          {
            key: "verified-contributors",
            label: t("contributors.stats.verified"),
            value: contributors.filter(
              (contributor) => contributor.kyc_status === "completed"
            ).length,
            icon: <UserCheck className="h-8 w-8 text-green-600" />,
          },
          {
            key: "active-contributors",
            label: t("contributors.stats.active"),
            value: contributors.length,
            icon: <CheckCircle className="h-8 w-8 text-green-600" />,
          },
        ].map((item) => (
          <StatCard key={item.key} item={item} />
        ))}
      </div>
      <div className="min-h-screen p-3 bg-white">
        {/* <ContributorsStats stats={stats} monthlyData={monthlyData} /> */}
        <ContributorsTable contributors={contributors} />
      </div>
    </div>
  );
}
