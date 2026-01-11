"use client";

import { useI18n } from "@/locales/client";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Icons } from "../icons";
import { MissionCard } from "./mission-card";
import { Mission } from "@prisma/client";

type MissionFull = Mission & {
  survey: {
    response: { id: string }[];
  }[];
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
  const [from, setFrom] = useState(pageSize);
  const [page, setPage] = useState(1);
  const [missions, setMissions] = useState(initialData);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setMissions(initialData);
    setFrom(pageSize);
    setHasNextPage(initialHasNextPage);
  }, [initialData, initialHasNextPage, pageSize]);

  const loadMoreData = async () => {
    if (!hasNextPage || loadingMore) return;
    setLoadingMore(true);

    try {
      const res = await loadMore({ page });
      setMissions((prev) => [...prev, ...res.missions]);
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

  useEffect(() => {
    if (inView) {
      loadMoreData();
    }
  }, [inView]);

  return (
    <div className="flex flex-col space-y-4 items-end">
      <div className="w-full rounded-lg border border-gray-100 bg-white dark:bg-gray-900 shadow-sm">
        {/* Header de la liste */}
        {/* <div className="grid grid-cols-[4fr,3fr,3fr,3fr,auto] items-center px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
          <div className="text-left">
            {t("missions.list.columns.name") || "Mission"}
          </div>
          <div className="text-center">
            {t("missions.list.columns.progress") || "Progress"}
          </div>
          <div className="text-center">
            {t("missions.list.columns.submissions") || "Submissions"}
          </div>
          <div className="text-center">
            {t("missions.list.columns.updated") || "Last update"}
          </div>
          <div className="text-center">
            {t("missions.list.columns.actions") || "Actions"}
          </div>
        </div> */}

        {/* Lignes */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {missions.map((task) => (
            <MissionCard
              key={task.id}
              mission={
                {
                  ...task,
                  submissions:
                    task.survey.length > 0
                      ? task.survey[0]!.response.length
                      : 0 || 0,
                  percentage: Math.min(
                    100,
                    Math.round(
                      ((task.survey.length > 0
                        ? task.survey[0]!.response.length
                        : 0) /
                        1000) *
                        100
                    )
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

        {/* Loader infinite scroll */}
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
