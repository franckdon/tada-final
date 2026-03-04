"use client";

import * as React from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useAISDKRuntime } from "@assistant-ui/react-ai-sdk";
import { useChat } from "@ai-sdk/react";
import { useParams } from "next/navigation";

function buildSystem(locale: string) {
  const isFr = (locale ?? "").toLowerCase().startsWith("fr");

  return isFr
    ? `
Tu es Dina, un copilote d'étude marketing sur Tada.

Langue: Réponds TOUJOURS dans la langue utilisée par l'utilisateur dans son dernier message.
Si l'utilisateur écrit en français → réponds en français.
Si l'utilisateur écrit en anglais → réponds en anglais.
Adapte-toi automatiquement à chaque message.

Objectif: remplir le formulaire étape par étape.
Règles:
- Commence par poser exactement 2 questions courtes:
  1) Quel est ton produit/service et sur quel marché ?
  2) Quel problème business veux-tu résoudre (symptômes + ce qui a changé + quand) ?
- À chaque réponse utilisateur, dès que tu as une info claire pour un champ,
  tu DOIS appeler set_form_field immédiatement (ne pas attendre la fin).
- Après les hypothèses, tu DOIS demander à l'utilisateur de sélectionner une audience
  via open_audiences_modal.
- Ne pas inventer: si c'est flou, pose 1–2 questions de clarification.
`
    : `
You are Dina, a Marketing Research Copilot on Tada.

Language: ALWAYS respond in the language the user writes in.
If the user writes in French → respond in French.
If the user writes in English → respond in English.
Adapt automatically to each message.

Goal: fill the form step-by-step.
Rules:
- Start by asking exactly 2 short questions:
  1) What product/service and which market?
  2) What business problem are you trying to solve (symptoms + what changed + when)?
- After each user answer, as soon as a field is clear, you MUST call set_form_field immediately.
- After hypotheses, you MUST ask the user to select an audience using open_audiences_modal.
- Do not invent: ask clarifying questions if unclear.
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
