import { z } from "zod";
import { FeatureValueType, LocaleCode } from "@prisma/client";

const translationSchema = z.object({
  locale: z.nativeEnum(LocaleCode),
  label: z.string().min(1, "Translation label is required"),
  description: z.string().optional().nullable(),
});

const baseFeatureSchema = z.object({
  key: z.string().min(2).max(120),
  label: z.string().min(1),
  description: z.string().optional().nullable(),
  valueType: z.nativeEnum(FeatureValueType),
  unit: z.string().max(40).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  categoryId: z.string().uuid().optional().nullable(),
  translations: z.array(translationSchema).optional(),
});

export function validateCreateFeature(input: unknown) {
  const parsed = baseFeatureSchema.safeParse(input);
  if (!parsed.success) {
    return { valid: false as const, errors: parsed.error.flatten() };
  }
  return { valid: true as const, data: parsed.data };
}

// PATCH : tout optionnel
const updateFeatureSchema = baseFeatureSchema.partial();

export function validateUpdateFeature(input: unknown) {
  const parsed = updateFeatureSchema.safeParse(input);
  if (!parsed.success) {
    return { valid: false as const, errors: parsed.error.flatten() };
  }
  return { valid: true as const, data: parsed.data };
}
