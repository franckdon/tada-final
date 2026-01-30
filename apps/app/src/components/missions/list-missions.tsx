"use client";

import { useI18n } from "@/locales/client";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Icons } from "../icons";
import { MissionCard } from "./mission-card";
import { Mission } from "@prisma/client";

type MissionFull = Mission & {
  surveys: { responses: { id: string }[] }[];
};

export function ListMissions({
  missions: initialData,
  hasNextPage: initialHasNextPage,
  pageSize,
  orgId,
  workspaceId,
  loadMore,
}: {
  missions: MissionFull[];
  hasNextPage: boolean;
  pageSize: number;
  orgId: string;
  workspaceId: string;
  loadMore: (value: { page: number }) => Promise<{
    missions: MissionFull[];
    hasNextPage: boolean;
  }>;
}) {
  const t = useI18n();
  const { ref, inView } = useInView();

  const [missions, setMissions] = useState(initialData);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [loadingMore, setLoadingMore] = useState(false);

  // ⚠️ Si initialData = page 1, la prochaine page à charger est 2
  const [page, setPage] = useState(2);

  useEffect(() => {
    setMissions(initialData);
    setHasNextPage(initialHasNextPage);
    setLoadingMore(false);
    setPage(2);
  }, [initialData, initialHasNextPage]);

  const mergeUniqueById = (prev: MissionFull[], next: MissionFull[]) => {
    const map = new Map<string, MissionFull>();
    for (const m of prev) map.set(m.id, m);
    for (const m of next) map.set(m.id, m);
    return Array.from(map.values());
  };

  const loadMoreData = async () => {
    if (!hasNextPage || loadingMore) return;

    setLoadingMore(true);
    try {
      const res = await loadMore({ page });
      setMissions((prev) => mergeUniqueById(prev, res.missions));
      setHasNextPage(res.hasNextPage);
      setPage((p) => p + 1);
    } catch {
      setHasNextPage(false);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (inView) loadMoreData();
  }, [inView]);

  return (
    <div className="flex flex-col space-y-4 items-end">
      <div className="w-full rounded-lg border border-gray-100 bg-white dark:bg-gray-900 shadow-sm">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {missions.map((task) => (
            <MissionCard
              key={task.id}
              mission={
                {
                  ...task,
                  submissions: task.surveys?.[0]?.responses?.length ?? 0,
                  percentage: Math.min(
                    100,
                    Math.round(
                      ((task.surveys?.[0]?.responses?.length ?? 0) / 1000) *
                        100,
                    ),
                  ),
                } as any
              }
              orgId={orgId}
              workspaceId={workspaceId}
              onMissionDeleted={(id) =>
                setMissions((prev) => prev.filter((m) => m.id !== id))
              }
            />
          ))}
        </div>

        {hasNextPage && (
          <div className="flex items-center justify-center mt-6 mb-4" ref={ref}>
            <div className="flex items-center space-x-2 px-6 py-5">
              <Icons.spinner className="h-4 w-4 animate-spin" />
              <span className="text-sm text-[#606060]">
                {t("common.loading")}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
