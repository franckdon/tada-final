"use client";

import { useI18n } from "@/locales/client";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Icons } from "../icons";
import { TemplateCard } from "./template-card";
import type { Template } from "./type";

export function ListTemplates({
  templates: initialData,
  hasNextPage: initialHasNextPage,
  pageSize,
  orgId,
  loadMore,
}: {
  templates: Template[];
  hasNextPage: boolean;
  pageSize: number;
  orgId: string;
  loadMore?: (value: { from: number; to: number }) => Promise<Template[]>;
}) {
  const t = useI18n();
  const { ref, inView } = useInView();
  const [from, setFrom] = useState(pageSize);
  const [templates, setTemplates] = useState(initialData);
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage);

  const loadMoreData = async () => {
    const formattedFrom = from;
    const to = formattedFrom + pageSize * 2;

    try {
      if (!loadMore) return;
      const templatesPaginated = await loadMore({
        from: formattedFrom,
        to,
      });

      setTemplates((prev) => [...prev, ...templatesPaginated]);
      setFrom(to);
      setHasNextPage(templatesPaginated.length > to);
    } catch {
      setHasNextPage(false);
    }
  };

  useEffect(() => {
    if (inView) {
      loadMoreData();
    }
  }, [inView]);

  useEffect(() => {
    setTemplates(initialData);
  }, [initialData]);

  return (
    <div className="w-full rounded-lg border border-gray-100 bg-white dark:bg-gray-900 shadow-sm">
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} orgId={orgId} />
        ))}
      </div>
      {hasNextPage && (
        <div className="flex items-center justify-center mt-6" ref={ref}>
          <div className="flex items-center space-x-2 px-6 py-5">
            <Icons.spinner className="h-4 w-4" />
            <span className="text-sm text-[#606060]">
              {t("common.loading")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
