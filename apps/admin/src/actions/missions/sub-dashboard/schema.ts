import { z } from "zod";

export const createSubDashboardSchema = z.object({
  name: z.string().min(1),
  missionId: z.string().uuid(),
  isShared: z.boolean(),
});

export const createSubDashboardItemSchema = z.object({
  subDashboardId: z.string().uuid(),
  type: z.string().min(1),
  content: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  surveyKey: z.string().optional().nullable(),
});

export const updateSubDashboardItemSchema = z.object({
  id: z.string().uuid(),
  content: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  surveyKey: z.string().optional().nullable(),
});
