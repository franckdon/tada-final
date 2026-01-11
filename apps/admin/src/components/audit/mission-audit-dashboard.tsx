"use client";

import { useState, useEffect } from "react";
import { MissionAuditFilters } from "../missions/mission-audit-filters";
import { Card } from "@tada/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tada/ui/components/table";
import { Badge } from "@tada/ui/components/badge";
import { BarChart3, TrendingUp, Users, FileText } from "lucide-react";

interface Organization {
  id: string;
  name: string;
}

interface MissionAuditDashboardProps {
  organizations: Organization[];
  initialStats: {
    total: number;
    byStatus: Record<string, number>;
  };
  recentMissions: any[];
}

export function MissionAuditDashboard({
  organizations,
  initialStats,
  recentMissions,
}: MissionAuditDashboardProps) {
  const [stats, setStats] = useState(initialStats);
  const [missions, setMissions] = useState(recentMissions);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      live: "bg-green-100 text-green-800",
      "on hold": "bg-yellow-100 text-yellow-800",
      complete: "bg-blue-100 text-blue-800",
      draft: "bg-gray-100 text-gray-800",
    };
    return <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit des Missions</h1>
        <p className="text-gray-500 mt-1">
          Consultez l'historique complet des missions et leur activite
        </p>
      </div>

      <MissionAuditFilters organizations={organizations} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Missions</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En cours</p>
              <p className="text-3xl font-bold mt-1">{stats.byStatus.live || 0}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completees</p>
              <p className="text-3xl font-bold mt-1">{stats.byStatus.complete || 0}</p>
            </div>
            <BarChart3 className="h-10 w-10 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-3xl font-bold mt-1">{stats.byStatus["on hold"] || 0}</p>
            </div>
            <Users className="h-10 w-10 text-orange-500" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Missions Recentes</h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Nom</TableHead>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date creation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      Aucune mission trouvee
                    </TableCell>
                  </TableRow>
                ) : (
                  missions.map((mission) => (
                    <TableRow key={mission.id}>
                      <TableCell className="font-medium">{mission.name}</TableCell>
                      <TableCell>{mission.organization?.name || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(mission.status)}</TableCell>
                      <TableCell>
                        {new Date(mission.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Statistiques par Statut</h2>
          <div className="space-y-4">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusBadge(status)}
                  <span className="text-sm text-gray-600 capitalize">{status}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(count / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{count}</span>
                  <span className="text-xs text-gray-500 w-16 text-right">
                    {((count / stats.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
