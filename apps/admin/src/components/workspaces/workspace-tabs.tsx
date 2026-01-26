"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tada/ui/components/tabs";

import WorkspaceSubscriptionTab from "./workspace-tabs/workspace-subscription-tab";
import WorkspaceMembersTab from "./workspace-tabs/workspace-members-tab";
import WorkspaceMissionsTab from "./workspace-tabs/workspace-missions-tab";

export default function WorkspaceTabs({
  workspaceId,
  subscription,
  members,
  missions,
  currentCredits,
}: {
  workspaceId: string;
  subscription: any | null;
  members: any[];
  missions: any[];
  currentCredits: number;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white shadow-sm p-6">
      <Tabs defaultValue="subscription" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Détails du workspace
          </h2>
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="subscription">Abonnement</TabsTrigger>
            <TabsTrigger value="members">
              Membres ({members.length})
            </TabsTrigger>
            <TabsTrigger value="missions">
              Missions ({missions.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="subscription">
          <WorkspaceSubscriptionTab
            workspaceId={workspaceId}
            subscription={subscription}
            currentCredits={Number(currentCredits)}
          />
        </TabsContent>

        <TabsContent value="members">
          <WorkspaceMembersTab workspaceId={workspaceId} members={members} />
        </TabsContent>

        <TabsContent value="missions">
          <WorkspaceMissionsTab workspaceId={workspaceId} missions={missions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
