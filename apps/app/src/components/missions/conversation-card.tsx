//src/components/missions/conversation-card.tsx
"use client";
import { Thread } from "@tada/ui/components/assistant-ui/thread";

function getWelcomeMessage(locale: string) {
  const isFr = (locale ?? "").toLowerCase().startsWith("fr");
  return isFr
    ? "Bienvenue sur Tada, je suis Dina. Comment puis-je vous aider à résoudre votre problème aujourd’hui ?"
    : "Welcome to Tada, I'm Dina. How can I help you solve your problem today?";
}

export function ConversationCard({ locale }: { locale: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col border-r border-gray-200 bg-white dark:bg-gray-900">
      <div className="flex-1 min-h-0">
        <Thread welcomeMessage={getWelcomeMessage(locale)} />
      </div>
    </div>
  );
}
