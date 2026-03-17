"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

const generateInsightsSchema = z.object({
  missionId: z.string(),
});

const storedInsightSchema = z.object({
  type: z.enum([
    "key_finding",
    "trend",
    "comparison",
    "anomaly",
    "recommendation",
  ]),
  priority: z.enum(["high", "medium", "low"]),
  headline: z.string(),
  summary: z.string(),
  implication: z.string(),
  action: z.string().optional(),
  confidence: z.number().min(0).max(100),
  keyStat: z.string().optional(),
  supportingMetrics: z.array(z.string()).default([]),
});

const insightsPayloadSchema = z.object({
  insights: z.array(storedInsightSchema).min(2).max(5),
});

type SupportedLanguage = "fr" | "en";

type ParsedQuestionAnswer = {
  answer?: unknown;
  type?: string;
};

type QuestionResponseItem = {
  answer: unknown;
  type?: string;
  age?: unknown;
  gender?: unknown;
  location?: unknown;
  submittedAt?: unknown;
};

type DistributionItem = {
  label: string;
  count: number;
  percentage: number;
};

function detectMissionLanguage(mission: any): SupportedLanguage {
  const raw =
    mission?.language ||
    mission?.locale ||
    mission?.surveys?.[0]?.language ||
    mission?.surveys?.[0]?.locale ||
    "fr";

  return String(raw).toLowerCase().startsWith("en") ? "en" : "fr";
}

function safeJsonParse(value: unknown): Record<string, ParsedQuestionAnswer> {
  try {
    if (typeof value === "string") {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : {};
    }

    if (value && typeof value === "object") {
      return value as Record<string, ParsedQuestionAnswer>;
    }

    return {};
  } catch {
    return {};
  }
}

function normalizeQuestionKey(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeText(item))
      .filter(Boolean)
      .join(", ");
  }
  return "";
}

function normalizeAnswer(raw: unknown): string[] {
  if (raw == null) return [];

  if (Array.isArray(raw)) {
    return raw.map((v) => normalizeText(v)).filter(Boolean);
  }

  const single = normalizeText(raw);
  return single ? [single] : [];
}

function isNumericString(value: string): boolean {
  return /^-?\d+([.,]\d+)?$/.test(value.trim());
}

function median(values: number[]): number {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2));
  }

  return Number(sorted[middle].toFixed(2));
}

function buildDistribution(values: string[], total: number): DistributionItem[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    const label = value.trim();
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({
      label,
      count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function buildChartContext(
  chart: any,
  mission: any,
  responses: QuestionResponseItem[],
  language: SupportedLanguage,
) {
  const flattenedAnswers = responses.flatMap((r) => normalizeAnswer(r.answer));
  const validAnswers = flattenedAnswers.length;

  if (!validAnswers) return null;

  const numericValues = flattenedAnswers
    .filter((v) => isNumericString(v))
    .map((v) => Number(v.replace(",", ".")))
    .filter((v) => Number.isFinite(v));

  const answerType =
    numericValues.length === validAnswers
      ? "numeric"
      : numericValues.length > 0
        ? "mixed"
        : flattenedAnswers.every((v) => v.length <= 120)
          ? "categorical"
          : "text";

  const fullDistribution =
    answerType === "categorical" || answerType === "mixed"
      ? buildDistribution(flattenedAnswers, validAnswers)
      : [];

  const topDistribution = fullDistribution.slice(0, 8);

  const numericSummary =
    numericValues.length > 0
      ? {
          min: Number(Math.min(...numericValues).toFixed(2)),
          max: Number(Math.max(...numericValues).toFixed(2)),
          average: Number(
            (
              numericValues.reduce((sum, value) => sum + value, 0) /
              numericValues.length
            ).toFixed(2),
          ),
          median: median(numericValues),
        }
      : null;

  const totalCompletedResponses = mission.surveys.reduce(
    (sum: number, survey: any) => sum + survey.responses.length,
    0,
  );

  const notablePatterns: string[] = [];

  if (topDistribution[0]?.percentage >= 60) {
    notablePatterns.push(
      language === "fr"
        ? `Une option domine avec ${topDistribution[0].percentage}% des réponses.`
        : `One option dominates with ${topDistribution[0].percentage}% of responses.`,
    );
  }

  if (topDistribution.length > 1) {
    const gap = Number(
      (topDistribution[0].percentage - topDistribution[1].percentage).toFixed(
        1,
      ),
    );

    if (gap >= 15) {
      notablePatterns.push(
        language === "fr"
          ? `L’écart entre les deux premières options atteint ${gap} points.`
          : `The gap between the top two options reaches ${gap} points.`,
      );
    }
  }

  if (validAnswers < 30) {
    notablePatterns.push(
      language === "fr"
        ? `Le volume de réponses reste limité, ce qui réduit la robustesse statistique.`
        : `The response volume remains limited, which lowers statistical robustness.`,
    );
  }

  return {
    chartId: chart.id,
    chartTitle: chart.title || chart.chartData?.question || "Untitled chart",
    chartType: chart.subType || chart.type || "unknown",
    missionName: mission.name,
    totalCompletedResponses,
    validAnswers,
    answerType,
    topDistribution,
    fullDistribution,
    numericSummary,
    sampleAnswers: answerType === "text" ? flattenedAnswers.slice(0, 8) : [],
    notablePatterns,
  };
}

async function getChartDataFromCompletedResponses(
  chart: any,
  surveys: any[],
): Promise<QuestionResponseItem[]> {
  if (!surveys?.length) {
    console.log("[INSIGHTS] No surveys found");
    return [];
  }

  const survey = surveys.find((s) => s.id === chart.surveyId);
  if (!survey?.responses?.length) {
    console.log("[INSIGHTS] No responses for survey", chart.surveyId);
    return [];
  }

  const completedResponses = survey.responses.filter(
    (r: any) => r.status === "completed",
  );

  if (!completedResponses.length) {
    console.log("[INSIGHTS] No completed responses for chart", chart.id);
    return [];
  }

  const chartData = chart.chartData;
  if (!chartData || typeof chartData !== "object" || !chartData.question) {
    console.log("[INSIGHTS] Invalid chartData for chart", chart.id, chartData);
    return [];
  }

  const rawQuestionTitle = String(chartData.question ?? "");
  const normalizedQuestionTitle = normalizeQuestionKey(rawQuestionTitle);
  const normalizedChartTitle = normalizeQuestionKey(chart.title);

  const questionResponses: QuestionResponseItem[] = [];

  for (const response of completedResponses) {
    const parsed = safeJsonParse(response.responses);

    console.log("[INSIGHTS_DEBUG] response keys", Object.keys(parsed));
    console.log("[INSIGHTS_DEBUG] chart expected question", {
      chartId: chart.id,
      chartTitle: chart.title,
      chartQuestion: chart.chartData?.question,
      surveyId: chart.surveyId,
    });

    for (const [question, questionData] of Object.entries(parsed)) {
      const normalizedQuestion = normalizeQuestionKey(question);

      const normalizedExpectedQuestion = normalizeQuestionKey(
      chart.chartData?.question
    );
      const normalizedChartTitle = normalizeQuestionKey(chart.title);

      console.log("[INSIGHTS_DEBUG] comparing", {
        rawResponseQuestionKey: question,
        normalizedResponseQuestionKey: normalizedQuestion,
        normalizedExpectedQuestion,
        normalizedChartTitle,
        isExactMatch: normalizedQuestion === normalizedExpectedQuestion,
        isTitleMatch:
          normalizedChartTitle.length > 0 &&
          normalizedQuestion === normalizedChartTitle,
      });

      const isExactMatch = normalizedQuestion === normalizedQuestionTitle;
      const isTitleMatch =
        normalizedChartTitle.length > 0 &&
        normalizedQuestion === normalizedChartTitle;

      if (!isExactMatch && !isTitleMatch) continue;

      const typed = questionData as ParsedQuestionAnswer;

      if (typed?.answer !== undefined) {
        questionResponses.push({
          answer: typed.answer,
          type: typed.type,
          age: response.age,
          gender: response.gender,
          location: response.location,
          submittedAt: response.submittedAt,
        });
        continue;
      }

      if (questionData !== undefined && questionData !== null) {
        questionResponses.push({
          answer: questionData,
          type: undefined,
          age: response.age,
          gender: response.gender,
          location: response.location,
          submittedAt: response.submittedAt,
        });
      }
    }
  }
  return questionResponses;
}

function buildSystemPrompt(language: SupportedLanguage) {
  return language === "fr"
    ? `
Tu es un analyste senior en consumer insights.

OBJECTIF
Produire des insights premium, comparables à ceux d’une plateforme d’insights moderne.
Chaque insight doit aller au-delà de la simple lecture du graphique.

STYLE
- Business, net, crédible, sans banalité
- Très lisible dans une UI premium
- Pas de paraphrase brute des données
- Chaque insight doit apporter une lecture et une implication

RÈGLES
- Génère uniquement 2 à 5 insights
- Priorise les enseignements les plus utiles pour un décideur
- Base-toi uniquement sur les données fournies
- N’invente pas de causalité
- Si les données sont faibles, réduis la confiance
- Évite les doublons

STRUCTURE
- headline: phrase courte, forte, orientée décision
- summary: ce que montrent les données
- implication: pourquoi c’est important pour le business
- action: action ou décision recommandée si pertinent
- supportingMetrics: 1 à 3 éléments chiffrés
- keyStat: statistique la plus marquante si utile
- confidence: score réaliste
- priority: high / medium / low
`.trim()
    : `
You are a senior consumer insights analyst.

OBJECTIVE
Produce premium insights comparable to those shown in modern insights platforms.
Each insight must go beyond merely reading the chart.

STYLE
- Business-oriented, sharp, credible, non-generic
- Highly readable in a premium UI
- Do not simply paraphrase data
- Every insight must include interpretation and implication

RULES
- Generate only 2 to 5 insights
- Prioritize the findings most useful to a decision-maker
- Use only the provided data
- Do not invent causality
- If the data is weak, lower confidence
- Avoid duplicates

STRUCTURE
- headline: short, strong, decision-friendly statement
- summary: what the data shows
- implication: why it matters for the business
- action: recommended action or next step if relevant
- supportingMetrics: 1 to 3 quantified facts
- keyStat: most striking stat if relevant
- confidence: realistic score
- priority: high / medium / low
`.trim();
}

function dedupeInsights(
  insights: z.infer<typeof insightsPayloadSchema>["insights"],
) {
  const seen = new Set<string>();

  return insights.filter((insight) => {
    const key = `${insight.type}::${insight.headline.trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const generateInsightsAction = authActionClient
  .schema(generateInsightsSchema)
  .metadata({
    name: "generate-insights-action",
  })
  .action(async ({ parsedInput: { missionId } }) => {
    try {
      const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        include: {
          missionCharts: {
            where: {
              status: "published",
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          surveys: {
            include: {
              responses: {
                where: {
                  status: "completed",
                },
                select: {
                  id: true,
                  responses: true,
                  age: true,
                  gender: true,
                  location: true,
                  status: true,
                  submittedAt: true,
                },
              },
            },
          },
        },
      });

      if (!mission) {
        throw new Error("Mission non trouvée");
      }

      if (!mission.missionCharts?.length) {
        throw new Error("Aucun graphique publié trouvé pour cette mission");
      }

      const totalCompletedResponses = mission.surveys.reduce(
        (sum, survey) => sum + survey.responses.length,
        0,
      );

      if (totalCompletedResponses === 0) {
        return {
          success: false,
          error: "Aucune réponse completed trouvée pour générer des insights",
        };
      }

      const language = detectMissionLanguage(mission);
      let totalInsightsGenerated = 0;
      let chartsProcessed = 0;

      for (const chart of mission.missionCharts) {
        try {
          const questionResponses = await getChartDataFromCompletedResponses(
            chart,
            mission.surveys,
          );

          console.log("[INSIGHTS] Processing chart", {
            chartId: chart.id,
            title: chart.title,
            subType: chart.subType,
            surveyId: chart.surveyId,
            extractedResponses: questionResponses.length,
          });

          if (!questionResponses.length) {
            await prisma.missionChart.update({
              where: { id: chart.id },
              data: {
                insights: [],
                insightsUpdatedAt: new Date(),
              },
            });
            continue;
          }

          const context = buildChartContext(
            chart,
            mission,
            questionResponses,
            language,
          );

          console.log("[INSIGHTS] Context built", {
            chartId: chart.id,
            answerType: context?.answerType,
            validAnswers: context?.validAnswers,
            topDistribution: context?.topDistribution?.slice(0, 3),
          });

          if (!context) {
            await prisma.missionChart.update({
              where: { id: chart.id },
              data: {
                insights: [],
                insightsUpdatedAt: new Date(),
              },
            });
            continue;
          }

          const prompt =
            language === "fr"
              ? `
MISSION
${mission.name}

GRAPHIQUE
- Titre: ${context.chartTitle}
- Type: ${context.chartType}
- Réponses complétées mission: ${context.totalCompletedResponses}
- Réponses valides pour cette question: ${context.validAnswers}
- Type de réponse détecté: ${context.answerType}

TOP DISTRIBUTION
${JSON.stringify(context.topDistribution, null, 2)}

DISTRIBUTION COMPLÈTE
${JSON.stringify(context.fullDistribution, null, 2)}

RÉSUMÉ NUMÉRIQUE
${JSON.stringify(context.numericSummary, null, 2)}

EXEMPLES DE RÉPONSES TEXTE
${JSON.stringify(context.sampleAnswers, null, 2)}

PATTERNS NOTABLES
${JSON.stringify(context.notablePatterns, null, 2)}

Génère des insights premium, orientés lecture business et décision.
`.trim()
              : `
MISSION
${mission.name}

CHART
- Title: ${context.chartTitle}
- Type: ${context.chartType}
- Completed mission responses: ${context.totalCompletedResponses}
- Valid answers for this question: ${context.validAnswers}
- Detected answer type: ${context.answerType}

TOP DISTRIBUTION
${JSON.stringify(context.topDistribution, null, 2)}

FULL DISTRIBUTION
${JSON.stringify(context.fullDistribution, null, 2)}

NUMERIC SUMMARY
${JSON.stringify(context.numericSummary, null, 2)}

TEXT ANSWER SAMPLES
${JSON.stringify(context.sampleAnswers, null, 2)}

NOTABLE PATTERNS
${JSON.stringify(context.notablePatterns, null, 2)}

Generate premium, business-oriented, decision-friendly insights.
`.trim();

          const { object } = await generateObject({
            model: openai("gpt-4o-mini"),
            schema: insightsPayloadSchema,
            system: buildSystemPrompt(language),
            prompt,
            temperature: 0.3,
          });

          const insights = dedupeInsights(
            object.insights.filter((insight) => insight.confidence >= 65),
          );

          console.log("[INSIGHTS] Generated insights", {
            chartId: chart.id,
            insightsCount: insights.length,
            headlines: insights.map((i) => i.headline),
          });

          await prisma.missionChart.update({
            where: { id: chart.id },
            data: {
              insights,
              insightsUpdatedAt: new Date(),
            },
          });

          totalInsightsGenerated += insights.length;
          chartsProcessed += 1;
        } catch (chartError) {
          console.error(
            `[GENERATE_INSIGHTS][CHART_ERROR] chartId=${chart.id}`,
            chartError,
          );

          await prisma.missionChart.update({
            where: { id: chart.id },
            data: {
              insights: [],
              insightsUpdatedAt: new Date(),
            },
          });
        }
      }

      return {
        success: true,
        data: {
          insightsGenerated: totalInsightsGenerated,
          chartsProcessed,
          completedResponses: totalCompletedResponses,
          missionId,
        },
      };
    } catch (error) {
      console.error("[GENERATE_INSIGHTS_ERROR]", error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  });