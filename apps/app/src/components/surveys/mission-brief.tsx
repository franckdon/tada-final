"use client";

import { useAudiencesFilter } from "@/context/audiences-filter-context";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { useRouter } from "next/navigation";

export function MissionBrief({
  mission,
}: {
  mission: {
    id: string;
    name: string;
    orgId: string;
    problemSummary: string;
    objectives: string;
    assumptions: string;
    audiences: Record<string | number, string | number>;
  };
}) {
  const t = useI18n();
  const { filterGroups } = useAudiencesFilter();
  const router = useRouter();
  return (
    <div className="max-w-2xl rounded-lg  p-6 dark:bg-gray-800  overflow-y-auto max-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold ">Brief</h1>
        {
          <Button
            onClick={() =>
              router.push(`/missions/${mission.orgId}/${mission?.id}/update`)
            }
          >
            {t("common.updateConfig")}
          </Button>
        }
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">
          {t("missions.createMission.form.problemSummary")}
        </h2>
        <p>{mission.problemSummary}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">
          {t("missions.createMission.form.strategicGoal")}
        </h2>
        <p>{mission.objectives}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">
          {t("missions.createMission.form.assumptions")}
        </h2>
        <p>{mission.assumptions}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">
          {t("missions.createMission.form.audiences")}
        </h2>
        <div className="flow-root">
          <div className="-mx-2 -my-1 flex flex-wrap">
            {Object.keys(mission.audiences).map((groupId) =>
              Object.keys(mission.audiences[groupId] || {}).map((filterId) => {
                const group = filterGroups.find((g) => g.id === groupId);
                const filter = group?.filters.find((f) => f.id === filterId);

                return (
                  mission.audiences![groupId as any]![filterId as any] as any
                )?.map((value) => {
                  const option = filter?.options?.find(
                    (o) => o.value === value
                  );
                  return (
                    <span
                      key={`${groupId}-${filterId}-${value}`}
                      className="m-1 inline-flex items-center rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-1 text-sm font-medium text-gray-900"
                    >
                      <span>
                        {filter?.label}: {option?.label || value}
                      </span>
                    </span>
                  );
                });
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
