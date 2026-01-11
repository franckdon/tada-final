"use client";

import React, { useCallback, useState } from "react";
import { ConversationCard } from "@/components/missions/conversation-card";
import { CreateMissionCard } from "@/components/missions/create-mission-card";

type Props = {
  organization: { id: string; status: string | null };
  workspace: { id: string };
  locale: string;
  shouldShowConversationCard: boolean;
};

export function CreateMissionLayout({
  organization,
  workspace,
  locale,
  shouldShowConversationCard,
}: Props) {
  // largeur du panneau de conversation en %
  const [conversationWidth, setConversationWidth] = useState(35); // 35% par défaut

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newPercent = (moveEvent.clientX / window.innerWidth) * 100;

      // on borne entre 20% et 60% pour éviter des trucs extrêmes
      setConversationWidth(Math.min(60, Math.max(20, newPercent)));
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, []);

  // Si pas de conversation AI, on garde ton layout simple
  if (!shouldShowConversationCard) {
    return (
      <div className="flex h-full min-h-0 bg-gray-100">
        <div className="flex-1 min-w-0 flex h-full min-h-0">
          <CreateMissionCard
            organization={organization}
            workspace={workspace}
            locale={locale}
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
        <ConversationCard />
      </div>

      {/* Handle */}
      <div
        className="h-full w-[3px] cursor-col-resize bg-gray-200 hover:bg-gray-300"
        onMouseDown={handleMouseDown}
      />

      {/* Panneau formulaire */}
      <div className="flex-1 min-w-0 flex h-full min-h-0">
        <CreateMissionCard
          organization={organization}
          workspace={workspace}
          locale={locale}
        />
      </div>
    </div>
  );
}
