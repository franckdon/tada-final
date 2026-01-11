"use client";

import { useState, useEffect } from "react";
import { Button } from "@tada/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import { Download, Filter, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryStates, parseAsString } from "nuqs";

interface Organization {
  id: string;
  name: string;
}

interface Contributor {
  id: string;
  name: string;
  email: string;
}

interface MissionAuditFiltersProps {
  organizations: Organization[];
}

export function MissionAuditFilters({ organizations }: MissionAuditFiltersProps) {
  const router = useRouter();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [params, setParams] = useQueryStates(
    {
      status: parseAsString.withDefault("all"),
      organizationId: parseAsString,
      contributorId: parseAsString,
      dateFrom: parseAsString,
      dateTo: parseAsString,
    },
    {
      shallow: false,
    }
  );

  useEffect(() => {
    async function fetchContributors() {
      try {
        const response = await fetch("/api/users?role=contributor&limit=100");
        if (response.ok) {
          const result = await response.json();
          setContributors(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching contributors:", error);
      }
    }
    fetchContributors();
  }, []);

  const handleReset = () => {
    setParams({
      status: "all",
      organizationId: null,
      contributorId: null,
      dateFrom: null,
      dateTo: null,
    });
  };

  const handleExport = async (format: string) => {
    const queryParams = new URLSearchParams();
    if (params.status && params.status !== "all") queryParams.set("status", params.status);
    if (params.organizationId) queryParams.set("organizationId", params.organizationId);
    if (params.contributorId) queryParams.set("contributorId", params.contributorId);
    if (params.dateFrom) queryParams.set("dateFrom", params.dateFrom);
    if (params.dateTo) queryParams.set("dateTo", params.dateTo);
    queryParams.set("export", format);

    window.location.href = `/api/audit/missions?${queryParams.toString()}`;
  };

  const hasActiveFilters =
    (params.status && params.status !== "all") ||
    params.organizationId ||
    params.contributorId ||
    params.dateFrom ||
    params.dateTo;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Audit des Missions</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres avancés
            {hasActiveFilters && (
              <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                {[
                  params.status !== "all",
                  params.organizationId,
                  params.contributorId,
                  params.dateFrom,
                  params.dateTo,
                ].filter(Boolean).length}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select
              value={params.status || "all"}
              onValueChange={(value) => setParams({ status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="live">En cours</SelectItem>
                <SelectItem value="on hold">En attente</SelectItem>
                <SelectItem value="complete">Terminée</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Organisation</Label>
            <Select
              value={params.organizationId || "all"}
              onValueChange={(value) =>
                setParams({ organizationId: value === "all" ? null : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les organisations</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Contributeur</Label>
            <Select
              value={params.contributorId || "all"}
              onValueChange={(value) =>
                setParams({ contributorId: value === "all" ? null : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les contributeurs</SelectItem>
                {contributors.map((contributor) => (
                  <SelectItem key={contributor.id} value={contributor.id}>
                    {contributor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date début</Label>
            <Input
              type="date"
              value={params.dateFrom || ""}
              onChange={(e) => setParams({ dateFrom: e.target.value || null })}
            />
          </div>

          <div className="space-y-2">
            <Label>Date fin</Label>
            <Input
              type="date"
              value={params.dateTo || ""}
              onChange={(e) => setParams({ dateTo: e.target.value || null })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
