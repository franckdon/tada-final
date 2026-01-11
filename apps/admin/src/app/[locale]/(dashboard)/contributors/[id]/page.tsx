import { MissionsSection } from "@/components/contributors/missions-completed";
import ProfileCard from "@/components/contributors/profile-card";
import ProfileDetails from "@/components/contributors/profile-details";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/locales/server";

export const metadata = {
  title: "Contributeur | Tada",
};

export default async function ContributorPage({
  params,
}: {
  params: { id: string };
}) {
  const t = await getI18n();

  const contributor = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      kyc_status: true,
      image: true,
      location: true,
      country: true,
      job: true,
      banned: true,
    },
  });

  if (!contributor) return <div>{t("contributors.detail.notFound")}</div>;

  // Récupérer les données contributeur depuis la nouvelle table
  const contributorData = await prisma.contributorData.findMany({
    where: {
      userId: params.id,
    },
    include: {
      mission: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
    orderBy: [{ mission: { name: "asc" } }, { originalQuestion: "asc" }],
  });

  // Organiser les données par mission
  const dataByMission = contributorData.reduce((acc, item) => {
    const missionId = item.missionId;
    const missionName = item.mission.name;

    if (!acc[missionId]) {
      acc[missionId] = {
        missionId,
        missionName,
        missionType: item.mission.type,
        questions: [],
      };
    }

    // Vérifier si la question existe déjà dans cette mission
    let existingQuestion = acc[missionId].questions.find(
      (q: any) => q.key === item.key
    );

    if (!existingQuestion) {
      existingQuestion = {
        key: item.key,
        question: item.originalQuestion || item.key,
        type: item.questionType,
        values: [],
      };
      acc[missionId].questions.push(existingQuestion);
    }

    // Ajouter la valeur (pour gérer les réponses multiples)
    existingQuestion.values.push(item.value);

    return acc;
  }, {} as any);

  // Convertir en array
  const organizedContributorData = Object.values(dataByMission);

  // Récupérer les missions assignées (en cours)
  const assignedMissions = await prisma.missionAssignment.findMany({
    where: {
      contributorId: params.id,
      status: {
        in: ["assigned", "accepted", "in_progress"],
      },
    },
    include: {
      mission: {
        include: {
          organization: true,
        },
      },
      assignedByUser: true,
    },
    orderBy: {
      assignedAt: "desc",
    },
  });

  // Récupérer les missions complétées
  const completedMissions = await prisma.missionAssignment.findMany({
    where: {
      contributorId: params.id,
      status: "completed",
    },
    include: {
      mission: {
        include: {
          organization: true,
        },
      },
      assignedByUser: true,
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  // Calculer les statistiques
  const totalMissions = assignedMissions.length + completedMissions.length;
  const totalEarnings = completedMissions.reduce((sum, mission) => {
    // Ici vous pouvez calculer les gains basés sur votre logique métier
    return sum + (mission.mission.type === "premium" ? 5000 : 2500);
  }, 0);

  return (
    <div className="p-5 text-gray-800">
      <div className="flex flex-col sm:flex-row mb-4 gap-4">
        <ProfileCard
          contributor={{
            ...contributor,
            stats: [
              {
                label: "Email",
                value: contributor.email,
              },
              {
                label: t("contributors.detail.infos.job"),
                value: contributor.job,
              },
              {
                label: t("contributors.detail.infos.location"),
                value: contributor.location,
              },
              {
                label: t("contributors.detail.infos.country"),
                value: contributor.country,
              },
              {
                label: t("contributors.detail.stats.totalMissions"),
                value: totalMissions.toString(),
              },
              {
                label: t("contributors.detail.stats.completed"),
                value: completedMissions.length.toString(),
              },
              {
                label: t("contributors.detail.stats.earnings"),
                value: `${totalEarnings.toLocaleString()} Fcfa`,
              },
            ],
          }}
        />
        <ProfileDetails contributorData={organizedContributorData as any} />
      </div>

      <MissionsSection
        assignedMissions={assignedMissions}
        completedMissions={completedMissions}
        params={params}
      />
    </div>
  );
}
