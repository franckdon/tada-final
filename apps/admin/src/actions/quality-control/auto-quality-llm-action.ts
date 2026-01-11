"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/actions/safe-action";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const AutoQualitySchema = z.object({
  surveyResponseId: z.string().uuid(),
});

const QualityAnalysisResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  scores: z.object({
    consistency: z.number().min(0).max(100),
    completeness: z.number().min(0).max(100),
    authenticity: z.number().min(0).max(100),
    geographic: z.number().min(0).max(100),
    temporal: z.number().min(0).max(100),
  }),
  issues: z.array(z.object({
    type: z.enum([
      "response_consistency",
      "data_completeness", 
      "suspicious_pattern",
      "geographic_validity",
      "temporal_integrity",
      "media_quality"
    ]),
    level: z.enum(["low", "medium", "high", "critical"]),
    title: z.string(),
    description: z.string(),
    fieldPath: z.string().optional(),
    confidence: z.number().min(0).max(1),
    suggestions: z.array(z.string()),
  })),
  decision: z.enum(["accept", "review", "reject"]),
  decisionReason: z.string(),
  summary: z.string(),
  recommendations: z.array(z.string()),
  flagsForHumanReview: z.boolean(),
});

export const autoQualityLLMAction = authActionClient
  .metadata({ name: "autoQualityLLM" })
  .schema(AutoQualitySchema)
  .action(async ({ parsedInput, ctx }) => {
    const { surveyResponseId } = parsedInput;
    const { user } = ctx;

    try {
      // Récupérer la réponse avec toutes les données nécessaires
      const surveyResponse = await prisma.surveyResponse.findUnique({
        where: { id: surveyResponseId },
        include: {
          survey: {
            include: {
              mission: {
                select: {
                  id: true,
                  name: true,
                  objectives: true,
                  audiences: true,
                },
              },
            },
          },
          qualityControl: true,
        },
      });

      if (!surveyResponse) {
        throw new Error("Survey response not found");
      }

      // Préparer les données pour l'analyse LLM
      const analysisData = {
        surveyResponse: {
          id: surveyResponse.id,
          responses: surveyResponse.responses,
          age: surveyResponse.age,
          gender: surveyResponse.gender,
          location: surveyResponse.location,
          ipAddress: surveyResponse.ipAddress,
          userAgent: surveyResponse.userAgent,
          submittedAt: surveyResponse.submittedAt.toISOString(),
          status: surveyResponse.status,
        },
        survey: {
          id: surveyResponse.survey.id,
          name: surveyResponse.survey.name,
          description: surveyResponse.survey.description,
          questions: surveyResponse.survey.questions,
        },
        mission: surveyResponse.survey.mission,
        metadata: {
          responseCount: Object.keys(surveyResponse.responses as any).length,
        }
      };

      // Analyse avec LLM
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: QualityAnalysisResultSchema,
        prompt: `
Analyze this mobile survey submission for quality issues and data integrity:

## Submission Data
${JSON.stringify(analysisData, null, 2)}

## Analysis Criteria:

### 1. Response Consistency (consistency)
- Logic between boolean answers and related comments
- Coherence between ratings and qualitative explanations
- No contradictions between different responses

### 2. Data Completeness (completeness)  
- All required questions are answered
- Quality of text responses (not just "yes", "no", or single words)
- No empty or irrelevant responses

### 3. Authenticity (authenticity)
- Responses seem genuine and thoughtful
- No suspicious patterns (all identical responses)
- Variety and nuance in answers

### 4. Geographic Validity (geographic)
- Realistic GPS coordinates
- Consistency with survey context
- Not default coordinates (0,0)

### 5. Response Relevance (temporal)
- Responses directly address the questions asked
- No off-topic or unrelated answers
- Meaningful engagement with survey context
- Answers demonstrate understanding of mission objectives

### Special Instructions for Media Analysis:
- Analyze image quality and authenticity for photo/image fields
- Detect blurry, pixelated, or low-resolution images that suggest poor quality
- Identify generic icons, stock photos, or downloaded internet images
- Look for watermarks, logos, or text overlays that suggest non-original content
- Check if images match the context (e.g., real location photos vs random images)
- Detect screenshots of other apps/websites when original photos are expected
- Verify images are relevant to the specific question/field requirements
- Identify repeated identical images across multiple responses (7 PNG icons pattern)
- Check for professional studio lighting or composition suggesting stock photography

**IMPORTANT**: Provide all titles, descriptions, summary, decision reasons, and recommendations in French language.

Provide comprehensive analysis with detailed scores and actionable recommendations.
        `,
        system: `
You are an expert in mobile survey data quality control and validation.

## Scoring Guidelines:
- **90-100**: Excellent quality, reliable data
- **70-89**: Good quality with minor concerns
- **50-69**: Acceptable quality but requires human review
- **30-49**: Poor quality, corrections needed
- **0-29**: Very poor quality, rejection recommended

## Issue Severity Levels:
- **critical**: Invalidates submission (e.g., all identical responses, obvious bot)
- **high**: Major problem affecting reliability (e.g., inconsistent responses, fake media)
- **medium**: Moderate issue requiring attention (e.g., missing GPS, rushed responses)
- **low**: Minor problem or improvement suggestion (e.g., could be more detailed)

## Decision Criteria:
- **accept**: Score ≥ 80, no major issues
- **review**: Score 50-79, needs human validation
- **reject**: Score < 50, insufficient quality

## Common Red Flags to Detect:
- All responses identical or copy-pasted
- Responses not relevant to the questions asked
- Default GPS coordinates (0,0) or clearly wrong location
- Blurry, pixelated, or extremely low-resolution images
- Generic icons, stock photos, or images with watermarks/logos
- Professional studio photography when candid photos are expected
- Screenshots of Google Images, social media, or other websites
- Images that don't match the geographic or contextual requirements
- Identical images used across multiple different questions/fields
- Inconsistent or contradictory responses
- Automated submission patterns

## Response Analysis:
- Boolean + comment pairs: Check if comment supports the boolean choice
- Rating + explanation: Verify rating matches sentiment of explanation
- File uploads: Assess relevance, authenticity, and technical quality
- Image analysis: Check for blur, pixelation, watermarks, contextual relevance
- Photo authenticity: Distinguish between original photos vs downloaded/stock images
- Visual quality: Identify low-resolution, poorly lit, or out-of-focus images
- Location data: Validate GPS makes sense for the survey context
- Text quality: Look for genuine, thoughtful responses vs rushed/generic ones

## CRITICAL REQUIREMENT:
**All output fields (title, description, summary, decisionReason, recommendations, suggestions) MUST be written in French language.**

Examples:
- title: "Réponses incohérentes détectées"
- description: "Les réponses booléennes ne correspondent pas aux commentaires associés"
- summary: "Analyse automatique : Score 65/100. 3 problèmes détectés nécessitant une révision."
- decisionReason: "Score acceptable mais présence de quelques incohérences mineures"
- recommendations: ["Vérifier la cohérence des réponses", "Améliorer la qualité des images"]

Be thorough and provide specific examples from the data to justify your analysis.
        `,
        temperature: 0.3,
      });

      // Enregistrer ou mettre à jour le contrôle qualité
      let qualityControl;
      
      if (surveyResponse.qualityControl) {
        qualityControl = await prisma.qualityControl.update({
          where: { id: surveyResponse.qualityControl.id },
          data: {
            status: object.decision === "accept" ? "accepted" : 
                   object.decision === "review" ? "review_required" : "rejected",
            overallScore: object.overallScore,
            consistencyScore: object.scores.consistency,
            mediaScore: object.scores.authenticity,
            geoScore: object.scores.geographic,
            temporalScore: object.scores.temporal,
            completenessScore: object.scores.completeness,
            analyzedAt: new Date(),
            analyzer: "auto_quality_llm",
            analyzerVersion: "1.0.0",
            summary: object.summary,
            recommendations: object.recommendations,
            decision: object.decision,
            decisionReason: object.decisionReason,
          },
        });
      } else {
        qualityControl = await prisma.qualityControl.create({
          data: {
            surveyResponseId: surveyResponse.id,
            status: object.decision === "accept" ? "accepted" : 
                   object.decision === "review" ? "review_required" : "rejected",
            overallScore: object.overallScore,
            consistencyScore: object.scores.consistency,
            mediaScore: object.scores.authenticity,
            geoScore: object.scores.geographic,
            temporalScore: object.scores.temporal,
            completenessScore: object.scores.completeness,
            analyzedAt: new Date(),
            analyzer: "auto_quality_llm",
            analyzerVersion: "1.0.0",
            summary: object.summary,
            recommendations: object.recommendations,
            decision: object.decision,
            decisionReason: object.decisionReason,
          },
        });
      }

      // Créer les issues détectés
      if (object.issues.length > 0) {
        await prisma.qualityIssue.deleteMany({
          where: { qualityControlId: qualityControl.id },
        });

        await prisma.qualityIssue.createMany({
          data: object.issues.map((issue) => ({
            qualityControlId: qualityControl.id,
            type: issue.type,
            level: issue.level,
            title: issue.title,
            description: issue.description,
            fieldPath: issue.fieldPath,
            impactScore: issue.level === "critical" ? 90 : 
                        issue.level === "high" ? 70 :
                        issue.level === "medium" ? 50 : 30,
            confidence: issue.confidence,
            suggestions: { recommendations: issue.suggestions },
          })),
        });
      }

      // Log de l'analyse
      await prisma.qualityAnalysisLog.create({
        data: {
          surveyResponseId: surveyResponse.id,
          analysisType: "auto_quality_full",
          analyzer: "auto_quality_llm",
          analyzerVersion: "1.0.0",
          startedAt: new Date(),
          completedAt: new Date(),
          duration: 0,
          status: "success",
        },
      });

      const finalResult = await prisma.qualityControl.findUnique({
        where: { id: qualityControl.id },
        include: {
          qualityIssues: true,
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
        analysis: {
          overallScore: object.overallScore,
          scores: object.scores,
          decision: object.decision,
          decisionReason: object.decisionReason,
          summary: object.summary,
          issuesCount: object.issues.length,
          flagsForHumanReview: object.flagsForHumanReview,
          recommendations: object.recommendations,
        },
        qualityControl: finalResult,
        message: `Automatic analysis completed - Score: ${object.overallScore}/100 - Decision: ${object.decision}`,
      };

    } catch (error) {
      console.error("Error in automatic quality analysis:", error);
      
      try {
        await prisma.qualityAnalysisLog.create({
          data: {
            surveyResponseId,
            analysisType: "auto_quality_full",
            analyzer: "auto_quality_llm", 
            analyzerVersion: "1.0.0",
            startedAt: new Date(),
            status: "error",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          },
        });
      } catch (logError) {
        console.error("Failed to log error:", logError);
      }

      throw new Error(
        error instanceof Error 
          ? error.message 
          : "Error during automatic quality analysis"
      );
    }
  });