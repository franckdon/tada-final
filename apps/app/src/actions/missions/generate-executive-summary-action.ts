"use server";

import { prisma } from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { authActionClient } from "../safe-action";
import { promptSystemExecutiveSummary } from "./constant";
import { generateExecutiveSummarySchema } from "./schema";
import { generateStatisticalSummary } from "@/lib/utils";

export const generateExecutiveSummaryAction = authActionClient
  .schema(generateExecutiveSummarySchema)
  .metadata({
    name: "add-question-AI-action",
  })
  .action(async ({ parsedInput: { responses }, ctx: { user, auth } }) => {
    try {
      const statisticalSummary = generateStatisticalSummary(responses);

      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: z.object({
          executiveSummary: z.string(),
        }),
        prompt: `Analyse les données de sondage suivantes et génère un executive summary au format markdown.`,
        system: promptSystemExecutiveSummary.replace(
          "<USER_INPUT_HERE>",
          JSON.stringify(statisticalSummary)
        ),
      });

      return { success: true, data: object.executiveSummary };
    } catch (error) {
      console.error("[ADD_QUESTION_ERROR]", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  });
