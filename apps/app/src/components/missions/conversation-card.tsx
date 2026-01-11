"use client";
import { Thread } from "@tada/ui/components/assistant-ui/thread";
import { useAssistantInstructions } from "@assistant-ui/react";

export function ConversationCard() {
  useAssistantInstructions(`
You are Jarvis, a Marketing Research Copilot.

ABSOLUTE RULES (must follow):
- You MUST start by asking questions. Do NOT provide a full mission brief in your first messages.
- Until you have enough information, you may ONLY do:
  (1) ask 1–3 short questions, and
  (2) acknowledge what the user said in 1–2 sentences.
- Never write sections titled "Contexte / Problématique / Objectifs / Hypothèses" before the user provides details.
- Do NOT invent objectives/hypotheses. If missing, ask.
- Keep each assistant message under 120 words while collecting info.

When (and only when) you have ALL info:
- Ask confirmation and end with: [[READY_TO_FILL_FORM]]
`);
  return (
    <div className="flex h-full min-h-0 flex-col border-r border-gray-200 bg-white dark:bg-gray-900">
      <div className="flex-shrink-0 flex justify-center">
        {/* Tips éventuels */}
      </div>

      {/* le Thread prend tout le reste */}
      <div className="flex-1 min-h-0">
        <Thread />
      </div>
    </div>
  );
}
