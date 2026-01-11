import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { generateAutoChartsForAnalysis } from "@/lib/ai/auto-chart";


function serializeAiDataset(dataset: any) {
  if (!dataset) return dataset;

  return {
    ...dataset,
    fileSize:
      dataset.fileSize !== null && dataset.fileSize !== undefined
        ? Number(dataset.fileSize)
        : null,
  };
}

function serializeAiAnalysis(analysis: any) {
  if (!analysis) return analysis;

  return {
    ...analysis,
    dataset: analysis.dataset ? serializeAiDataset(analysis.dataset) : null,
  };
}


// GET /api/ai/analyses
// Query params : ?workspaceId=&datasetId=
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const datasetId = searchParams.get("datasetId");

    const where: any = {
      createdById: user.id,
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    if (datasetId) {
      where.datasetId = datasetId;
    }

    const analyses = await prisma.aiAnalysis.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        dataset: true,
        charts: true,
      },
    });

    return NextResponse.json(analyses.map(serializeAiAnalysis), { status: 200 });
  } catch (error) {
    console.error("[AI_ANALYSES_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}

// POST /api/ai/analyses
// Body JSON : { datasetId, workspaceId?, title?, type?, description?, filters?, settings? }
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      datasetId,
      workspaceId,
      title,
      type,
      description,
      filters,
      settings,
      language,
    } = body as {
      datasetId?: string;
      workspaceId?: string | null;
      title?: string;
      type?: string;
      description?: string;
      filters?: unknown;
      settings?: unknown;
      language?: string;
    };

    if (!datasetId) {
      return NextResponse.json(
        { error: "datasetId est obligatoire" },
        { status: 400 },
      );
    }

    const dataset = await prisma.aiDataset.findUnique({
      where: { id: datasetId },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset introuvable" },
        { status: 404 },
      );
    }

    if (dataset.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Vous n'avez pas accès à ce dataset" },
        { status: 403 },
      );
    }

    const analysis = await prisma.aiAnalysis.create({
      data: {
        datasetId: dataset.id,
        workspaceId: workspaceId ?? dataset.workspaceId,
        title: title?.trim() || dataset.name,
        type: type || "exploratory",
        description: description || null,
        filters: filters ?? null,
        settings: settings ?? null,
        createdById: user.id,
        status: "draft",
        language: language || "fr",
      },
    });

    // Génération automatique des charts
    await generateAutoChartsForAnalysis({ analysis, dataset });

    // On recharge l’analyse avec les charts générés
    const fullAnalysis = await prisma.aiAnalysis.findUnique({
      where: { id: analysis.id },
      include: {
        dataset: true,
        charts: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(serializeAiAnalysis(fullAnalysis), { status: 201 });
  } catch (error) {
    console.error("[AI_ANALYSES_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
