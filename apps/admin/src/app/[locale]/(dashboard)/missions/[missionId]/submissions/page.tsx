// src/app/[locale]/(dashboard)/missions/[missionId]/submissions/page.tsx
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

type ValidationStatus = "pending" | "approved" | "rejected";

function getValidationStatus(response: any): ValidationStatus {
  // On ne touche pas survey_response.status (collecte)
  // => validation = dernier validation_comment.action (si existe), sinon pending
  const last = response.validation_comment?.[0]; // take: 1 + orderBy desc
  if (last?.action === "approved") return "approved";
  if (last?.action === "rejected") return "rejected";

  // fallback optionnel (si tu as ce champ dans ta DB / select)
  if (response.validatedAt) return "approved";

  return "pending";
}

function isQcDone(qc: any): boolean {
  return (
    qc?.status === "accepted" ||
    qc?.status === "review_required" ||
    qc?.status === "rejected"
  );
}

export default async function MissionSubmissionsPage({
  params,
}: MissionSubmissionsPageProps) {
  const { missionId } = params;

  // 1) Mission
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

  // 2) Responses (toutes les soumissions)
  const responses = await prisma.surveyResponse.findMany({
    where: {
      survey: {
        missionId,
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

      // ✅ IMPORTANT: on ne charge que le dernier commentaire (source de vérité validation)
      validation_comment: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          comment: true,
          action: true,
          createdAt: true,
          user: {
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

  // 3) Stats (basées sur validation_comment, PAS survey_response.status)
  const statuses = responses.map(getValidationStatus);

  const stats = {
    total: responses.length,
    approved: statuses.filter((s) => s === "approved").length,
    pending: statuses.filter((s) => s === "pending").length,
    rejected: statuses.filter((s) => s === "rejected").length,

    // “à valider” = pending + QC final (actionnable)
    toReview: responses.filter((r) => {
      const v = getValidationStatus(r);
      return v === "pending" && isQcDone(r.qualityControl);
    }).length,

    uniqueContributors: new Set(
      responses.map((r: any) => r.userId).filter(Boolean),
    ).size,
  };

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
              {stats.toReview > 0 ? (
                <>
                  {" "}
                  • <span className="font-medium">{stats.toReview}</span> à
                  valider (QC OK)
                </>
              ) : null}
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
                ? (stats.total / stats.uniqueContributors).toFixed(0)
                : 0}{" "}
              soumissions/contributeur
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{stats.total} soumissions</Badge>
          {stats.toReview > 0 ? (
            <Badge variant="secondary">{stats.toReview} à valider</Badge>
          ) : stats.pending > 0 ? (
            <Badge variant="secondary">{stats.pending} en attente</Badge>
          ) : null}

          {stats.rejected > 0 && (
            <Badge variant="destructive">{stats.rejected} rejetées</Badge>
          )}
        </div>
      </div>

      {/* Liste des soumissions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Historique des soumissions</h2>
        <div className="space-y-3">
          {responses.map((response: any) => (
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
