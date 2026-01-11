import { z } from "zod";

export const createBoardSchema = z.object({
  name: z.string().min(1),
  // organizationId: z.string(),
  missionId: z.string(),
});

export const createChartSchema = z.object({
  name: z.string().optional(),
  type: z.string(),
  projectId: z.string(),
  layout: z.any(),
  content: z.string().optional(),
  onReport: z.boolean().optional(),
  draft: z.boolean().optional(),
});

export const createChartsSchema = z.object({
  charts: z.array(createChartSchema),
});

export const updateChartSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string().optional(),
  layout: z.any().optional(),
  content: z.string().optional(),
  onReport: z.boolean().optional(),
  draft: z.boolean().optional(),
});
