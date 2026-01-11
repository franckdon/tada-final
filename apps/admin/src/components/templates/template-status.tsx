import { useI18n } from "@/locales/client";
import { cn } from "@tada/ui/lib/utils";
import type { Template } from "./type";

export function TemplateStatus({
  template,
}: {
  template: Pick<Template, "status">;
}) {
  const t = useI18n();

  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 mt-2 text-xs text-white rounded-sm w-fit uppercase",
        template.status === "active" && "bg-green-400",
        template.status === "inactive" && "bg-red-400",
        template.status === "draft" && "bg-gray-400",
        template.status === "on hold" && "bg-yellow-400"
      )}
    >
      {t(`templates.status_template.${template.status}` as keyof typeof t)}
    </span>
  );
}
