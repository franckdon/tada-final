import { ErrorFallback } from "@/components/base/error-fallback";
import { Icons } from "@/components/icons";
import { ListMissionServer } from "@/components/missions/list-mission-server";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";

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

  const value = {
    ...(resolvedSearchParams.q && { query: resolvedSearchParams.q }),
    ...(resolvedSearchParams.sort && { sort: resolvedSearchParams.sort }),
    ...(resolvedSearchParams.page && { page: resolvedSearchParams.page }),
    ...(resolvedSearchParams.status && { status: resolvedSearchParams.status }),
    ...(resolvedSearchParams.date && { date: resolvedSearchParams.date }),
  };

  const loadingKey = JSON.stringify(value);

  console.log("Loading missions with params:", value);
  return (
    <ErrorBoundary errorComponent={ErrorFallback}>
      <Suspense
        fallback={
          <div className="flex flex-col w-full h-full justify-center items-center">
            <Icons.spinner className="animate-spin" />
            Loading...
          </div>
        }
        key={loadingKey}
      >
        <ListMissionServer
          query={value.query as string}
          sort={(value.sort as string[]) || ["createdAt"]}
          page={Number(value.page) || 0}
          status={(value.status as string) || "all"}
          date={(value.date as string) || ""}
          orgId={workspaceId}
          workspaceId={workspaceId}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
