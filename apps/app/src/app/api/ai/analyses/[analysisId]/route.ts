import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

type RouteContext = {
  params: {
    analysisId: string;
  };
};

// Sérialise le dataset (fileSize = BigInt -> number)
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

// Sérialise l’analyse + renomme queries -> lastQueries
function serializeAiAnalysis(analysis: any) {
  if (!analysis) return analysis;

  const base = {
    ...analysis,
    dataset: analysis.dataset ? serializeAiDataset(analysis.dataset) : null,
    lastQueries: analysis.queries ?? [],
  };

  // Au cas où un BigInt se glisse quelque part
  return JSON.parse(
    JSON.stringify(base, (_, value) =>
      typeof value === "bigint" ? Number(value) : value,
    ),
  );
}

// GET /api/ai/analyses/:analysisId
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { analysisId } = params;

    const analysis = await prisma.aiAnalysis.findUnique({
      where: { id: analysisId },
      include: {
        dataset: true,
        charts: {
          orderBy: { order: "asc" },
        },
        queries: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analyse introuvable" },
        { status: 404 },
      );
    }

    // Vérif d'accès :
    const isOwner =
      analysis.createdById === user.id ||
      analysis.dataset?.ownerId === user.id;

    if (!isOwner) {
      return NextResponse.json(
        { error: "Accès non autorisé à cette analyse" },
        { status: 403 },
      );
    }

    const safeAnalysis = serializeAiAnalysis(analysis);
    return NextResponse.json(safeAnalysis, { status: 200 });
  } catch (error) {
    console.error("[AI_ANALYSIS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
