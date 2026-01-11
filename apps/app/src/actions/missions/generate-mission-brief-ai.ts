"use server";

import { authActionClient } from "../safe-action";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const MissionBriefSchema = z.object({
  name: z.string(),
  problemSummary: z.string(),
  objectives: z.string(),
  assumptions: z.string(),
  sampleSummary: z.string(),
  targetSampleSize: z.number().int().positive().nullable().optional(),
  preliminaryRecommendations: z.string(),
  studyStructure: z.string(),
});

const generateMissionBriefInputSchema = z.object({
  locale: z.string().optional(),
  transcript: z.string().min(1),
  currentBrief: z
    .object({
      name: z.string().optional().nullable(),
      problemSummary: z.string().optional().nullable(),
      objectives: z.string().optional().nullable(),
      assumptions: z.string().optional().nullable(),
      sampleSummary: z.string().optional().nullable(),
      targetSampleSize: z.number().int().positive().optional().nullable(),
      preliminaryRecommendations: z.string().optional().nullable(),
      studyStructure: z.string().optional().nullable(),
    })
    .optional(),
  audiences: z.record(z.string(), z.any()).optional(),
});

export const generateMissionBriefAIAction = authActionClient
  .schema(generateMissionBriefInputSchema)
  .metadata({ name: "generate-mission-brief-ai" })
  .action(async ({ parsedInput }) => {
    const { locale, transcript, currentBrief, audiences } = parsedInput;

    // LOG SERVER (utile pour confirmer)
    console.log("[GEN_BRIEF] locale:", locale);
    console.log("[GEN_BRIEF] transcript chars:", transcript?.length);
    console.log("[GEN_BRIEF] audiences keys:", audiences ? Object.keys(audiences) : []);

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: MissionBriefSchema,
      system: `
Tu es Jarvis, expert en études marketing.
Tu dois produire un brief complet d’étude prêt à être utilisé dans la plateforme Tada.
La langue de sortie doit suivre la langue dominante de la conversation (ou locale si fournie).`,
      prompt: `
CONVERSATION (transcript) :
${transcript}

BRIEF ACTUEL (peut être vide) :
${JSON.stringify(currentBrief ?? {}, null, 2)}

AUDIENCES (JSON) :
${JSON.stringify(audiences ?? {}, null, 2)}

Tâche :
- Génère/complète un brief complet (name, problemSummary, objectives, assumptions, sampleSummary, targetSampleSize, preliminaryRecommendations, studyStructure).
- Si certaines infos sont absentes de la conversation, propose des hypothèses raisonnables, mais reste prudent.
- Si des informations sont absentes ou ambiguës dans la conversation, laisse le champ concerné vide ou mets "À préciser".
- N’invente pas de données.
`,
    });

    return { success: true, data: object };
  });
