// src/actions/missions/create-mission-action.ts
"use server";

import { prisma } from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { authActionClient } from "../safe-action";
import { promptSystem } from "./constant";
import { SurveyQuestionSchema, createMissionSchema } from "./schema";

/**
 * Business coverage requirements.
 * These MUST NOT be embedded into the schema passed to generateObject(),
 * otherwise the model can fail "hard" and produce AI_NoObjectGeneratedError.
 */
const REQUIRED_MIN = {
  single_choice: 2,
  multiple_choice: 2,
  open: 1,
  matrix: 1,
  boolean: 1,
};

const SCALE_TYPES = ["likert", "rating", "numeric_scale", "slider"] as const;
type ScaleType = (typeof SCALE_TYPES)[number];

const hasScale = (t: string) => (SCALE_TYPES as readonly string[]).includes(t);

const MAX_TOTAL_QUESTIONS = 25;
const MIN_TOTAL_QUESTIONS = 10;
const PAGE_SIZE = 10;

/**
 * IMPORTANT:
 * - No z.union in the schema used for generateObject() to avoid invalid JSON Schema for /v1/responses.
 * - Accept two output formats:
 *   (A) { title, description, elements: [...] }  (SurveyJS-ish)
 *   (B) { questions: [...] }                    (legacy internal)
 * - Root MUST be an object.
 *
 * This schema validates STRUCTURE only. Business coverage is validated separately.
 */
const SurveyResultSchemaBase = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    elements: z.array(SurveyQuestionSchema).optional(),
    questions: z.array(SurveyQuestionSchema).optional(),
  })
  .refine(
    (v) => (v.elements?.length ?? 0) > 0 || (v.questions?.length ?? 0) > 0,
    {
      message: "Model must return either `elements` or `questions`.",
      path: ["elements"],
    }
  );

type SurveyResultBase = z.infer<typeof SurveyResultSchemaBase>;

function normalizeQuestions(obj: SurveyResultBase) {
  const questions = obj.elements?.length ? obj.elements : obj.questions ?? [];
  return {
    title: obj.title,
    description: obj.description,
    questions,
  };
}

function countByType(qs: Array<any>) {
  const m = new Map<string, number>();
  for (const q of qs) {
    const t = q?.type;
    if (typeof t !== "string") continue;
    m.set(t, (m.get(t) ?? 0) + 1);
  }
  return m;
}

function coverageIssues(qs: Array<any>) {
  const issues: string[] = [];
  const count = countByType(qs);

  for (const [k, min] of Object.entries(REQUIRED_MIN)) {
    if ((count.get(k) ?? 0) < min) issues.push(`need at least ${min} "${k}" questions`);
  }

  const scaleCount = qs.filter((q) => hasScale(q?.type)).length;
  if (scaleCount < 2) {
    issues.push('need at least 2 scale questions among "likert|rating|numeric_scale|slider"');
  }

  const hasRanking = qs.some((q) => q?.type === "ranking" || q?.type === "image_ranking");
  if (!hasRanking) issues.push('need at least 1 "ranking" or "image_ranking" question');

  return issues;
}

function clampQuestions(qs: Array<any>) {
  if (qs.length > MAX_TOTAL_QUESTIONS) return qs.slice(0, MAX_TOTAL_QUESTIONS);
  return qs;
}

function uniqueName(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function ensureMinSingleChoice(qs: Array<any>, min = 2) {
  const count = qs.filter((q) => q?.type === "single_choice").length;
  const missing = Math.max(0, min - count);
  for (let i = 0; i < missing; i++) {
    qs.push({
      type: "single_choice",
      category: "single_choice",
      name: uniqueName("sc_auto"),
      title:
        i === 0
          ? "Quel est votre niveau global de satisfaction vis-à-vis des recommandations ?"
          : "Quelle est la principale raison qui explique votre faible utilisation des recommandations ?",
      isRequired: true,
      choices:
        i === 0
          ? ["Très satisfait", "Satisfait", "Neutre", "Insatisfait", "Très insatisfait"]
          : [
              "Recommandations peu pertinentes",
              "Je ne comprends pas pourquoi ces contenus sont proposés",
              "La fonctionnalité est difficile à trouver/utiliser",
              "L’application est lente ou bugge",
              "Je n’utilise pas cette fonctionnalité",
            ],
    });
  }
}

function ensureMinMultipleChoice(qs: Array<any>, min = 2) {
  const count = qs.filter((q) => q?.type === "multiple_choice").length;
  const missing = Math.max(0, min - count);
  for (let i = 0; i < missing; i++) {
    qs.push({
      type: "multiple_choice",
      category: "multiple_choice",
      name: uniqueName("mc_auto"),
      title:
        i === 0
          ? "Quels aspects des recommandations vous frustrent le plus ? (Plusieurs réponses possibles)"
          : "Quelles améliorations vous inciteraient à utiliser davantage les recommandations ? (Plusieurs réponses possibles)",
      isRequired: true,
      choices:
        i === 0
          ? [
              "Manque de pertinence",
              "Trop répétitives",
              "Pas assez personnalisées",
              "Difficulté à ajuster mes préférences",
              "Trop de notifications",
              "Autre",
            ]
          : [
              "Plus de contrôle (préférences/masquage)",
              "Explication sur pourquoi c’est recommandé",
              "Meilleure variété de contenus",
              "Moins de contenus non pertinents",
              "Meilleures performances (rapidité/stabilité)",
              "Autre",
            ],
    });
  }
}

function ensureMinOpen(qs: Array<any>, min = 1) {
  const count = qs.filter((q) => q?.type === "open").length;
  const missing = Math.max(0, min - count);
  for (let i = 0; i < missing; i++) {
    qs.push({
      type: "open",
      category: "open",
      name: uniqueName("open_auto"),
      title: "Si vous pouviez changer une seule chose dans les recommandations, que changeriez-vous ?",
      isRequired: false,
      placeholder: "Votre réponse…",
    });
  }
}

function ensureMinBoolean(qs: Array<any>, min = 1) {
  const count = qs.filter((q) => q?.type === "boolean").length;
  const missing = Math.max(0, min - count);
  for (let i = 0; i < missing; i++) {
    qs.push({
      type: "boolean",
      category: "boolean",
      name: uniqueName("bool_auto"),
      title: "Souhaitez-vous recevoir des recommandations plus personnalisées, même si cela implique de partager plus de préférences ?",
      isRequired: true,
    });
  }
}

function ensureMinMatrix(qs: Array<any>, min = 1) {
  const count = qs.filter((q) => q?.type === "matrix").length;
  const missing = Math.max(0, min - count);
  for (let i = 0; i < missing; i++) {
    qs.push({
      type: "matrix",
      category: "matrix",
      name: uniqueName("matrix_auto"),
      title: "Évaluez les éléments suivants concernant les recommandations",
      isRequired: true,
      rows: [
        { value: "relevance", text: "Pertinence" },
        { value: "variety", text: "Variété" },
        { value: "freshness", text: "Nouveauté" },
        { value: "control", text: "Contrôle / personnalisation" },
      ],
      columns: [
        { value: "1", text: "Très faible" },
        { value: "2", text: "Faible" },
        { value: "3", text: "Moyen" },
        { value: "4", text: "Bon" },
        { value: "5", text: "Excellent" },
      ],
    });
  }
}

function ensureMinScale(qs: Array<any>, min = 2) {
  const count = qs.filter((q) => hasScale(q?.type)).length;
  const missing = Math.max(0, min - count);
  for (let i = 0; i < missing; i++) {
    // Alternate numeric_scale and rating for variety
    if (i % 2 === 0) {
      qs.push({
        type: "numeric_scale",
        category: "numeric_scale",
        name: uniqueName("scale_auto"),
        title: "Sur une échelle de 0 à 10, à quel point les recommandations sont-elles utiles ?",
        isRequired: true,
        rateMin: 0,
        rateMax: 10,
        minRateDescription: "Pas du tout utile",
        maxRateDescription: "Très utile",
      });
    } else {
      qs.push({
        type: "rating",
        category: "rating",
        name: uniqueName("rating_auto"),
        title: "Notez votre satisfaction générale concernant la fonctionnalité de recommandations",
        isRequired: true,
        rateMin: 1,
        rateMax: 5,
      });
    }
  }
}

function ensureRanking(qs: Array<any>) {
  const hasRanking = qs.some((q) => q?.type === "ranking" || q?.type === "image_ranking");
  if (hasRanking) return;

  qs.push({
    type: "ranking",
    category: "ranking",
    name: uniqueName("rank_auto"),
    title: "Classez les éléments suivants par ordre d’importance pour de bonnes recommandations",
    isRequired: true,
    choices: [
      "Pertinence",
      "Variété",
      "Nouveauté",
      "Contrôle (préférences/masquage)",
      "Transparence (explication)",
      "Performance (rapidité)",
    ],
  });
}

function ensureCategoryMatchesType(qs: Array<any>) {
  for (const q of qs) {
    if (q && typeof q === "object" && typeof q.type === "string") {
      q.category = q.type;
    }
  }
}

function paginateSurveyJs(questions: Array<any>) {
  const pages: any[] = [];
  for (let i = 0; i < questions.length; i += PAGE_SIZE) {
    const pageIndex = pages.length + 1;
    pages.push({
      name: `page${pageIndex}`,
      elements: questions.slice(i, i + PAGE_SIZE),
    });
  }
  return pages;
}

async function generateSurveyWithRepair(args: {
  name: string;
  problemSummary: string;
  objectives: string;
  assumptions: string;
  audiences: unknown;
}) {
  const { name, problemSummary, objectives, assumptions, audiences } = args;

  const basePrompt = `
Mission title: ${name}

Problem: ${problemSummary}
Objectives: ${objectives}
Hypotheses/Assumptions: ${assumptions}

Audiences (JSON): ${JSON.stringify(audiences ?? {}, null, 2)}

Hard constraints:
- Output MUST be valid JSON only. No markdown. No extra keys outside the schema.
- Return either:
  (A) { "title": "...", "description": "...", "elements": [ ... ] }
  OR
  (B) { "questions": [ ... ] }

Allowed question types (use ONLY these values for "type"):
single_choice, multiple_choice, likert, numeric_scale, slider, rating, open, matrix,
ranking, image_ranking, media, heatmap, gps, boolean, section.

Coverage requirements (VERY IMPORTANT):
- Generate 15–20 questions.
- MUST include at least:
  - 2 single_choice
  - 2 multiple_choice
  - 2 among (likert, rating, numeric_scale, slider)
  - 1 open
  - 1 matrix (with rows+columns)
  - 1 ranking OR image_ranking
  - 1 boolean
- Do NOT include optional types (media/heatmap/gps) unless relevant (0–2 total max).
- If you output more than 10 questions, include 1–2 "section" items to structure the questionnaire.

Field rules:
- Always set "category" = "type".
- For single_choice/multiple_choice/ranking: provide choices (4–8 items).
- For matrix: provide rows (3–6) and columns (3–6).
- For likert/rating: provide rateMin/rateMax and labels when appropriate.
- For numeric_scale/slider: provide min/max/step.
- For image_ranking: provide imageChoices with placeholder imageUrl if needed.
`;

  // Attempt 1: base generation (structure only schema)
  const attempt1 = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: SurveyResultSchemaBase,
    system: promptSystem,
    prompt: basePrompt,
  });

  let normalized = normalizeQuestions(attempt1.object);
  let questions = clampQuestions(normalized.questions ?? []);
  ensureCategoryMatchesType(questions);

  let issues = coverageIssues(questions);

  // Attempt 2: guided repair if coverage missing
  if (issues.length > 0) {
    const repairPrompt = `
You previously generated a draft questionnaire JSON that does not meet coverage requirements.

Issues:
${issues.map((i) => `- ${i}`).join("\n")}

Draft JSON:
${JSON.stringify(attempt1.object)}

Fix the draft with MINIMAL changes:
- Add or modify questions to satisfy all coverage requirements.
- Keep the output within 15–20 questions.
- Return valid JSON ONLY, same schema as before. No markdown.
`;

    const attempt2 = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: SurveyResultSchemaBase,
      system: promptSystem,
      prompt: repairPrompt,
    });

    normalized = normalizeQuestions(attempt2.object);
    questions = clampQuestions(normalized.questions ?? []);
    ensureCategoryMatchesType(questions);
    issues = coverageIssues(questions);
  }

  // Final fallback: deterministic auto-completion
  if (issues.length > 0) {
    ensureMinSingleChoice(questions, REQUIRED_MIN.single_choice);
    ensureMinMultipleChoice(questions, REQUIRED_MIN.multiple_choice);
    ensureMinOpen(questions, REQUIRED_MIN.open);
    ensureMinMatrix(questions, REQUIRED_MIN.matrix);
    ensureMinBoolean(questions, REQUIRED_MIN.boolean);
    ensureMinScale(questions, 2);
    ensureRanking(questions);
    ensureCategoryMatchesType(questions);

    issues = coverageIssues(questions);
  }

  return {
    title: normalized.title ?? name,
    description: normalized.description ?? "",
    questions,
    issues, // if any remain, caller can decide to fail
  };
}

export const createMissionAction = authActionClient
  .schema(createMissionSchema)
  .metadata({ name: "create-mission-action" })
  .action(
    async ({
      parsedInput: {
        templateId,
        name,
        problemSummary,
        objectives,
        assumptions,
        audiences,
        workspaceId,
        mode,
        image,
        sampleSummary,
        targetSampleSize,
        preliminaryRecommendations,
        studyStructure,
      },
    }) => {
      let template: any = null;
      let surveyQuestions: any = null;

      try {
        // 1) Create mission
        const mission = await prisma.mission.create({
          data: {
            name,
            problemSummary,
            objectives,
            assumptions,
            status: "draft",
            audiences,
            internal: true,
            mode: mode ?? "manual",
            ...(image ? { image } : {}),
            ...(workspaceId
              ? { workspace: { connect: { id: workspaceId } } }
              : {}),
            sampleSummary,
            targetSampleSize,
            preliminaryRecommendations,
            studyStructure,
          },
        });

        console.log("[CREATE_MISSION_ACTION] created mission =", mission);

        // 2) Generate survey if AI or template
        if (mode && mode !== "manual") {
          if (templateId) {
            template = await prisma.template.findUnique({
              where: { id: templateId },
              include: { organization: true },
            });

            if (!template) {
              return { success: false, data: null, message: "Template not found" };
            }

            surveyQuestions = template.questions;
          } else {
            const generated = await generateSurveyWithRepair({
              name,
              problemSummary,
              objectives,
              assumptions,
              audiences,
            });

            const questions = generated.questions ?? [];

            // Final guardrails
            if (!questions.length || questions.length < MIN_TOTAL_QUESTIONS) {
              console.error("[CREATE_MISSION_ACTION] Not enough questions generated:", questions.length);
              return {
                success: false,
                error: `L'IA n'a généré que ${questions.length} questions, il en faut au moins ${MIN_TOTAL_QUESTIONS}.`,
              };
            }

            if (generated.issues.length > 0) {
              console.error("[CREATE_MISSION_ACTION] Survey coverage still invalid after repair:", generated.issues);
              return {
                success: false,
                error: `Questionnaire invalide après correction: ${generated.issues.join("; ")}`,
              };
            }

            // Paginate in SurveyJS pages (10 per page)
            const pages = paginateSurveyJs(questions);

            surveyQuestions = {
              title: generated.title ?? name,
              description: generated.description ?? "",
              pages,
            };
          }

          await prisma.survey.create({
            data: {
              name,
              missionId: mission.id,
              questions: surveyQuestions as any,
              description: "Survey description",
            },
          });
        }

        return { success: true, data: mission, message: "success" };
      } catch (error: any) {
        console.error("[CREATE_MISSION_ERROR RAW]", error);
        console.error(
          "[CREATE_MISSION_ERROR SERIALIZED]",
          JSON.stringify(
            {
              name: error?.name,
              message: error?.message,
              code: error?.code,
              meta: error?.meta,
            },
            null,
            2
          )
        );

        return {
          success: false,
          error: error instanceof Error ? error.message : "Une erreur est survenue",
        };
      }
    }
  );
