import { ConversationCard } from "@/components/missions/conversation-card";
import { UpdateMissionCard } from "@/components/missions/update-mission-card";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Update Mission info| Tada",
};

export default async function Page({
  params,
}: {
  params: { missionId: string };
}) {
  const mission = await prisma.mission.findUnique({
    where: { id: params.missionId },
  });

  if (!mission) return redirect("/");

  return (
    <div className="flex h-screen bg-gray-100">
      <ConversationCard />
      <UpdateMissionCard
        mission={mission}
        originalMissionId={params?.missionId}
      />
    </div>
  );
}
