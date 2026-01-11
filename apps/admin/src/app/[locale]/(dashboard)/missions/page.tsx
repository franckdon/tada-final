import { ErrorFallback } from "@/components/base/error-fallback";
import { Icons } from "@/components/icons";
import { ListMissionServer } from "@/components/missions/list-mission-server";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";

export const metadata = {
  title: "Missions | Tada",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const value = {
    ...(searchParams.q && { query: searchParams.q }),
    ...(searchParams.sort && { sort: searchParams.sort }),
    ...(searchParams.page && { page: searchParams.page }),
    ...(searchParams.status && { status: searchParams.status }),
    ...(searchParams.date && { date: searchParams.date }),
  };

  const loadingKey = JSON.stringify(value);

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
          sort={value.sort as string[]}
          page={Number(value.page) || 0}
          status={(value.status as string) || "all"}
          date={(value.date as string) || ""}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
