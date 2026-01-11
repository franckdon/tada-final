"use client";

import { DownloadCloud, Filter, Share2 } from "lucide-react";
import { cn } from "@tada/ui/lib/utils";

interface DashboardActionsRailProps {
  onExportClick: () => void;
  onFilterClick?: () => void;
  onShareClick?: () => void;
  visible?: boolean;
}

export function DashboardActionsRail({
  onExportClick,
  onFilterClick,
  onShareClick,
  visible = true,
}: DashboardActionsRailProps) {
  console.log("DashboardActionsRail visible:", visible);
  return (
    <div
      className={cn(
        "fixed right-2 top-1/3 z-10 -translate-y-1/2 transition-all duration-200",
        visible
          ? "opacity-100 translate-x-0 pointer-events-auto"
          : "opacity-0 translate-x-2 pointer-events-none"
      )}
    >
      <div className="flex flex-col gap-2 rounded-3xl bg-white shadow-md border border-slate-200 p-1">
        <IconButton
          tooltip="Filter"
          onClick={onFilterClick}
          icon={<Filter className="h-4 w-4" />}
        />
        <IconButton
          tooltip="Share"
          onClick={onShareClick}
          icon={<Share2 className="h-4 w-4" />}
        />
        <IconButton
          tooltip="Export"
          onClick={onExportClick}
          active
          icon={<DownloadCloud className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}

interface IconButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
  active?: boolean;
}

function IconButton({ icon, tooltip, onClick, active }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-2xl",
        "transition-all",
        active
          ? "bg-indigo-50 text-indigo-600"
          : "bg-transparent text-indigo-500 hover:bg-slate-50"
      )}
      aria-label={tooltip}
      title={tooltip}
    >
      {icon}
    </button>
  );
}
