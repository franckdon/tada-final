"use client";

import React from "react";
import { Card, CardContent } from "@tada/ui/components/card";
import {
  TrendingUp,
  UserCheck,
  Users,
  UserX,
  Target,
  CheckCircle,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { cn } from "@/lib/utils";

interface StatsProps {
  stats: {
    total: number;
    verified: number;
    active: number;
    banned: number;
    totalMissions: number;
    completedMissions: number;
  };
  monthlyData: Array<{
    month: string;
    contributors: number;
  }>;
}

// Mémoriser les cartes de statistiques avec de beaux gradients
const getStatCards = (stats: StatsProps["stats"]) => [
  {
    title: "Total Contributeurs",
    value: stats.total,
    icon: Users,
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    iconColor: "text-blue-600",
    change: "+12%",
    changeType: "positive" as const,
  },
  {
    title: "Contributeurs Vérifiés",
    value: stats.verified,
    icon: UserCheck,
    gradient: "from-emerald-500 to-green-500",
    bgGradient: "from-emerald-50 to-green-50",
    iconColor: "text-emerald-600",
    change:
      stats.total > 0
        ? `${Math.round((stats.verified / stats.total) * 100)}%`
        : "0%",
    changeType: "neutral" as const,
  },
  {
    title: "Contributeurs Actifs",
    value: stats.active,
    icon: TrendingUp,
    gradient: "from-orange-500 to-amber-500",
    bgGradient: "from-orange-50 to-amber-50",
    iconColor: "text-orange-600",
    change: "+8%",
    changeType: "positive" as const,
  },
  {
    title: "Contributeurs Bannis",
    value: stats.banned,
    icon: UserX,
    gradient: "from-red-500 to-rose-500",
    bgGradient: "from-red-50 to-rose-50",
    iconColor: "text-red-600",
    change: "-2%",
    changeType: "negative" as const,
  },
  {
    title: "Total Missions",
    value: stats.totalMissions,
    icon: Target,
    gradient: "from-purple-500 to-violet-500",
    bgGradient: "from-purple-50 to-violet-50",
    iconColor: "text-purple-600",
    change: "+15%",
    changeType: "positive" as const,
  },
  {
    title: "Missions Complétées",
    value: stats.completedMissions,
    icon: CheckCircle,
    gradient: "from-teal-500 to-cyan-500",
    bgGradient: "from-teal-50 to-cyan-50",
    iconColor: "text-teal-600",
    change:
      stats.totalMissions > 0
        ? `${Math.round(
            (stats.completedMissions / stats.totalMissions) * 100
          )}%`
        : "0%",
    changeType: "neutral" as const,
  },
];

// Composant mémorisé pour les cartes de statistiques avec design élégant
const StatCard = React.memo(
  ({
    stat,
    isLast,
  }: {
    stat: ReturnType<typeof getStatCards>[0];
    isLast?: boolean;
  }) => {
    const Icon = stat.icon;
    return (
      <Card
        className={cn(
          "group relative overflow-hidden border-0 rounded-none bg-white/80 backdrop-blur-sm transition-all duration-500 hover:scale-105",
          !isLast && "border-r border-gray-200" // bordure à droite sauf pour la dernière
        )}
      >
        {/* Gradient de fond animé */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity duration-500`}
        ></div>

        {/* Effet de brillance au survol */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

        <CardContent className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} duration-300`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                stat.changeType === "positive"
                  ? "bg-green-100 text-green-700"
                  : stat.changeType === "negative"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {stat.change}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
              {stat.title}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

// Composant mémorisé pour le graphique avec design amélioré
const EvolutionChart = React.memo(
  ({ monthlyData }: { monthlyData: StatsProps["monthlyData"] }) => (
    <Card className="rounded-none">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Évolution des Contributeurs
          </h3>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient
                  id="contributorsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow:
                    "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
                  backdropFilter: "blur(10px)",
                }}
                labelStyle={{ color: "#374151", fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="contributors"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#contributorsGradient)"
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 5 }}
                activeDot={{
                  r: 7,
                  stroke: "#3B82F6",
                  strokeWidth: 3,
                  fill: "#ffffff",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
);

EvolutionChart.displayName = "EvolutionChart";

export const ContributorsStats = React.memo(
  ({ stats, monthlyData }: StatsProps) => {
    // Mémoriser les cartes de statistiques
    const statCards = React.useMemo(() => getStatCards(stats), [stats]);

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-0 border rounded-lg overflow-hidden">
          {statCards.map((stat, index) => (
            <StatCard
              key={stat.title}
              stat={stat}
              isLast={index === statCards.length - 1}
            />
          ))}
        </div>

        <EvolutionChart monthlyData={monthlyData} />
      </div>
    );
  }
);

ContributorsStats.displayName = "ContributorsStats";
