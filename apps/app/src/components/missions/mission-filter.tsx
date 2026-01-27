"use client";

import { useBoolean } from "@/hooks/use-boolean";
import { useCurrentLocale, useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { CreateSurveyModal } from "./modals/create-mission-modal";
import { useWorkspaceCredits } from "@/hooks/use-workspace-credits";
import { useWorkspaceCreditsStore } from "@/hooks/use-workspace-credit-store";
import { UpgradeRequiredModal } from "./modals/upgrade-required-modal";

export function MissionFilter({ orgId }: { orgId: string }) {
  const t = useI18n();
  const router = useRouter();
  const addProjectModal = useBoolean();

  const currentLocale = useCurrentLocale();

  useWorkspaceCredits(orgId);

  const balance = useWorkspaceCreditsStore((s) => s.balance);
  const subscription = useWorkspaceCreditsStore((s) => s.subscription);
  const loadingCredits = useWorkspaceCreditsStore((s) => s.loading);

  const upgradeModal = useBoolean(false);

  const [params, setParams] = useQueryStates(
    {
      status: parseAsString.withDefault("all"),
    },
    {
      shallow: false,
    },
  );

  const hasActivePlan =
    Boolean(subscription?.planCode || subscription?.planLabel) &&
    (subscription?.status ? subscription.status === "active" : true);

  const hasEnoughCredits = typeof balance === "number" ? balance > 12 : false;
  const canCreateMission = hasActivePlan || hasEnoughCredits;

  const handleBlockedCreate = () => upgradeModal.onTrue();

  return (
    <div className="flex items-center justify-between p-4 gap-3 pb-3 ">
      <div className="flex items-center">
        <CreateSurveyModal
          orgId={orgId}
          canCreate={canCreateMission}
          onBlocked={handleBlockedCreate}
          trigger={
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              {t("missions.filter.add")}
            </Button>
          }
        />
        <UpgradeRequiredModal
          open={upgradeModal.value}
          onOpenChange={upgradeModal.onFalse}
          locale={currentLocale}
          reason={!hasActivePlan ? "no_plan" : "low_credits"}
          balance={balance}
          minCredits={13}
        />
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-500">
          {t("missions.filter.title")}
        </span>
        <div className="w-44">
          <Select
            value={params.status}
            onValueChange={(value) => setParams({ status: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("missions.status.all")}</SelectItem>
              <SelectItem value="live">{t("missions.status.live")}</SelectItem>
              <SelectItem value="on hold">
                {t("missions.status.on_hold")}
              </SelectItem>
              <SelectItem value="complete">
                {t("missions.status.complete")}
              </SelectItem>
              <SelectItem value="draft">
                {t("missions.status.draft")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
