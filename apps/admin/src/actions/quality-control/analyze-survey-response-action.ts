"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/actions/safe-action";
import { AnalyzeSurveyResponseSchema } from "./schema";
import { LLMAnalysisService } from "@/lib/quality-control/llm-analysis-service";
import type { ProcessedSurveyResponse } from "@/types/quality-control";

export const analyzeSurveyResponseAction = authActionClient
  .metadata({ name: "analyzeSurveyResponse" })
  .schema(AnalyzeSurveyResponseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { surveyResponseId, analysisType, focusAreas, forceReanalysis } = parsedInput;
    const { user } = ctx;

    try {
      // Vérifier si la réponse existe
      const surveyResponse = await prisma.surveyResponse.findUnique({
        where: { id: surveyResponseId },
        include: {
          survey: {
            include: {
              mission: true,
            },
          },
          qualityControl: true,
        },
      });

      if (!surveyResponse) {
        throw new Error("Réponse de survey non trouvée");
      }

      // Vérifier si une analyse existe déjà
      if (surveyResponse.qualityControl && !forceReanalysis) {
        throw new Error("Une analyse existe déjà pour cette réponse. Utilisez forceReanalysis=true pour refaire l'analyse.");
      }

      // Préparer les données pour l'analyse
      const processedResponse: ProcessedSurveyResponse = {
        id: surveyResponse.id,
        surveyId: surveyResponse.surveyId,
        responses: surveyResponse.responses as Record<string, any>,
        age: surveyResponse.age,
        gender: surveyResponse.gender,
        location: surveyResponse.location as {
          type: string;
          lat: number;
          lng: number;
          label: string;
        },
        ipAddress: surveyResponse.ipAddress,
        userAgent: surveyResponse.userAgent,
        submittedAt: surveyResponse.submittedAt,
        status: surveyResponse.status,
        userId: surveyResponse.userId,
      };

      // Démarrer l'analyse
      const startTime = new Date();
      const analysisService = new LLMAnalysisService();
      
      let result;
      if (analysisType === "quick") {
        // Analyse rapide basée sur des règles
        const quickResult = await analysisService.quickAnalysis(processedResponse);
        result = {
          overallScore: quickResult.score,
          scores: {},
          issues: quickResult.issues.map((issue, index) => ({
            type: "suspicious_pattern" as const,
            level: "medium" as const,
            title: issue,
            description: issue,
            confidence: 0.8,
          })),
          summary: `Analyse rapide: Score ${quickResult.score}/100. ${quickResult.issues.length} problèmes détectés.`,
          recommendations: { reviewRequired: quickResult.decision === "review" },
          decision: quickResult.decision,
          decisionReason: quickResult.issues.join(", ") || "Aucun problème majeur détecté",
        };
      } else {
        // Analyse complète avec LLM
        result = await analysisService.analyzeResponse({
          surveyResponse: processedResponse,
          survey: surveyResponse.survey,
          analysisType,
          focusAreas,
        });
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Enregistrer ou mettre à jour le contrôle qualité
      let qualityControl;
      
      if (surveyResponse.qualityControl) {
        // Mettre à jour l'analyse existante
        qualityControl = await prisma.qualityControl.update({
          where: { id: surveyResponse.qualityControl.id },
          data: {
            status: result.overallScore >= 80 ? "accepted" : result.overallScore >= 50 ? "review_required" : "rejected",
            overallScore: result.overallScore,
            consistencyScore: result.scores.consistency,
            mediaScore: result.scores.media,
            geoScore: result.scores.geographic,
            temporalScore: result.scores.temporal,
            completenessScore: result.scores.completeness,
            analyzedAt: new Date(),
            analyzer: "llm_analysis_service",
            analyzerVersion: "1.0.0",
            summary: result.summary,
            recommendations: result.recommendations,
            decision: result.decision,
            decisionReason: result.decisionReason,
          },
          include: {
            qualityIssues: true,
            qualityMetrics: true,
          },
        });

        // Supprimer les anciens issues
        await prisma.qualityIssue.deleteMany({
          where: { qualityControlId: qualityControl.id },
        });
      } else {
        // Créer un nouveau contrôle qualité
        qualityControl = await prisma.qualityControl.create({
          data: {
            surveyResponseId: surveyResponse.id,
            status: result.overallScore >= 80 ? "accepted" : result.overallScore >= 50 ? "review_required" : "rejected",
            overallScore: result.overallScore,
            consistencyScore: result.scores.consistency,
            mediaScore: result.scores.media,
            geoScore: result.scores.geographic,
            temporalScore: result.scores.temporal,
            completenessScore: result.scores.completeness,
            analyzedAt: new Date(),
            analyzer: "llm_analysis_service",
            analyzerVersion: "1.0.0",
            summary: result.summary,
            recommendations: result.recommendations,
            decision: result.decision,
            decisionReason: result.decisionReason,
          },
          include: {
            qualityIssues: true,
            qualityMetrics: true,
          },
        });
      }

      // Créer les issues détectés
      if (result.issues && result.issues.length > 0) {
        await prisma.qualityIssue.createMany({
          data: result.issues.map((issue) => ({
            qualityControlId: qualityControl.id,
            type: issue.type,
            level: issue.level,
            title: issue.title,
            description: issue.description,
            fieldPath: issue.fieldPath,
            impactScore: issue.level === "critical" ? 95 : issue.level === "high" ? 75 : issue.level === "medium" ? 50 : 25,
            confidence: issue.confidence || 0.8,
            suggestions: issue.suggestions,
          })),
        });
      }

      // Enregistrer le log d'analyse
      await prisma.qualityAnalysisLog.create({
        data: {
          surveyResponseId: surveyResponse.id,
          analysisType,
          analyzer: "llm_analysis_service",
          analyzerVersion: "1.0.0",
          startedAt: startTime,
          completedAt: endTime,
          duration,
          status: "success",
        },
      });

      // Récupérer le résultat complet
      const finalResult = await prisma.qualityControl.findUnique({
        where: { id: qualityControl.id },
        include: {
          qualityIssues: true,
          qualityMetrics: true,
          surveyResponse: {
            include: {
              survey: {
                include: {
                  mission: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        qualityControl: finalResult,
        analysisType,
        message: `Analyse ${analysisType} terminée avec un score de ${result.overallScore}/100`,
      };
    } catch (error) {
      console.error("Error analyzing survey response:", error);
      
      // Enregistrer l'erreur dans les logs
      try {
        await prisma.qualityAnalysisLog.create({
          data: {
            surveyResponseId,
            analysisType,
            analyzer: "llm_analysis_service",
            analyzerVersion: "1.0.0",
            startedAt: new Date(),
            status: "error",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          },
        });
      } catch (logError) {
        console.error("Failed to log analysis error:", logError);
      }

      throw new Error(
        error instanceof Error 
          ? error.message 
          : "Erreur lors de l'analyse de la réponse"
      );
    }
  });