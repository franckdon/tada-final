// apps/admin/src/components/pricing/pricing-page-header.tsx
"use client";

import { ReactNode } from "react";
import { Button } from "@tada/ui/components/button";
import { cn } from "@tada/ui/lib/utils";

export function PricingPageHeader({
  title,
  description,
  right,
  className,
}: {
  title: string;
  description?: string;
  right?: ReactNode; // CTA ou actions
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}
