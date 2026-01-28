// src/app/[locale]/(dashboard)/missions/[workspaceId]/[missionId]/update/UpdateMissionLayout.tsx
"use client";

import React, { useCallback, useState } from "react";
import { ConversationCard } from "@/components/missions/conversation-card";
import { UpdateMissionCard } from "@/components/missions/update-mission-card";
import type { Mission, TempMission } from "@prisma/client";

type Props = {
  organization: { id: string; status: string | null };
  workspace: { id: string; organizationStatus: string | null };
  locale: string;
  mission: Mission | TempMission;
  originalMissionId: string;
  canEdit: boolean;
  shouldShowConversationCard: boolean;
};

export function UpdateMissionLayout({
  organization,
  workspace,
  locale,
  mission,
  originalMissionId,
  canEdit,
  shouldShowConversationCard,
}: Props) {
  const [conversationWidth, setConversationWidth] = useState(35);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newPercent = (moveEvent.clientX / window.innerWidth) * 100;
      setConversationWidth(Math.min(60, Math.max(20, newPercent)));
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, []);

  if (!shouldShowConversationCard) {
    return (
      <div className="flex h-full min-h-0 bg-gray-100">
        <div className="flex-1 min-w-0 flex h-full min-h-0">
          <UpdateMissionCard
            locale={locale}
            organization={organization}
            workspace={workspace}
            mission={mission}
            originalMissionId={originalMissionId}
            canEdit={canEdit}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 bg-gray-100">
      {/* Panneau conversation */}
      <div
        className="h-full min-h-0 flex"
        style={{ width: `${conversationWidth}%` }}
      >
        <ConversationCard locale={locale} />
      </div>

      {/* Handle */}
      <div
        className="h-full w-[3px] cursor-col-resize bg-gray-200 hover:bg-gray-300"
        onMouseDown={handleMouseDown}
      />

      {/* Panneau formulaire */}
      <div className="flex-1 min-w-0 flex h-full min-h-0">
        <UpdateMissionCard
          locale={locale}
          organization={organization}
          workspace={workspace}
          mission={mission}
          originalMissionId={originalMissionId}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
