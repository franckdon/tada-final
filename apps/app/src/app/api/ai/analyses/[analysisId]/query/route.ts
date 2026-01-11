import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

import { generateText } from "ai";

//correct import path for openai SDK
import { openai } from "@ai-sdk/openai";

export const runtime = "nodejs";

type AiAnswerJson = {
  answer: string;
  charts?: {
    type: string;
    subType?: string | null;
    title?: string;
    description?: string;
    data: any;
    config?: any;
  }[];
};

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const startedAt = Date.now();

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY manquant côté serveur" },
        { status: 500 },
      );
    }

    const analysisId = params.id;
    const body = await req.json();
    const { question } = body as { question?: string };

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: "La question est obligatoire" },
        { status: 400 },
      );
    }

    const analysis = await prisma.aiAnalysis.findUnique({
      where: { id: analysisId },
      include: {
        dataset: true,
        workspace: true,
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analyse introuvable" }, { status: 404 });
    }

    if (analysis.createdById !== user.id && analysis.dataset.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Vous n'avez pas accès à cette analyse" },
        { status: 403 },
      );
    }

    const dataset = analysis.dataset;

    const detectedSchema =
      typeof dataset.detectedSchema === "string"
        ? safeJsonParse(dataset.detectedSchema)
        : (dataset.detectedSchema as any);

    const sampleDataRaw =
      typeof dataset.sampleData === "string"
        ? safeJsonParse(dataset.sampleData)
        : (dataset.sampleData as any);

    const sampleData = Array.isArray(sampleDataRaw) ? sampleDataRaw.slice(0, 50) : [];

    const contextPayload = {
      dataset: {
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        rowCount: dataset.rowCount,
        columnCount: dataset.columnCount,
        detectedSchema,
      },
      analysis: {
        id: analysis.id,
        title: analysis.title,
        type: analysis.type,
        filters: analysis.filters,
        settings: analysis.settings,
        language: analysis.language,
      },
      sampleData,
      question: question.trim(),
    };

    const systemPrompt = `
Tu es un assistant de data analyst pour un dashboard d'insights.
Tu reçois :
- le schéma des colonnes
- un échantillon de données (sampleData)
- la configuration de l'analyse (filters, settings)
- une question utilisateur

Ta réponse doit être un JSON **valide** (pas de texte autour), de la forme :

{
  "answer": "texte explicatif (en français)",
  "charts": [
    {
      "type": "bar" | "line" | "pie" | "kpi" | "table",
      "subType": "grouped" | "stacked" | null,
      "title": "Titre du graphique",
      "description": "Optionnel : explication courte",
      "data": { ... },
      "config": {
        "xField": "nom de la variable",
        "yField": "nom de la variable",
        "aggregation": "sum" | "avg" | "count",
        "breakdownField": "optionnel"
      }
    }
  ]
}

- Toujours inclure "answer".
- "charts" peut être omis si la question ne nécessite pas de graphique.
- Ne pas inclure de backticks, ni de commentaire, ni de texte hors JSON.
`;

    const result = await generateText({
      model: openai("gpt-4.1-mini"),
      temperature: 0.2,
      system: systemPrompt,
      prompt: JSON.stringify(contextPayload),
    });

    const content = result.text ?? "{}";

    let parsed: AiAnswerJson;
    try {
      parsed = JSON.parse(content) as AiAnswerJson;
    } catch {
      parsed = { answer: content };
    }

    if (!parsed.answer) {
      parsed.answer = "Analyse générée, mais without answer explicite.";
    }

    const latencyMs = Date.now() - startedAt;

    // nom du modèle: côté AI SDK, result.response?.model peut varier selon version
    const modelUsed =
      (result as any)?.response?.model || "gpt-4.1-mini";

    const queryRecord = await prisma.aiAnalysisQuery.create({
      data: {
        analysisId: analysis.id,
        userId: user.id,
        question: question.trim(),
        answer: parsed.answer,
        answerJson: parsed,
        model: modelUsed,
        latencyMs,
      },
    });

    if (parsed.charts && parsed.charts.length > 0) {
      await prisma.$transaction(async (tx) => {
        const existingCount = await tx.aiAnalysisChart.count({
          where: { analysisId: analysis.id },
        });

        let order = existingCount;

        for (const c of parsed.charts) {
          order++;
          await tx.aiAnalysisChart.create({
            data: {
              analysisId: analysis.id,
              type: c.type,
              subType: c.subType ?? null,
              title: c.title ?? null,
              description: c.description ?? null,
              chartData: c.data,
              config: c.config ?? null,
              layout: null,
              order,
            },
          });
        }
      });
    }

    return NextResponse.json(
      {
        success: true,
        query: {
          id: queryRecord.id,
          question: queryRecord.question,
          answer: queryRecord.answer,
          answerJson: queryRecord.answerJson,
          model: queryRecord.model,
          latencyMs: queryRecord.latencyMs,
          createdAt: queryRecord.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[AI_ANALYSIS_QUERY_POST_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

function safeJsonParse(input: unknown): any {
  if (typeof input !== "string") return input;
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}
