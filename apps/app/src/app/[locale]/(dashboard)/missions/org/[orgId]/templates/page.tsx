import { ErrorFallback } from "@/components/base/error-fallback";
import { ListTemplateServer } from "@/components/templates/list-template-server";
import { NavigationBarTemplates } from "@/components/templates/navigation-bar-templates";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";

export const metadata = {
  title: "Templates | Tada",
};

export default function Page({
  params,
  searchParams,
}: {
  params: { orgId: string; missionId: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const value = {
    ...(searchParams.q && { query: searchParams.q }),
    ...(searchParams.sort && { sort: searchParams.sort }),
    ...(searchParams.page && { page: searchParams.page }),
    ...(searchParams.tab && { tab: searchParams.tab }),
  };

  const loadingKey = JSON.stringify(value);

  return (
    <div className="w-full border border-gray-100 bg-white dark:bg-gray-900 h-full">
      <NavigationBarTemplates orgId={params.orgId} />
      <div className="space-y-4 mx-8 mt-8">
        <ErrorBoundary errorComponent={ErrorFallback}>
          <Suspense fallback={<div> Loading...</div>} key={loadingKey}>
            <ListTemplateServer
              query={value.query as string}
              sort={value.sort as string[]}
              page={Number(value.page) || 0}
              orgId={params.orgId}
              tab={(value.tab as "internal" | "external") || "internal"}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
