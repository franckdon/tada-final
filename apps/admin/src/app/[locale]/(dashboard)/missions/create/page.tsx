import { ConversationCard } from "@/components/missions/conversation-card";
import { CreateMissionCard } from "@/components/missions/create-mission-card";

export const metadata = {
  title: "Create Mission | Tada",
};

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const templateId = searchParams.t;
  const mode = searchParams.mode;

  const shouldShowConversationCard =
    !templateId && (!mode || mode === "ai" || mode === "contributor-info");

  return (
    <div className="flex h-screen bg-gray-100">
      {shouldShowConversationCard && <ConversationCard />}
      <CreateMissionCard />
    </div>
  );
}
