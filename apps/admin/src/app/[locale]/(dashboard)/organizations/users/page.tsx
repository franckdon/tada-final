import { UsersManagement } from "@/components/organizations/users-management";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Gestion des Utilisateurs | Tada",
};

export default async function OrganizationsUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      kyc_status: true,
      image: true,
      position: true,
      country: true,
      sector: true,
      banned: true,
      createdAt: true,
      _count: {
        select: {
          members: true,
          missionAssignments: true,
          surveyResponses: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <UsersManagement initialUsers={users} />;
}
