"use client";

import { useState } from "react";
import { useI18n } from "@/locales/client";
import { useToast } from "@/hooks/use-toast";
import { useAudiencesFilter } from "@/context/audiences-filter-context";
import { Button } from "@tada/ui/components/button";
import { ChevronDown, Lightbulb } from "lucide-react";

type Props = {
  orgId: string;
  missionId?: string;
  currentUserId?: string | null;
  initialGroupId?: string;
};

export function AudienceSuggestionSection({
  orgId,
  missionId,
  currentUserId,
  initialGroupId,
}: Props) {
  const t = useI18n();
  const { toast } = useToast();
  const { filterGroups, submitSuggestion } = useAudiencesFilter();

  const [isOpen, setIsOpen] = useState(false);
  const [groupId, setGroupId] = useState<string | undefined>(initialGroupId);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!label.trim()) {
      toast({
        variant: "destructive",
        title: t("common.error.somethingWentWrong"),
        description: t(
          "missions.createMission.form.audienceSuggestionLabelRequired"
        ),
      });
      return;
    }

    try {
      setIsSending(true);

      await submitSuggestion({
        groupId,
        label: label.trim(),
        description: description.trim() || undefined,
      });

      toast({
        title: t("missions.createMission.form.audienceSuggestionSentTitle"),
        description: t(
          "missions.createMission.form.audienceSuggestionSentDescription"
        ),
      });

      setLabel("");
      setDescription("");
      setGroupId(initialGroupId);
      setIsOpen(false);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: t("common.error.somethingWentWrong"),
        description: t(
          "missions.createMission.form.audienceSuggestionErrorDescription"
        ),
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      {/* header accordéon, une seule ligne */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-left text-sm hover:bg-gray-100"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <span className="font-medium text-gray-800">
            {t("missions.createMission.form.audienceSuggestionHelper")}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3">
          {/* ligne 1 : select + input */}
          <div className="flex flex-col gap-3 md:flex-row">
            <select
              className="md:w-1/3 rounded border border-gray-300 px-2 py-2 text-sm"
              value={groupId ?? ""}
              onChange={(e) =>
                setGroupId(e.target.value ? e.target.value : undefined)
              }
            >
              <option value="">
                {t(
                  "missions.createMission.form.audienceSuggestionGroupPlaceholder"
                ) ?? "Select audience group"}
              </option>
              {filterGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="md:flex-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t(
                "missions.createMission.form.audienceSuggestionLabelPlaceholder"
              )}
            />
          </div>

          {/* description */}
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t(
              "missions.createMission.form.audienceSuggestionDescriptionPlaceholder"
            )}
          />

          <div className="flex justify-end">
            <Button size="sm" onClick={handleSend} disabled={isSending}>
              {isSending
                ? t("missions.createMission.form.audienceSuggestionSending")
                : t("missions.createMission.form.audienceSuggestionCta")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
