import { prisma } from "@/lib/prisma";
import { TadaStudies } from "../../../../../components/market-beats/tada-studies";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function MarketBeatsPage({
  params,
}: {
  params: { orgId: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    notFound();
  }

  const [missions, organization, consultedMissions] = await Promise.all([
    prisma.mission.findMany({
      where: { isSuperAdminMission: true },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.organization.findUnique({
      where: { id: params?.orgId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    }),
    prisma.consultedMission.findMany({
      where: { organizationId: params?.orgId },
    }),
  ]);

  if (!organization) {
    return <div>Organisation introuvable.</div>;
  }

  // Determine maxMissionsAllowed based on subscription plan
  const maxMissionsAllowed =
    organization.subscription?.status === "active"
      ? organization.subscription.plan?.maxMissions || 0
      : 1;

  const consultedMissionIds = consultedMissions.map(
    (consultation) => consultation.missionId
  );

  return (
    <div className="min-h-screen">
      <TadaStudies
        billingEmail={session?.user?.email}
        organization={organization}
        missions={missions}
        maxMissionsAllowed={maxMissionsAllowed}
        consultedMissionIds={consultedMissionIds}
      />
    </div>
  );
}
