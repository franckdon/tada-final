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
  loadMore,
}: {
  missions: MissionFull[];
  hasNextPage: boolean;
  pageSize: number;
  loadMore: (value: { from: number; to: number }) => Promise<MissionFull[]>;
}) {
  const t = useI18n();
  const { ref, inView } = useInView();
  const [from, setFrom] = useState(pageSize);
  const [missions, setMissions] = useState(initialData);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);

  const loadMoreData = async () => {
    const formattedFrom = from;
    const to = formattedFrom + pageSize * 2;

    try {
      if (!loadMore) return;
      const missionsPaginated = await loadMore({
        from: formattedFrom,
        to,
      });

      setMissions((prev) => [...prev, ...missionsPaginated]);
      setFrom(to);
      setHasNextPage(missionsPaginated.length > to);
    } catch {
      setHasNextPage(false);
    }
  };

  useEffect(() => {
    if (inView) {
      loadMoreData();
    }
  }, [inView]);

  return (
    <div className="flex flex-col space-y-4 items-end">
      <div className="w-full rounded-lg border border-gray-100 bg-white dark:bg-gray-900 shadow-sm p-5">
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
            />
          ))}
        </div>
        {hasNextPage && (
          <div className="flex items-center justify-center mt-6" ref={ref}>
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
