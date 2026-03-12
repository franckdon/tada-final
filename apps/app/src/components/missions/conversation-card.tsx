"use client";

import { Thread } from "@tada/ui/components/assistant-ui/thread";

function getWelcomeMessage(locale: string) {
  const isFr = (locale ?? "").toLowerCase().startsWith("fr");

  return isFr
    ? "Bienvenue sur Tada, je suis Dina. Décris-moi ton contexte business et le problème que tu veux résoudre."
    : "Welcome to Tada, I'm Dina. Tell me about your business context and the problem you want to solve.";
}

export function ConversationCard({ locale }: { locale: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col border-r border-gray-200 bg-white dark:bg-gray-900">
      <div className="flex-1 min-h-0">
        <Thread welcomeMessage={getWelcomeMessage(locale)} locale={locale} />
      </div>
    </div>
  );
}
