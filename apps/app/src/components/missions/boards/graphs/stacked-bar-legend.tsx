"use client";

import { FC } from "react";

export interface LegendItem {
  key: string;
  label: string;
  color?: string;
}

interface StackedBarLegendProps {
  items: LegendItem[];
  activeKeys: string[];
  onToggle: (key: string) => void;
}

export const StackedBarLegend: FC<StackedBarLegendProps> = ({
  items,
  activeKeys,
  onToggle,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {items.map((item) => {
        const isActive = activeKeys.includes(item.key);

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onToggle(item.key)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors
              ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
          >
            {/* pastille couleur */}
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: item.color ?? "hsl(var(--chart-1))",
              }}
            />

            <span className="whitespace-nowrap">{item.label}</span>

            {/* pseudo-checkbox */}
            <span
              className={`ml-1 flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border ${
                isActive
                  ? "bg-white border-transparent"
                  : "bg-transparent border-white/40"
              }`}
            >
              {isActive && (
                <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true">
                  <path
                    d="M3 8.5 6.2 12 13 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
