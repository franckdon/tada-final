"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Icons } from "@/components/icons";
import { NotificationCampaignCard } from "./notification-campaign-card";

export type CampaignRow = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  channels: any;
  targeting: any;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
  createdById: string | null;
  _count: { recipients: number };
};

export function ListNotificationCampaigns({
  campaigns: initialData,
  hasNextPage: initialHasNextPage,
  pageSize,
  loadMore,
}: {
  campaigns: CampaignRow[];
  hasNextPage: boolean;
  pageSize: number;
  loadMore: (value: { from: number; to: number }) => Promise<CampaignRow[]>;
}) {
  const { ref, inView } = useInView();
  const [from, setFrom] = useState(pageSize);
  const [items, setItems] = useState(initialData);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);

  const loadMoreData = async () => {
    const formattedFrom = from;
    const to = formattedFrom + pageSize * 2;

    try {
      if (!loadMore) return;
      const more = await loadMore({ from: formattedFrom, to });
      setItems((prev) => [...prev, ...more]);
      setFrom(to);
      setHasNextPage(more.length > to);
    } catch {
      setHasNextPage(false);
    }
  };

  useEffect(() => {
    if (inView) loadMoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="w-full rounded-lg border border-gray-100 bg-white dark:bg-gray-900 shadow-sm p-5">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((c) => (
            <NotificationCampaignCard key={c.id} campaign={c} />
          ))}
        </div>

        {hasNextPage && (
          <div className="flex items-center justify-center mt-6" ref={ref}>
            <div className="flex items-center space-x-2 px-6 py-5">
              <Icons.spinner className="h-4 w-4 animate-spin" />
              <span className="text-sm text-[#606060]">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
