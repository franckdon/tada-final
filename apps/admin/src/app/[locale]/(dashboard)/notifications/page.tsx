import { ErrorFallback } from "@/components/base/error-fallback";
import { Icons } from "@/components/icons";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { ListNotificationCampaignServer } from "@/components/notifications/list-notification-campaign-server";
import { Button } from "@tada/ui/components/button";
import { Plus } from "lucide-react";
import { CreateNotificationCampaignModal } from "@/components/notifications/create-notification-campaign-modal";

export const metadata = {
  title: "Notifications | Tada",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const value = {
    ...(searchParams.q && { query: searchParams.q }),
    ...(searchParams.page && { page: searchParams.page }),
    ...(searchParams.status && { status: searchParams.status }),
    ...(searchParams.channel && { channel: searchParams.channel }),
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Notifications</h1>

          <CreateNotificationCampaignModal />
        </div>
        <ListNotificationCampaignServer
          query={value.query as string}
          page={Number(value.page) || 0}
          status={(value.status as string) || "all"}
          channel={(value.channel as string) || "all"}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
