import { useI18n } from "@/locales/client";
import { cn } from "@tada/ui/lib/utils";
import type { Mission } from "./type";

export function MissionStatus({
  mission,
}: { mission: Pick<Mission, "status"> }) {
  const t = useI18n();

  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 mt-2 text-xs text-white rounded-sm w-fit uppercase",
        mission.status === "live" && "bg-blue-400",
        mission.status === "complete" && "bg-green-400",
        mission.status === "draft" && "bg-gray-400",
        mission.status === "on hold" && "bg-yellow-400",
        mission.status === "cancelled" && "bg-red-400",
        mission.status === "paused" && "bg-gray-400",
      )}
    >
      {t(`missions.status.${mission.status}` as keyof typeof t)}
    </span>
  );
}
