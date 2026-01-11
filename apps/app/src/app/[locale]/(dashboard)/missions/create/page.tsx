import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreateMissionLayout } from "./CreateMissionLayout";

export const metadata = {
  title: "Create Mission | Tada",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const value = await searchParams;

  const workspaceId = value.workspaceId as string | undefined;
  const templateId = value.t as string | undefined;
  const mode = value.mode as string | undefined;

  if (!workspaceId) {
    return redirect(`/${locale}`);
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      organization: true,
    },
  });

  if (!workspace || !workspace.organization) {
    return redirect(`/${locale}`);
  }

  const organization = {
    id: workspace.organization.id,
    status: workspace.organization.status,
  };

  const shouldShowConversationCard = !templateId && (!mode || mode === "ai");

  return (
    <CreateMissionLayout
      organization={organization}
      workspace={{ id: workspace.id }}
      locale={locale}
      shouldShowConversationCard={shouldShowConversationCard}
    />
  );
}
