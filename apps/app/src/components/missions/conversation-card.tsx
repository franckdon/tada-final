"use client";
import { Thread } from "@tada/ui/components/assistant-ui/thread";
import { useAssistantInstructions } from "@assistant-ui/react";

function getWelcomeMessage(locale: string) {
  const isFr = (locale ?? "").toLowerCase().startsWith("fr");
  return isFr
    ? "Bienvenue sur Tada, je suis Dina. Comment puis-je vous aider à résoudre votre problème aujourd’hui ?"
    : "Welcome to Tada, I'm Dina. How can I help you solve your problem today?";
}

export function ConversationCard({ locale }: { locale: string }) {
  useAssistantInstructions(`
You are Dina, a Marketing Research Copilot.

Rules:
- Start by asking questions (1–3 max).
- As soon as you have a clear value for a form field, you MUST call set_form_field immediately.
- Do NOT wait until the end to fill everything.
- After hypotheses, ask user to select audience and call open_audiences_modal.

Do not invent missing info; ask if unclear.
`);

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-gray-200 bg-white dark:bg-gray-900">
      <div className="flex-1 min-h-0">
        <Thread welcomeMessage={getWelcomeMessage(locale)} />
      </div>
    </div>
  );
}
