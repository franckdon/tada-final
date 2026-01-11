import { z } from "zod";

export const createTemplateSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  internal: z.boolean(),
});

export const updateTemplateSchema = z.object({
  templateId: z.string(),
  questions: z.any().optional(),
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
});

export const deleteTemplateSchema = z.object({
  templateId: z.string(),
});

export const addQuestionTemplateAISchema = z.object({
  templateId: z.string(),
  userPrompt: z.string(),
});
