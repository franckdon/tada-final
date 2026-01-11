import { prisma } from "@/lib/prisma";
import { MissionSurveyResponseCard } from "@/components/missions/mission-survey-response-card";
import { NoResults } from "@/components/contributors/empty-states";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@tada/ui/components/card";
import { Badge } from "@tada/ui/components/badge";
import { CalendarDays, Users, CheckCircle, Clock, XCircle } from "lucide-react";

interface MissionSubmissionsPageProps {
  params: {
    missionId: string;
  };
}

export default async function MissionSubmissionsPage({
  params,
}: MissionSubmissionsPageProps) {
  const { missionId } = params;

  // Récupérer les informations de la mission
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    select: {
      id: true,
      name: true,
      objectives: true,
      createdAt: true,
    },
  });

  if (!mission) {
    return <div>Mission non trouvée</div>;
  }

  // Récupérer toutes les soumissions de cette mission
  const responses = await prisma.surveyResponse.findMany({
    where: {
      survey: {
        missionId: missionId,
      },
    },
    include: {
      survey: {
        select: {
          name: true,
          description: true,
          questions: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          country: true,
          sector: true,
          position: true,
          createdAt: true,
        },
      },
      validationComment: {
        select: {
          id: true,
          comment: true,
          action: true,
          createdAt: true,
          validator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      qualityControl: {
        include: {
          qualityIssues: {
            select: {
              id: true,
              type: true,
              level: true,
              title: true,
              description: true,
            },
          },
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  // Calculer les statistiques
  const stats = {
    total: responses.length,
    approved: responses.filter((r) => r.status === "approved").length,
    pending: responses.filter((r) => r.status === "pending").length,
    rejected: responses.filter((r) => r.status === "rejected").length,
    uniqueContributors: new Set(responses.map((r) => r.userId).filter(Boolean))
      .size,
  };

  if (responses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Soumissions - {mission.name}</h1>
          <p className="text-muted-foreground mt-1">
            Toutes les soumissions reçues pour cette mission
          </p>
        </div>
        <NoResults hasFilters={false} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold">Soumissions - {mission.name}</h1>
        <p className="text-muted-foreground mt-1">
          {stats.total} soumissions reçues • {stats.uniqueContributors}{" "}
          contributeurs uniques
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0 p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">soumissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="pt-0 p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.approved}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? Math.round((stats.approved / stats.total) * 100)
                : 0}
              % du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="pt-0 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? Math.round((stats.pending / stats.total) * 100)
                : 0}
              % du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Contributeurs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-0 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.uniqueContributors}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.uniqueContributors > 0
                ? (stats.total / stats.uniqueContributors).toFixed(1)
                : 0}{" "}
              soumissions/contributeur
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et actions (optionnel - peut être ajouté plus tard) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{stats.total} soumissions</Badge>
          {stats.pending > 0 && (
            <Badge variant="secondary">{stats.pending} à valider</Badge>
          )}
        </div>
      </div>

      {/* Liste des soumissions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Historique des soumissions</h2>
        <div className="space-y-3">
          {responses.map((response) => (
            <MissionSurveyResponseCard
              key={response.id}
              response={response as any}
              missionId={missionId}
              showContributorInfo={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
