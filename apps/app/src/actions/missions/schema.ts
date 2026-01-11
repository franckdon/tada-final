import { image } from "@uiw/react-markdown-editor";
import { z } from "zod";

const MediaTypeEnum = z.enum(["photo", "video", "audio"]);
const GpsModeEnum = z.enum(["pin", "navigate", "checkin"]);

const HeatmapSchema = z.object({
  stimulusSource: z.enum(["url", "upload"]).optional(),
  stimulusImageUrl: z.string().optional(),
  allowMultipleClicks: z.boolean().optional(),
  maxClicks: z.number().int().min(1).max(10).optional(),
  collectReason: z.boolean().optional(),
});

const AllowedQuestionTypeEnum = z.enum([
  "single_choice",
  "multiple_choice",
  "likert",
  "numeric_scale",
  "slider",
  "matrix",
  "open",
  "rating",
  "image_ranking",
  "ranking",
  "media",
  "heatmap",
  "gps",
  "section",
  "boolean",
]);

export const createMissionSchema = z.object({
  name: z.string().min(1),
  problemSummary: z.string().min(1),
  objectives: z.string().min(1),
  assumptions: z.string().min(1),
  workspaceId: z.string(),
  templateId: z.string().nullable().optional(),
  mode: z.enum(["template", "manual", "ai", "survey"]).nullable().optional(),
  audiences: z.record(z.string(), z.any()),
  image: z.string().optional().nullable(),

  sampleSummary: z.string().optional().nullable(),
  targetSampleSize: z.coerce.number().int().optional().nullable(),
  preliminaryRecommendations: z.string().optional().nullable(),
  studyStructure: z.string().optional().nullable(),
});

export const regenerateSurveysAISchema = z.object({
  problemSummary: z.string().min(1),
  objectives: z.string().min(1),
  assumptions: z.string().min(1),
  audiences: z.record(z.string(), z.any()),
  surveyId: z.string(),
});

export const addQuestionAISchema = z.object({
  problemSummary: z.string().min(1),
  objectives: z.string().min(1),
  assumptions: z.string().min(1),
  audiences: z.record(z.string(), z.any()),
  surveyId: z.string(),
  userPrompt: z.string().min(1),
});

export const generateExecutiveSummarySchema = z.object({
  missionId: z.string(),
  responses: z.any(),
});

export const SurveyQuestionSchema = z.object({

  type: AllowedQuestionTypeEnum,
  category: AllowedQuestionTypeEnum.optional(),

  name: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  isRequired: z.boolean().optional(),

  // ----- CHOIX / RANKING -----
  choices: z.array(z.string()).optional(),
  allowMultiple: z.boolean().optional(),
  randomizeChoices: z.boolean().optional(),
  hasOther: z.boolean().optional(),

  // ----- SCALES -----
  rateMin: z.number().optional(),
  rateMax: z.number().optional(),
  rateStep: z.number().optional(),
  minRateDescription: z.string().optional(),
  maxRateDescription: z.string().optional(),
  displayRateDescriptionsAsExtremes: z.boolean().optional(),

  // ----- NUMERIC -----
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  inputType: z.string().optional(),
  maxLength: z.number().optional(),

  // ----- MATRIX -----
  rows: z.array(z.string()).optional(),
  columns: z.array(z.string()).optional(),
  allowRowReorder: z.boolean().optional(),

  // ----- IMAGE RANKING -----
  imageChoices: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
        label: z.string(),
        imageUrl: z.string(),
        description: z.string().optional(),
      })
    )
    .optional(),

  // ----- MEDIA -----
  mediaTypes: z.array(MediaTypeEnum).optional(),
  maxDurationSeconds: z.number().optional(),
  maxSizeMb: z.number().optional(),
  maxFiles: z.number().optional(),
  captureRequired: z.boolean().optional(),
  mediaMode: z.enum(["upload", "stimulus"]).optional(),
  stimulusSource: z.enum(["upload", "url"]).optional(),
  stimulusMediaUrl: z.string().optional(),
  stimulusMediaType: MediaTypeEnum.optional(),

  // ----- HEATMAP -----
  heatmap: HeatmapSchema.optional(),

  // ----- GPS -----
  gpsMode: GpsModeEnum.optional(),
  targetLocation: z
    .object({ lat: z.number(), lng: z.number(), label: z.string().optional() })
    .optional(),
  maxDistanceMeters: z.number().optional(),
  minTimeOnSiteSeconds: z.number().optional(),
  requiresPathTracking: z.boolean().optional(),
  gpsToleranceMeters: z.number().optional(),

  // ----- SECTION -----
  isSectionTitle: z.boolean().optional(),
  sectionId: z.string().optional(),
  sectionTitle: z.string().optional(),
});

export const updateSurveyQuestionsSchema = z.object({
  surveyId: z.string(),
  questions: z.any(),
});

export const missionForValidationSchema = z.object({
  missionId: z.string(),
  name: z.string(),
  problemSummary: z.string().optional().nullable(),
  objectives: z.string().optional().nullable(),
  assumptions: z.string().optional().nullable(),
  status: z
    .enum(["draft", "live", "paused", "cancelled", "complete", "on hold"])
    .optional()
    .nullable(),
  workspaceId: z.string().optional(),
  revalidateRoute: z.string().optional().nullable(),
  audiences: z.record(z.string(), z.any()),
});

export const updateMissionSchema = z.object({
  missionId: z.string(),
  name: z.string().optional().nullable(),
  problemSummary: z.string().optional().nullable(),
  objectives: z.string().optional().nullable(),
  assumptions: z.string().optional().nullable(),
  status: z
    .enum(["draft", "live", "paused", "cancelled", "complete", "on hold"])
    .optional()
    .nullable(),
  revalidateRoute: z.string().optional().nullable(),
});

export const updateMissionPermissionsSchema = z.object({
  orgId: z.string().min(1, "ID d'organisation requis"),
  missionId: z.string().min(1, "ID de mission requis"),
  isPublic: z.boolean(),
  authorizedUserIds: z.array(z.string()).default([]),
});

export const getMissionPermissionsSchema = z.object({
  missionId: z.string().min(1, "ID de mission requis"),
});

export type UpdateMissionPermissionsInput = z.infer<
  typeof updateMissionPermissionsSchema
>;
export type GetMissionPermissionsInput = z.infer<
  typeof getMissionPermissionsSchema
>;

export const duplicateMissionSchema = z.object({
  missionId: z.string().uuid(),
});

export const createBillingInfoSchema = z.object({
  organizationId: z.string(),
  credits: z.number().int().min(0),
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  country: z.string(),
  company: z.string(),
  civility: z.enum(["m", "f", "other"]).optional(),
  firstName: z.string(),
  lastName: z.string(),
  acceptTerms: z.boolean(),
});
