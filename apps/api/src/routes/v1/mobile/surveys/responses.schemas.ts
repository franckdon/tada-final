import { z } from "zod";

/**
 * responses: JSON libre mais doit être un objet
 * location: le modèle Prisma le définit comme Json (non-null en pratique) => on met un default {}
 */
export const createSurveyResponseSchema = z.object({
  responses: z.record(z.any()),
  age: z.coerce.number().int().min(13).max(120).optional(), // ajuste si besoin
  gender: z.string().trim().min(1).max(50).optional(),
  location: z.any().optional().default({}), // JSON
});

export type CreateSurveyResponseInput = z.infer<typeof createSurveyResponseSchema>;
