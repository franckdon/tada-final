"use client";

import { TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

const StatCard = ({
  item,
}: {
  item: { label: string; value: number; icon: ReactNode };
}) => {
  return (
    <div className="w-full max-w-md rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          {item.icon}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <h3 className="text-lg font-normal text-gray-600">{item.label}</h3>

        <div className="flex items-center justify-between">
          <span className="text-5xl font-bold text-gray-800">{item.value}</span>

          {/* <div className="flex items-center rounded-full bg-green-50 px-4 py-1">
            <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
            <span className="text-green-500">20%</span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
