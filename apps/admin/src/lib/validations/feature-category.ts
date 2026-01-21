import { z } from "zod";

const localeSchema = z.enum(["fr", "en"]);

const translationSchema = z.object({
  locale: localeSchema,
  name: z.string().trim().min(1, "Translation name is required"),
});

const createCategorySchema = z.object({
  key: z.string().trim().min(1, "key is required").max(80),
  name: z.string().trim().min(1, "name is required"),
  sortOrder: z.coerce.number().int().min(0).default(0),
  translations: z.array(translationSchema).default([]),
});

const updateCategorySchema = z.object({
  key: z.string().trim().min(1).max(80).optional(),
  name: z.string().trim().min(1).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  translations: z.array(translationSchema).optional(),
});

export function validateCreateCategory(input: unknown) {
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { valid: false as const, errors: parsed.error.flatten() };
  }
  return { valid: true as const, data: parsed.data };
}

export function validateUpdateCategory(input: unknown) {
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { valid: false as const, errors: parsed.error.flatten() };
  }
  return { valid: true as const, data: parsed.data };
}
