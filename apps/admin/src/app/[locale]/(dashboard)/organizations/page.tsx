import { ListOrganizations } from "@/components/organizations/list-organizations";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Organizations | Tada",
};

export default async function OrganizationsPage() {
  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      logo: true,
      slug: true,
      metadata: true,
      status: true,
      country: true,
      sector: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          members: true,
          missions: true,
          projects: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-5 text-gray-800">
      <ListOrganizations
        organizations={organizations.map((organization) => ({
          ...organization,
          missions: organization._count.missions,
        }))}
      />
    </div>
  );
}
