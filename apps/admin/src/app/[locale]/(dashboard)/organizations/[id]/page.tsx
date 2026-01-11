import { MissionsSection as MissionsCompleted } from "@/components/contributors/missions-completed";
import ProfileCard from "@/components/organizations/profile-card";
import TeamMembersPreview from "@/components/organizations/team-members";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/locales/server";

export const metadata = {
  title: "Organisation | Tada",
};

export default async function OrganizationPage({
  params,
}: {
  params: { id: string };
}) {
  const t = await getI18n();
  const organization = await prisma.organization.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      name: true,
      logo: true,
      slug: true,
      metadata: true,
      status: true,
      members: {
        select: {
          role: true,
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true,
              banned: true,
            },
          },
        },
      },
    },
  });

  if (!organization) return <div>{t("organizations.detail.notFound")}</div>;

  const metadata = JSON.parse(organization.metadata || "{}");

  // 🔥 Récupérer les missions assignées à cette organisation
  const assignedMissions = await prisma.missionAssignment.findMany({
    where: {
      mission: { organizationId: params.id },
      status: { in: ["assigned", "accepted", "in_progress"] },
    },
    include: {
      mission: {
        include: { organization: true },
      },
      assignedByUser: true,
    },
    orderBy: { assignedAt: "desc" },
  });

  // 🔥 Récupérer les missions complétées
  const completedMissions = await prisma.missionAssignment.findMany({
    where: {
      mission: { organizationId: params.id },
      status: "completed",
    },
    include: {
      mission: {
        include: { organization: true },
      },
      assignedByUser: true,
    },
    orderBy: { completedAt: "desc" },
  });

  return (
    <div className="p-5 text-gray-800">
      <div className="flex flex-col sm:flex-row mb-4 gap-4">
        <ProfileCard
          organization={{
            ...organization,
            metadata,
            stats: [
              {
                label: t("organizations.detail.stats.users"),
                value: organization.members.length.toString(),
              },
              {
                label: t("organizations.detail.stats.missions"),
                value: "0",
              },
            ],
          }}
        />

        {/* 🔥 ENFIN on envoie correctement les props */}
        <MissionsCompleted
          assignedMissions={assignedMissions}
          completedMissions={completedMissions}
          params={params}
        />
      </div>
      <TeamMembersPreview
        membersInitial={organization.members.map((member) => {
          return {
            id: member.id,
            organizationId: params.id,
            createdAt: member.user.createdAt,
            role: member.role as "admin" | "member" | "owner",
            userId: member.user.id,
            user: {
              ...member.user,
              image: member.user.image || undefined,
            },
          };
        })}
        organizationName={organization.name}
      />
    </div>
  );
}
