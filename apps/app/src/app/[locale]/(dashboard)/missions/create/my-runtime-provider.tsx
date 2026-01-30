"use client";

import * as React from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { useParams } from "next/navigation";

function buildSystem(locale: string) {
  const isFr = (locale ?? "").toLowerCase().startsWith("fr");
  return isFr
    ? `
Tu es Dina, un copilote d'étude marketing.

Règle stricte: tu dois commencer par poser exactement 2 questions courtes :
1) Quel est ton produit/service et sur quel marché ?
2) Quel problème business veux-tu résoudre (symptômes + ce qui a changé + quand) ?

Ensuite, pose 1–3 questions max par message jusqu’à avoir:
- problemSummary, objectives, assumptions, mission name, target sample size, audience
Quand tout est OK: demander confirmation et finir par [[READY_TO_FILL_FORM]].
`
    : `
You are Dina, a Marketing Research Copilot.

Strict rule: start by asking exactly 2 short questions:
1) What product/service and which market?
2) What business problem are you trying to solve (symptoms + what changed + when)?

Then ask 1–3 questions per message until you have:
- problemSummary, objectives, assumptions, mission name, target sample size, audience
When complete: ask confirmation and end with [[READY_TO_FILL_FORM]].
`;
}

export function MyRuntimeProvider({ children }: { children: React.ReactNode }) {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? "en";

  const system = React.useMemo(() => buildSystem(locale), [locale]);

  const chat = useChat({
    api: "/api/chat",
    body: { system },
  });

  const runtime = useAISDKRuntime(chat);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
