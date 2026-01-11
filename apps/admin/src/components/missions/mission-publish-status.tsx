import { useI18n } from "@/locales/client";
import { cn } from "@tada/ui/lib/utils";
import type { Mission } from "./type";

export function MissionPublishStatus({
  mission,
}: {
  mission: Pick<Mission, "isPublish">;
}) {
  const t = useI18n();

  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 mt-2 text-xs text-white rounded-sm w-fit uppercase",
        mission.isPublish && "complete" && "bg-green-400",
        !mission.isPublish && "draft" && "bg-gray-400"
      )}
    >
      {t(
        `missions.publish.${
          mission.isPublish ? "true" : "false"
        }` as keyof typeof t
      )}
    </span>
  );
}
