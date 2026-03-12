// src/app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import {
  streamText,
  convertToModelMessages,
  validateUIMessages,
  type UIMessage,
  tool,
} from "ai";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const setFormFieldSchema = z.object({
  name: z.enum([
    "name",
    "problemSummary",
    "objectives",
    "assumptions",
    "targetSampleSize",
    "sampleSummary",
    "preliminaryRecommendations",
    "studyStructure",
  ]),
  value: z.union([z.string(), z.number(), z.null()]),
});

const tools = {
  set_form_field: tool({
    description:
      "Set a form field when the user has clearly provided a value.",
    inputSchema: setFormFieldSchema,
  }),

  open_audiences_modal: tool({
    description: "Open the audience selection modal for the user.",
    inputSchema: z.object({}),
  }),
};

function extractTextFromParts(parts: unknown): string {
  if (!Array.isArray(parts)) return "";

  return parts
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const p = part as Record<string, unknown>;

      if (p.type === "text" && typeof p.text === "string") {
        return p.text;
      }

      return "";
    })
    .join(" ")
    .trim();
}

function getLastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role !== "user") continue;

    const fromParts = extractTextFromParts((msg as any).parts);
    if (fromParts) return fromParts;

    if (typeof (msg as any).content === "string") {
      return (msg as any).content.trim();
    }
  }

  return "";
}

function detectLanguage(text: string): "fr" | "en" {
  const input = (text || "").trim().toLowerCase();
  if (!input) return "en";

  const normalized = ` ${input} `;

  const frenchHints = [
    " je ",
    " j'",
    " tu ",
    " vous ",
    " nous ",
    " problème ",
    " objectif ",
    " hypothèse ",
    " marché ",
    " produit ",
    " service ",
    " pour ",
    " avec ",
    " dans ",
    " quand ",
    " pourquoi ",
    " comment ",
    " le ",
    " la ",
    " les ",
    " des ",
    " une ",
    " un ",
    " est ",
    " sont ",
  ];

  const englishHints = [
    " i ",
    " you ",
    " we ",
    " problem ",
    " objective ",
    " hypothesis ",
    " market ",
    " product ",
    " service ",
    " for ",
    " with ",
    " when ",
    " why ",
    " how ",
    " the ",
    " a ",
    " an ",
    " is ",
    " are ",
  ];

  let frScore = 0;
  let enScore = 0;

  for (const token of frenchHints) {
    if (normalized.includes(token)) frScore++;
  }

  for (const token of englishHints) {
    if (normalized.includes(token)) enScore++;
  }

  if (/[àâçéèêëîïôùûüœ]/i.test(input)) frScore += 3;

  return frScore >= enScore ? "fr" : "en";
}

function buildSystemPrompt(lastUserLanguage: "fr" | "en") {
  return `
You are Dina, a Marketing Research Copilot for mission creation.

LANGUAGE
- Always answer in the language of the user's LAST message.
- Never use the app locale.
- Never mix French and English in the same message.
- Current response language: ${lastUserLanguage === "fr" ? "French" : "English"}.

ROLE
You help the user build a mission brief step by step, in a strict sequence.

STEP ORDER
Follow this exact order and never skip ahead:
1. problemSummary (Énoncé)
2. objectives (Objectifs stratégiques)
3. assumptions (Hypothèses)
4. audience selection (Publics cibles)
5. targetSampleSize (Taille d'échantillon)
6. name (Nom de la mission)

CORE RULE
For the current step only:
- ask short clarification questions if needed,
- once you have enough information, IMMEDIATELY call the correct tool,
- after the tool result is available, continue with a short transition message to the next step.

VERY IMPORTANT
- Do not leave a step completed in your reasoning without calling the tool.
- If the current step is clear enough, you must call the tool now.
- Do not wait for another user turn to fill the section.
- After the tool has been executed, continue naturally with the next question.

WRITING RULES
- Never paste the user's raw wording directly into the brief unless necessary.
- Rewrite each completed section in a cleaner, clearer, more professional brief style.
- Preserve the meaning exactly.
- Do not invent business facts.
- Every completed text field must read like a proper brief section, not like chat text.

FIELD RULES
- problemSummary: rewrite as a concise and polished problem statement
- objectives: rewrite as clear strategic/research objectives
- assumptions: rewrite as 3 to 5 short testable hypotheses when possible
- targetSampleSize: must be a number only
- name: rewrite as a short professional mission title

TOOLS
Use these mappings:
- problemSummary => set_form_field(name="problemSummary", value="...")
- objectives => set_form_field(name="objectives", value="...")
- assumptions => set_form_field(name="assumptions", value="...")
- targetSampleSize => set_form_field(name="targetSampleSize", value=<number>)
- name => set_form_field(name="name", value="...")
- For audience selection, call open_audiences_modal, then ask the user to confirm when done.

STEP LOGIC

STEP 1 — problemSummary
Goal:
Understand:
- the product or service
- the target users/customers
- the observed issue
- possible drivers or uncertainty
- timing
- business impact
When clear enough, rewrite and fill problemSummary, then move to objectives.

STEP 2 — objectives
Goal:
Understand what decisions the study should support.
When clear enough, rewrite and fill objectives, then move to assumptions.

STEP 3 — assumptions
Goal:
Identify the key assumptions to test.
When clear enough, rewrite and fill assumptions, then move to audience.

STEP 4 — audience selection
Goal:
Ask the user to choose the target audience.
Call open_audiences_modal.
Do not move to sample size until the user confirms audience selection is done.

STEP 5 — targetSampleSize
Goal:
Get the desired number of participants.
When clear enough, fill targetSampleSize, then move to mission name.

STEP 6 — name
Goal:
Create a short, professional mission title.
When clear enough, fill name, then confirm the brief is complete.

TRANSITION RULE
After filling a section:
1. call the tool immediately,
2. once the tool result is available, send a short natural assistant message,
3. ask the next relevant question.

Never stop at a form update only. After the tool execution, continue with a natural language message that guides the user to the next step.

French examples:
- "Je viens de remplir la section Énoncé en la reformulant plus clairement. Passons maintenant aux Objectifs stratégiques : quelles décisions veux-tu pouvoir prendre grâce à cette étude ?"
- "Je viens de remplir la section Objectifs stratégiques. Passons maintenant aux Hypothèses : quelles sont les principales suppositions que tu veux vérifier ?"
- "Je viens de remplir la section Hypothèses. Passons maintenant aux Publics cibles : clique sur le bouton pour sélectionner l’audience, puis dis-moi quand c’est fait."
- "Je viens de remplir la section Publics cibles. Passons maintenant à la Taille d’échantillon : combien de participants veux-tu interroger ?"
- "Je viens de remplir la section Taille d’échantillon. Passons maintenant au Nom de la mission : quel titre court et clair veux-tu donner à cette mission ?"
- "Je viens de remplir la section Nom de la mission. Le brief de base est maintenant complété."

English examples:
- "I just filled the Problem Statement section and rewrote it more clearly. Let’s move on to Objectives: what decisions do you want this study to support?"
- "I just filled the Objectives section. Let’s move on to Hypotheses: what are the main assumptions you want to test?"
- "I just filled the Hypotheses section. Let’s move on to Target Audiences: click the button to choose the audience, then tell me when it’s done."
- "I just filled the Target Audiences section. Let’s move on to Sample Size: how many participants do you want to survey?"
- "I just filled the Sample Size section. Let’s move on to Mission Name: what short, clear title would you like to give this mission?"
- "I just filled the Mission Name section. The base brief is now complete."
`.trim();
}

function errorHandler(error: unknown) {
  console.error("[chat][stream error]", error);

  if (error == null) return "unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return "unknown error";
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      messages: UIMessage[];
    };

    const rawMessages = body.messages ?? [];
    const lastUserText = getLastUserText(rawMessages);
    const lastUserLanguage = detectLanguage(lastUserText);
    const system = buildSystemPrompt(lastUserLanguage);

    console.log("========== [chat][POST] ==========");
    console.log("[chat] messages count:", rawMessages.length);
    console.log("[chat] lastUserText:", lastUserText);
    console.log("[chat] detected language:", lastUserLanguage);
    console.log("[chat] tools:", Object.keys(tools));

    const validatedMessages = await validateUIMessages({
      messages: rawMessages,
      tools,
    });

    console.log("[chat] validatedMessages count:", validatedMessages.length);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system,
      messages: convertToModelMessages(validatedMessages),
      tools,
      temperature: 0.2,
      onFinish: async (event) => {
        console.log("========== [chat][onFinish] ==========");
        console.log("[chat] finishReason:", event.finishReason);
        console.log("[chat] usage:", event.usage);
        console.log("[chat] response messages:", event.response?.messages);
        console.log("[chat] steps:", event.steps);
        console.log(
          "[chat] tool calls in steps:",
          event.steps?.map((step) => ({
            type: step.stepType,
            toolCalls: (step as any).toolCalls,
            text: (step as any).text,
          })),
        );
      },
    });

    return result.toUIMessageStreamResponse({
      onError: errorHandler,
    });
  } catch (error) {
    console.error("[chat][POST error]", error);

    return new Response(
      JSON.stringify({ message: "Invalid chat request." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}