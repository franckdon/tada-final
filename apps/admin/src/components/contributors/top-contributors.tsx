"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tada/ui/components/avatar";
import { Badge } from "@tada/ui/components/badge";
import { Trophy, Crown, Award, Medal } from "lucide-react";
import Link from "next/link";

interface TopContributor {
  id: string;
  name: string;
  email: string;
  image: string | null;
  completedMissions: number;
  totalEarnings: number;
  kyc_status: string | null;
}

// Fonctions mémorisées pour éviter les re-créations avec design podium
const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return <Crown className="h-5 w-5 text-yellow-500" />;
    case 1:
      return <Award className="h-5 w-5 text-gray-400" />;
    case 2:
      return <Medal className="h-5 w-5 text-orange-500" />;
    default:
      return (
        <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
      );
  }
};

const getRankBadge = (index: number) => {
  switch (index) {
    case 0:
      return (
        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          🥇 Champion
        </Badge>
      );
    case 1:
      return (
        <Badge className="bg-gradient-to-r from-gray-400 to-gray-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          🥈 Vice-Champion
        </Badge>
      );
    case 2:
      return (
        <Badge className="bg-gradient-to-r from-orange-400 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          🥉 3ème place
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white border-0">
          #{index + 1}
        </Badge>
      );
  }
};

const getPodiumHeight = (index: number) => {
  switch (index) {
    case 0:
      return "h-24";
    case 1:
      return "h-20";
    case 2:
      return "h-16";
    default:
      return "h-12";
  }
};

const getPodiumGradient = (index: number) => {
  switch (index) {
    case 0:
      return "from-yellow-400 to-yellow-600";
    case 1:
      return "from-gray-400 to-gray-600";
    case 2:
      return "from-orange-400 to-orange-600";
    default:
      return "from-blue-400 to-blue-600";
  }
};

// Composant mémorisé pour chaque contributeur avec design podium
const ContributorItem = React.memo(
  ({ contributor, index }: { contributor: TopContributor; index: number }) => {
    const isTopThree = index < 3;

    if (isTopThree) {
      return (
        <Link href={`/contributors/${contributor.id}`} className="block group">
          <div className="relative">
            {/* Podium */}
            <div
              className={`${getPodiumHeight(
                index
              )} bg-gradient-to-t ${getPodiumGradient(
                index
              )} rounded-t-xl mb-4 relative overflow-hidden group-hover:shadow-2xl transition-shadow duration-300`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                {getRankIcon(index)}
              </div>
            </div>

            {/* Contributeur */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <Avatar className="h-16 w-16 ring-4 ring-white shadow-xl">
                    <AvatarImage
                      src={contributor.image || ""}
                      alt={contributor.name}
                    />
                    <AvatarFallback
                      className={`bg-gradient-to-br ${getPodiumGradient(
                        index
                      )} text-white font-bold text-lg`}
                    >
                      {contributor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2">
                    {getRankIcon(index)}
                  </div>
                </div>

                <div className="mb-2">{getRankBadge(index)}</div>

                <h4 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {contributor.name}
                </h4>

                <div className="flex items-center justify-between w-full text-xs text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {contributor.completedMissions} missions
                  </span>
                  <span className="font-bold text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
                    {contributor.totalEarnings.toLocaleString()} Fcfa
                  </span>
                </div>

                {contributor.kyc_status === "completed" && (
                  <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 text-xs">
                    ✓ Vérifié
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Link>
      );
    }

    return (
      <Link
        href={`/contributors/${contributor.id}`}
        className="block hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 rounded-xl p-3 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{getRankIcon(index)}</div>
          <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg">
            <AvatarImage src={contributor.image || ""} alt={contributor.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
              {contributor.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {contributor.name}
              </p>
              {getRankBadge(index)}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{contributor.completedMissions} missions</span>
              <span className="font-bold text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
                {contributor.totalEarnings.toLocaleString()} Fcfa
              </span>
            </div>
            {contributor.kyc_status === "completed" && (
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 text-xs mt-1">
                ✓ Vérifié
              </Badge>
            )}
          </div>
        </div>
      </Link>
    );
  }
);

ContributorItem.displayName = "ContributorItem";

export const TopContributors = React.memo(
  ({ contributors }: { contributors: TopContributor[] }) => {
    return (
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Top Contributeurs
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {contributors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <Trophy className="h-10 w-10 text-gray-400" />
              </div>
              <p className="font-medium">Aucun contributeur actif</p>
            </div>
          ) : (
            <>
              {/* Top 3 avec podium */}
              <div className="grid grid-cols-1 gap-4">
                {contributors.slice(0, 3).map((contributor, index) => (
                  <ContributorItem
                    key={contributor.id}
                    contributor={contributor}
                    index={index}
                  />
                ))}
              </div>

              {/* Autres contributeurs */}
              {contributors.length > 3 && (
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  {contributors.slice(3).map((contributor, index) => (
                    <ContributorItem
                      key={contributor.id}
                      contributor={contributor}
                      index={index + 3}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {contributors.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <Link
                href="/contributors/leaderboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                <Trophy className="h-4 w-4 text-blue-600" />
                Voir le classement complet →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

TopContributors.displayName = "TopContributors";
