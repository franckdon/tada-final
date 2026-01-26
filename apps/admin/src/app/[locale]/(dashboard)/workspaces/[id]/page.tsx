import { prisma } from "@/lib/prisma";
import { getI18n } from "@/locales/server";
import Link from "next/link";
import { Button } from "@tada/ui/components/button";
import { ChevronLeft } from "lucide-react";

import WorkspaceProfileCard from "@/components/workspaces/workspace-profile-card";
import WorkspaceDetails from "@/components/workspaces/workspace-details";
import WorkspaceTabs from "@/components/workspaces/workspace-tabs";

export const metadata = {
  title: "Workspace | Tada",
};

type Locale = "fr" | "en";

export default async function WorkspacePage({
  params,
}: {
  params: { id: string; locale: Locale };
}) {
  const t = await getI18n();
  const now = new Date();

  const workspace = await prisma.workspace.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      industry: true,
      companySize: true,
      country: true,
      createdAt: true,
      updatedAt: true,

      owner: { select: { id: true, name: true, email: true } },
      organization: {
        select: { id: true, name: true, slug: true, status: true },
      },

      workspace_credit_account: { select: { balance: true } },

      workspacePlanSubscription: {
        select: {
          id: true,
          planCode: true,
          status: true,
          startsAt: true,
          endsAt: true,
          source: true,
          note: true,
          assignedByUser: { select: { id: true, name: true, email: true } },
          createdAt: true,
          updatedAt: true,
        },
      },

      _count: {
        select: {
          members: true,
          missions: true,
        },
      },
    },
  });

  if (!workspace) return <div>{t("workspace.detail.notFound")}</div>;

  // Members list
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      role: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          country: true,
          role: true,
        },
      },
      invitedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Missions list
  const missions = await prisma.mission.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      isPublish: true,
      createdAt: true,
      publishAt: true,
      organization: { select: { id: true, name: true } },
    },
  });

  // Subscription computed status
  const sub = workspace.workspacePlanSubscription;
  const isActive =
    !!sub &&
    sub.status === "active" &&
    (!sub.startsAt || sub.startsAt <= now) &&
    (!sub.endsAt || sub.endsAt > now);

  const subscription = sub
    ? {
        ...sub,
        isActive,
      }
    : null;

  return (
    <div className="p-5 text-gray-800 space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/workspaces">
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t("common.goBack")}
        </Link>
      </Button>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-2">
          <WorkspaceProfileCard workspace={{ ...workspace, subscription }} />
        </div>
        <div className="md:col-span-3">
          <WorkspaceDetails workspace={{ ...workspace, subscription }} />
        </div>
      </div>

      <WorkspaceTabs
        workspaceId={workspace.id}
        subscription={subscription}
        members={members}
        missions={missions}
        currentCredits={workspace.workspace_credit_account?.balance ?? 0}
      />
    </div>
  );
}
