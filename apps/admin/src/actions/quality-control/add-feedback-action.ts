"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/actions/safe-action";
import { z } from "zod";

const AddFeedbackSchema = z.object({
  qualityControlId: z.string().uuid(),
  feedbackType: z.enum(["improvement", "error", "false_positive", "suggestion", "correction"]),
  originalDecision: z.string().optional(),
  correctedDecision: z.enum(["accept", "review", "reject"]).optional(),
  explanation: z.string().min(10),
  confidence: z.number().min(0).max(1).optional(),
  providedBy: z.string().optional(),
});

export const addFeedbackAction = authActionClient
  .metadata({ name: "addFeedback" })
  .schema(AddFeedbackSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { 
      qualityControlId, 
      feedbackType, 
      originalDecision, 
      correctedDecision, 
      explanation, 
      confidence,
      providedBy 
    } = parsedInput;
    const { user } = ctx;

    try {
      // Vérifier que le contrôle qualité existe
      const qualityControl = await prisma.qualityControl.findUnique({
        where: { id: qualityControlId },
        include: {
          surveyResponse: {
            include: {
              survey: {
                include: {
                  mission: true,
                },
              },
            },
          },
          qualityIssues: true,
        },
      });

      if (!qualityControl) {
        throw new Error("Quality control record not found");
      }

      // Créer l'entrée de feedback
      const feedbackEntry = await prisma.feedbackEntry.create({
        data: {
          qualityControlId,
          feedbackType,
          source: "human_review",
          originalDecision: originalDecision || qualityControl.decision,
          correctedDecision,
          explanation,
          providedBy: providedBy || user.name || user.email,
          confidence: confidence || 0.8,
          impactOnModel: feedbackType === "correction" || feedbackType === "error",
          applied: false,
        },
      });

      // Si c'est une correction, mettre à jour le contrôle qualité
      if (feedbackType === "correction" && correctedDecision) {
        await prisma.qualityControl.update({
          where: { id: qualityControlId },
          data: {
            decision: correctedDecision,
            status: correctedDecision === "accept" ? "accepted" : 
                   correctedDecision === "review" ? "review_required" : "rejected",
            reviewedBy: user.name || user.email,
            reviewedAt: new Date(),
            decisionReason: `${qualityControl.decisionReason || "Original decision"} - Updated after human review: ${explanation}`,
          },
        });

        // Marquer le feedback comme appliqué
        await prisma.feedbackEntry.update({
          where: { id: feedbackEntry.id },
          data: {
            applied: true,
            appliedAt: new Date(),
          },
        });
      }

      // Analyser les patterns de feedback pour améliorer le système
      await this.analyzeFeedbackPatterns(qualityControlId);

      return {
        success: true,
        feedbackEntry,
        message: `Feedback added successfully${feedbackType === "correction" ? " and applied to quality control" : ""}`,
      };

    } catch (error) {
      console.error("Error adding feedback:", error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : "Error adding feedback"
      );
    }
  });

// Méthode statique pour analyser les patterns de feedback
async function analyzeFeedbackPatterns(qualityControlId: string) {
  try {
    // Récupérer tous les feedbacks récents pour identifier des patterns
    const recentFeedbacks = await prisma.feedbackEntry.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 derniers jours
        },
      },
      include: {
        qualityControl: {
          include: {
            surveyResponse: {
              include: {
                survey: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Analyser les patterns communs d'erreurs
    const errorPatterns = recentFeedbacks
      .filter(f => f.feedbackType === "error" || f.feedbackType === "false_positive")
      .reduce((acc, feedback) => {
        const originalDecision = feedback.originalDecision || "unknown";
        const correctedDecision = feedback.correctedDecision || "unknown";
        const pattern = `${originalDecision}_to_${correctedDecision}`;
        
        acc[pattern] = (acc[pattern] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Si on détecte un pattern récurrent, créer ou mettre à jour un QualityPattern
    for (const [pattern, count] of Object.entries(errorPatterns)) {
      if (count >= 5) { // Au moins 5 occurrences
        const [from, , to] = pattern.split("_");
        
        await prisma.qualityPattern.upsert({
          where: { patternName: `feedback_correction_${pattern}` },
          update: {
            detectionCount: { increment: 1 },
            rules: {
              type: "feedback_pattern",
              fromDecision: from,
              toDecision: to,
              occurrences: count,
              description: `Frequent correction from ${from} to ${to}`,
            },
          },
          create: {
            patternName: `feedback_correction_${pattern}`,
            patternType: "quality_indicator",
            description: `Pattern detected: frequent corrections from ${from} to ${to}`,
            rules: {
              type: "feedback_pattern", 
              fromDecision: from,
              toDecision: to,
              occurrences: count,
            },
            severity: count > 10 ? "high" : "medium",
            detectionCount: count,
            isActive: true,
          },
        });
      }
    }

    console.log(`Analyzed ${recentFeedbacks.length} recent feedbacks, found ${Object.keys(errorPatterns).length} error patterns`);
    
  } catch (error) {
    console.error("Error analyzing feedback patterns:", error);
    // Ne pas faire échouer l'action principale si l'analyse des patterns échoue
  }
}