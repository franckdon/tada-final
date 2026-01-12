import { z } from "zod";

const truthy = new Set(["1", "true", "yes", "y", "on"]);
const falsy = new Set(["0", "false", "no", "n", "off"]);

function toBool(v: unknown): unknown {
  if (typeof v !== "string") return v;
  const s = v.trim().toLowerCase();
  if (truthy.has(s)) return true;
  if (falsy.has(s)) return false;
  return v;
}

export const surveysListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),

  // search
  q: z.string().trim().min(1).max(200).optional(),

  // sorting
  sortBy: z.enum(["createdAt", "updatedAt", "name"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),

  // include payload
  includeQuestions: z.preprocess(toBool, z.boolean()).default(false),
});

export type SurveysListQuery = z.infer<typeof surveysListQuerySchema>;

export const surveyDetailsQuerySchema = z.object({
  includeQuestions: z.preprocess(toBool, z.boolean()).default(true),
});

export type SurveyDetailsQuery = z.infer<typeof surveyDetailsQuerySchema>;
