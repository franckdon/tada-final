"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/actions/safe-action";
import { z } from "zod";

const BatchQualityAnalysisSchema = z.object({
  surveyId: z.string().uuid().optional(),
  missionId: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
  status: z.enum(["pending", "completed"]).default("pending"),
});

export const batchQualityAnalysisAction = authActionClient
  .metadata({ name: "batchQualityAnalysis" })
  .schema(BatchQualityAnalysisSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { surveyId, missionId, limit, status } = parsedInput;
    const { user } = ctx;

    try {
      // Construire la requête pour trouver les réponses à analyser
      const whereClause: any = {};
      
      if (status === "pending") {
        whereClause.qualityControl = null; // Pas encore analysées
      } else {
        whereClause.qualityControl = { isNot: null }; // Déjà analysées
      }

      if (surveyId) {
        whereClause.surveyId = surveyId;
      }

      if (missionId) {
        whereClause.survey = {
          missionId: missionId,
        };
      }

      // Récupérer les réponses à analyser
      const surveyResponses = await prisma.surveyResponse.findMany({
        where: whereClause,
        include: {
          survey: {
            include: {
              mission: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          qualityControl: true,
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      if (surveyResponses.length === 0) {
        return {
          success: true,
          message: "No survey responses found for analysis",
          results: [],
          summary: {
            total: 0,
            analyzed: 0,
            errors: 0,
          },
        };
      }

      // Importer l'action d'analyse individuelle
      const { autoQualityLLMAction } = await import("./auto-quality-llm-action");

      const results = [];
      let analyzedCount = 0;
      let errorCount = 0;

      // Analyser chaque réponse
      for (const response of surveyResponses) {
        try {
          console.log(`Analyzing response ${response.id}...`);
          
          const analysisResult = await autoQualityLLMAction({
            surveyResponseId: response.id,
          }, ctx);

          results.push({
            surveyResponseId: response.id,
            success: true,
            analysis: analysisResult.analysis,
            message: analysisResult.message,
          });

          analyzedCount++;
          
          // Petite pause pour éviter de surcharger l'API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Error analyzing response ${response.id}:`, error);
          
          results.push({
            surveyResponseId: response.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });

          errorCount++;
        }
      }

      // Calculer les statistiques finales
      const successfulAnalyses = results.filter(r => r.success);
      const averageScore = successfulAnalyses.length > 0 
        ? successfulAnalyses.reduce((sum, r) => sum + (r.analysis?.overallScore || 0), 0) / successfulAnalyses.length
        : 0;

      const decisionCounts = successfulAnalyses.reduce((acc, r) => {
        const decision = r.analysis?.decision;
        if (decision) {
          acc[decision] = (acc[decision] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        success: true,
        message: `Batch analysis completed: ${analyzedCount} analyzed, ${errorCount} errors`,
        results,
        summary: {
          total: surveyResponses.length,
          analyzed: analyzedCount,
          errors: errorCount,
          averageScore: Math.round(averageScore * 100) / 100,
          decisions: decisionCounts,
          processingTime: `${surveyResponses.length} responses processed`,
        },
      };

    } catch (error) {
      console.error("Error in batch quality analysis:", error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : "Error during batch quality analysis"
      );
    }
  });