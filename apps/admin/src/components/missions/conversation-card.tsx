"use client";
import { Thread } from "@tada/ui/components/assistant-ui/thread";
import { TipsAICard } from "./tips-ai-card";

export function ConversationCard() {
  return (
    <div className="w-1/3 flex flex-col border-r border-gray-200 bg-white dark:bg-gray-900">
      <div className="flex justify-center">
        <TipsAICard />
      </div>

      <Thread />
    </div>
  );
}
