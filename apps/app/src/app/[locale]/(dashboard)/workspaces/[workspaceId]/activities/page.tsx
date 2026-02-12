//src/app/[locale]/(dashboard)/workspaces/[workspaceId]/activities/page.tsx
import { CreditsActivitiesClient } from "@/components/credits/credits-activities-client";

export const metadata = {
  title: "Missions | Tada",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { workspaceId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <div className="p-8 bg-white">
      <CreditsActivitiesClient workspaceId={workspaceId} />;
    </div>
  );
}
