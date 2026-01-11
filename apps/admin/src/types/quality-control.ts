export type QualityStatus = 
  | "pending" 
  | "analyzing" 
  | "accepted" 
  | "review_required" 
  | "rejected";

export type QualityIssueType = 
  | "response_consistency"
  | "media_quality" 
  | "geographic_validity"
  | "temporal_integrity"
  | "data_completeness"
  | "suspicious_pattern";

export type QualityIssueLevel = "low" | "medium" | "high" | "critical";

export interface QualityScore {
  overall: number;
  consistency?: number;
  media?: number;
  geographic?: number;
  temporal?: number;
  completeness?: number;
}

export interface QualityIssue {
  id: string;
  type: QualityIssueType;
  level: QualityIssueLevel;
  title: string;
  description: string;
  fieldPath?: string;
  expectedValue?: string;
  actualValue?: string;
  impactScore: number;
  confidence: number;
  suggestions?: Record<string, any>;
  createdAt: Date;
}

export interface QualityMetric {
  id: string;
  metricName: string;
  metricType: string;
  value: number;
  unit?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  createdAt: Date;
}

export interface QualityControl {
  id: string;
  surveyResponseId: string;
  status: QualityStatus;
  overallScore: number;
  maxScore: number;
  consistencyScore?: number;
  mediaScore?: number;
  geoScore?: number;
  temporalScore?: number;
  completenessScore?: number;
  analyzedAt?: Date;
  analyzer?: string;
  analyzerVersion?: string;
  summary?: string;
  recommendations?: Record<string, any>;
  decision?: string;
  decisionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  qualityIssues: QualityIssue[];
  qualityMetrics: QualityMetric[];
}

export interface ProcessedSurveyResponse {
  id: string;
  surveyId: string;
  responses: Record<string, any>;
  age: number;
  gender: string;
  location: {
    type: string;
    lat: number;
    lng: number;
    label: string;
  };
  ipAddress?: string;
  userAgent?: string;
  submittedAt: Date;
  status: string;
  userId?: string;
}

export interface LLMAnalysisRequest {
  surveyResponse: ProcessedSurveyResponse;
  survey: {
    id: string;
    name: string;
    description?: string;
    questions: Record<string, any>;
  };
  analysisType: "full" | "partial" | "reanalysis";
  focusAreas?: QualityIssueType[];
}

export interface LLMAnalysisResponse {
  overallScore: number;
  scores: {
    consistency?: number;
    media?: number;
    geographic?: number;
    temporal?: number;
    completeness?: number;
  };
  issues: {
    type: QualityIssueType;
    level: QualityIssueLevel;
    title: string;
    description: string;
    fieldPath?: string;
    confidence: number;
    suggestions?: Record<string, any>;
  }[];
  summary: string;
  recommendations: Record<string, any>;
  decision: "accept" | "review" | "reject";
  decisionReason: string;
}

export interface QualityAnalysisConfig {
  llmModel: string;
  maxTokens: number;
  temperature: number;
  prompts: {
    consistency: string;
    media: string;
    geographic: string;
    temporal: string;
    completeness: string;
  };
  scoringWeights: {
    consistency: number;
    media: number;
    geographic: number;
    temporal: number;
    completeness: number;
  };
  thresholds: {
    accept: number;
    review: number;
    reject: number;
  };
}

export interface FeedbackEntry {
  id: string;
  qualityControlId: string;
  feedbackType: string;
  source: string;
  originalDecision?: string;
  correctedDecision?: string;
  explanation?: string;
  providedBy?: string;
  confidence?: number;
  impactOnModel: boolean;
  applied: boolean;
  appliedAt?: Date;
  createdAt: Date;
}

export interface QualityPattern {
  id: string;
  patternName: string;
  patternType: string;
  description: string;
  rules: Record<string, any>;
  threshold?: number;
  severity: QualityIssueLevel;
  detectionCount: number;
  falsePositiveRate?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityAnalysisLog {
  id: string;
  batchId?: string;
  surveyResponseId: string;
  analysisType: string;
  analyzer: string;
  analyzerVersion: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  status: string;
  errorMessage?: string;
  promptTokensUsed?: number;
  responseTokensUsed?: number;
  cost?: number;
  configSnapshot?: Record<string, any>;
  createdAt: Date;
}