import { z } from "zod";

export const QualityStatusSchema = z.enum([
  "pending",
  "analyzing", 
  "accepted",
  "review_required",
  "rejected"
]);

export const QualityIssueTypeSchema = z.enum([
  "response_consistency",
  "media_quality",
  "geographic_validity", 
  "temporal_integrity",
  "data_completeness",
  "suspicious_pattern"
]);

export const QualityIssueLevelSchema = z.enum([
  "low",
  "medium", 
  "high",
  "critical"
]);

export const AnalyzeSurveyResponseSchema = z.object({
  surveyResponseId: z.string().uuid(),
  analysisType: z.enum(["full", "partial", "reanalysis", "quick"]).default("full"),
  focusAreas: z.array(QualityIssueTypeSchema).optional(),
  forceReanalysis: z.boolean().default(false),
});

export const BatchAnalyzeSchema = z.object({
  surveyResponseIds: z.array(z.string().uuid()),
  analysisType: z.enum(["full", "partial", "reanalysis"]).default("full"),
  batchSize: z.number().min(1).max(50).default(10),
});

export const GetQualityControlsSchema = z.object({
  surveyId: z.string().uuid().optional(),
  missionId: z.string().uuid().optional(),
  status: QualityStatusSchema.optional(),
  minScore: z.number().min(0).max(100).optional(),
  maxScore: z.number().min(0).max(100).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  orderBy: z.enum(["createdAt", "overallScore", "analyzedAt"]).default("createdAt"),
  orderDirection: z.enum(["asc", "desc"]).default("desc"),
});

export const UpdateQualityControlSchema = z.object({
  qualityControlId: z.string().uuid(),
  decision: z.enum(["accept", "review", "reject"]).optional(),
  decisionReason: z.string().optional(),
  reviewNotes: z.string().optional(),
});

export const AddFeedbackSchema = z.object({
  qualityControlId: z.string().uuid(),
  feedbackType: z.enum(["improvement", "error", "false_positive", "suggestion"]),
  originalDecision: z.string().optional(),
  correctedDecision: z.string().optional(),
  explanation: z.string().min(10),
  confidence: z.number().min(0).max(1).optional(),
});

export const GetQualityMetricsSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  surveyId: z.string().uuid().optional(),
  missionId: z.string().uuid().optional(),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});

export const CreateQualityPatternSchema = z.object({
  patternName: z.string().min(3).max(100),
  patternType: z.enum(["suspicious_behavior", "quality_indicator", "consistency_check"]),
  description: z.string().min(10),
  rules: z.record(z.any()),
  threshold: z.number().optional(),
  severity: QualityIssueLevelSchema,
});

export const UpdateQualityConfigSchema = z.object({
  configType: z.enum(["llm_prompt", "scoring_weights", "thresholds", "patterns"]),
  configName: z.string(),
  configValue: z.record(z.any()),
  description: z.string().optional(),
});