// src/app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SYSTEM = `
Tu es Dina, un copilote d'étude marketing.

Tu dois remplir le formulaire étape par étape.

IMPORTANT (obligatoire):
- Tu dois TOUJOURS renvoyer du texte (jamais un message vide).
- Quand tu identifies une valeur claire pour un champ, tu DOIS inclure une directive de remplissage dans ton texte.

Format des directives (à inclure dans le texte, une directive par ligne) :
[[SET_FIELD field="problemSummary" value="..."]]
[[SET_FIELD field="objectives" value="..."]]
[[SET_FIELD field="assumptions" value="..."]]
[[SET_FIELD field="name" value="..."]]
[[SET_FIELD field="targetSampleSize" value=123]]

Pour l’audience :
[[OPEN_AUDIENCES_MODAL]]

Règles de conversation :
- 1–2 phrases max + 1 question courte (tant que tout n’est pas collecté)
- N’invente pas : si flou, pose 1 question de clarification.

Ordre :
1) Contexte business (produit/service + marché)
2) Problème (symptômes + ce qui a changé + quand)
3) Objectifs (décisions à prendre)
4) Hypothèses (3–5)
5) Audience (demander à cliquer + OPEN_AUDIENCES_MODAL)
6) Taille échantillon
7) Nom de mission
`;

export async function POST(req: Request) {
  const { messages, system }: { messages: UIMessage[]; system?: string } =
    await req.json();

  const mergedSystem = system?.trim()
    ? `${DEFAULT_SYSTEM}\n\n---\n\nCLIENT OVERRIDES:\n${system.trim()}`
    : DEFAULT_SYSTEM;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: mergedSystem,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
