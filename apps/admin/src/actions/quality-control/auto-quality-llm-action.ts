"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/actions/safe-action";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";


function errorToLog(e: unknown) {
  if (e instanceof Error) {
    return {
      name: e.name,
      message: e.message,
      stack: e.stack,
      // cause (Node >=16)
      cause: (e as any).cause ? String((e as any).cause) : undefined,
    };
  }
  return { message: String(e) };
}

/**
 * Input
 */
const AutoQualitySchema = z.object({
  surveyResponseId: z.string().uuid(),
});

/**
 * LLM output schema
 */
const QualityAnalysisResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  scores: z.object({
    consistency: z.number().min(0).max(100),
    completeness: z.number().min(0).max(100),
    authenticity: z.number().min(0).max(100),
    geographic: z.number().min(0).max(100),
    temporal: z.number().min(0).max(100),
  }),
  issues: z.array(
    z.object({
      type: z.enum([
        "response_consistency",
        "data_completeness",
        "suspicious_pattern",
        "geographic_validity",
        "temporal_integrity",
        "media_quality",
      ]),
      level: z.enum(["low", "medium", "high", "critical"]),
      title: z.string(),
      description: z.string(),
      fieldPath: z.string().optional(),
      confidence: z.number().min(0).max(1),
      suggestions: z.array(z.string()),
    })
  ),
  decision: z.enum(["accept", "review", "reject"]),
  decisionReason: z.string(),
  summary: z.string(),
  recommendations: z.array(z.string()),
  flagsForHumanReview: z.boolean().optional().default(false),
});

type QualityDecision = z.infer<typeof QualityAnalysisResultSchema>["decision"];

function mapDecisionToStatus(decision: QualityDecision) {
  return decision === "accept"
    ? "accepted"
    : decision === "review"
    ? "review_required"
    : "rejected";
}

function impactScoreFromLevel(level: "low" | "medium" | "high" | "critical") {
  return level === "critical" ? 90 : level === "high" ? 70 : level === "medium" ? 50 : 30;
}

/**
 * Safe logger: DO NOT crash the action if the Prisma delegate doesn't exist
 * (your current error comes from prisma.qualityAnalysisLog being undefined).
 */
async function safeQualityAnalysisLogCreate(data: any) {
  try {
    const delegate = (prisma as any)?.qualityAnalysisLog;
    if (!delegate?.create) {
      console.warn(
        "[autoQualityLLM] qualityAnalysisLog delegate not found on Prisma client. " +
          "Run `npx prisma generate` or verify model name."
      );
      return null;
    }
    return await delegate.create({ data });
  } catch (e) {
    console.error("[autoQualityLLM] Failed to create qualityAnalysisLog:", errorToLog(e));
    return null;
  }
}

export const autoQualityLLMAction = authActionClient
  .metadata({ name: "autoQualityLLM" })
  .schema(AutoQualitySchema)
  .action(async ({ parsedInput }) => {
    const { surveyResponseId } = parsedInput;

    // optional: if you want to measure duration properly
    const startedAt = new Date();

    try {
      /**
       * 1) Load survey response + context
       */
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

      if (!surveyResponse) throw new Error("Survey response not found");

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
          responseCount: Object.keys((surveyResponse.responses as any) ?? {}).length,
        },
      };

      /**
       * 2) LLM analysis
       */
      
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

## CRITICAL REQUIREMENT:
**All output fields (title, description, summary, decisionReason, recommendations, suggestions) MUST be written in French language.**
        `,
        temperature: 0.3,
      });

      const flagsForHumanReview = object.flagsForHumanReview ?? false;

      /**
       * 3) Upsert quality control
       * IMPORTANT: because your DB column `updatedAt` is NOT nullable and has no default,
       * Prisma requires you to provide it on CREATE.
       */
      const now = new Date();
      const status = mapDecisionToStatus(object.decision);

      const qcData = {
        surveyResponseId: surveyResponse.id,
        status,
        overallScore: object.overallScore,
        consistencyScore: object.scores.consistency,
        mediaScore: object.scores.authenticity,
        geoScore: object.scores.geographic,
        temporalScore: object.scores.temporal,
        completenessScore: object.scores.completeness,
        analyzedAt: now,
        analyzer: "auto_quality_llm",
        analyzerVersion: "1.0.0",
        summary: object.summary,
        recommendations: object.recommendations,
        decision: object.decision,
        decisionReason: object.decisionReason,
        updatedAt: now,
      };

      let qualityControl;

      if (surveyResponse.qualityControl) {
        qualityControl = await prisma.qualityControl.update({
          where: { id: surveyResponse.qualityControl.id },
          data: qcData,
        });
      } else {
        // qcData includes updatedAt so CREATE won't fail
        qualityControl = await prisma.qualityControl.create({
          data: qcData,
        });
      }

      /**
       * 4) Replace issues (deleteMany then createMany)
       * NOTE: your insert log shows Prisma already provides id values in the query.
       * If you still got "Argument id is missing" previously, it means your Prisma schema
       * for qualityIssue has `id String` WITHOUT @default(uuid()) (or DB has no default).
       * Fix is in the Prisma schema + DB. But runtime here is OK if delegate matches DB.
       */
      await prisma.qualityIssue.deleteMany({
        where: { qualityControlId: qualityControl.id },
      });

      if (object.issues.length > 0) {
        await prisma.qualityIssue.createMany({
          data: object.issues.map((issue) => ({
            qualityControlId: qualityControl.id,
            type: issue.type,
            level: issue.level,
            title: issue.title,
            description: issue.description,
            fieldPath: issue.fieldPath,
            impactScore: impactScoreFromLevel(issue.level),
            confidence: issue.confidence,
            suggestions: { recommendations: issue.suggestions },
            // if your DB requires createdAt and has no default, set it:
            // createdAt: now,
          })),
        });
      }

      /**
       * 5) Log (safe)
       */
      const completedAt = new Date();
      await safeQualityAnalysisLogCreate({
        surveyResponseId: surveyResponse.id,
        analysisType: "auto_quality_full",
        analyzer: "auto_quality_llm",
        analyzerVersion: "1.0.0",
        startedAt,
        completedAt,
        duration: Math.max(0, completedAt.getTime() - startedAt.getTime()),
        status: "success",
      });

      /**
       * 6) Read back full QC for UI
       */
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
          flagsForHumanReview,
          recommendations: object.recommendations,
        },
        qualityControl: finalResult,
        message: `Automatic analysis completed - Score: ${object.overallScore}/100 - Decision: ${object.decision}`,
      };
    } catch (error) {

      console.error("Error in automatic quality analysis:", errorToLog(error));

      // safe error log (won't crash if delegate missing)
      await safeQualityAnalysisLogCreate({
        surveyResponseId,
        analysisType: "auto_quality_full",
        analyzer: "auto_quality_llm",
        analyzerVersion: "1.0.0",
        startedAt,
        completedAt: new Date(),
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      throw new Error(error instanceof Error ? error.message : "Error during automatic quality analysis");
    }
  });
