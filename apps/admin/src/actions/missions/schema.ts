import { z } from "zod";

export const createMissionSchema = z.object({
  name: z.string().min(1),
  problemSummary: z.string().min(1),
  objectives: z.string().min(1),
  assumptions: z.string().min(1),
  mode: z
    .enum(["template", "manual", "ai", "survey", "contributor-info"])
    .nullable()
    .optional(),
  templateId: z.string().nullable().optional(),
  audiences: z.record(z.string(), z.any()),
});

export const createMissionConfigForContributorsSchema = z.object({
  title: z.string().min(1),
  missionId: z.string().optional().nullable(),
  description: z.string().min(1),
  gain: z.number(),
  duration: z.number(),
  targetSampleSize: z.number(),
  deadline: z.date().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
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
});

export const SurveyQuestionSchema = z.object({
  type: z.string(),
  name: z.string(),
  title: z.string(),
  isRequired: z.boolean().optional(),
  choices: z.array(z.string()).optional(),
  rateMin: z.number().optional(),
  rateMax: z.number().optional(),
  rateStep: z.number().optional(),
  minRateDescription: z.string().optional(),
  maxRateDescription: z.string().optional(),
  displayRateDescriptionsAsExtremes: z.boolean().optional(),
  displayMode: z.enum(["auto", "buttons", "dropdown"]).optional(),
  hasOther: z.boolean().optional(),
  otherText: z.string().optional(),
  inputType: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
});

export const publishMissionSchema = z.object({
  missionId: z.string(),
  isPublish: z.boolean(),
  status: z
    .enum(["draft", "live", "paused", "cancelled", "complete", "on hold"])
    .optional()
    .nullable(),
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
  organizationId: z.string().optional().nullable(),
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
