// src/app/[locale]/(dashboard)/missions/[workspaceId]/[missionId]/update/page.tsx
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UpdateMissionLayout } from "./UpdateMissionLayout";

export const metadata = {
  title: "Update Mission info | Tada",
};

function normalizeStatus(s?: string | null) {
  return (s ?? "").trim().toLowerCase().replace(/[_-]/g, " ");
}

function isMissionEditable(status?: string | null) {
  const st = normalizeStatus(status);
  return st === "draft" || st === "on hold";
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; workspaceId: string; missionId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale, workspaceId, missionId } = await params;
  const sp = await searchParams;

  const mode = sp.mode as string | undefined;
  const shouldShowConversationCard = !mode || mode === "ai";

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      name: true,
      organization: {
        select: { id: true, status: true },
      },
    },
  });

  if (!workspace?.organization) {
    return redirect(`/${locale}`);
  }

  const tempMission = await prisma.tempMission.findFirst({
    where: { missionId },
    select: {
      id: true,
      missionId: true,
      name: true,
      problemSummary: true,
      objectives: true,
      assumptions: true,
      audiences: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const mission =
    tempMission ??
    (await prisma.mission.findFirst({
      where: { id: missionId, workspaceId },
      select: {
        id: true,
        name: true,
        problemSummary: true,
        objectives: true,
        assumptions: true,
        audiences: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }));

  if (!mission) {
    return redirect(`/${locale}/missions/${workspaceId}`);
  }

  const canEdit = isMissionEditable(mission.status);

  return (
    <UpdateMissionLayout
      locale={locale}
      organization={{
        id: workspace.organization.id,
        status: workspace.organization.status,
      }}
      workspace={{
        id: workspace.id,
        organizationStatus: workspace.organization.status,
      }}
      mission={mission}
      originalMissionId={missionId}
      canEdit={canEdit}
      shouldShowConversationCard={shouldShowConversationCard}
    />
  );
}
