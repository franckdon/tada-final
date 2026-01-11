import type { useI18n } from "@/locales/client";
import { z } from "zod";

export const updateProfileSchema = (t: ReturnType<typeof useI18n>) =>
  z.object({
    name: z.string().min(2, {
      message: t("settings.personalInfo.validation.name.tooShort"),
    }),
    email: z.string().email({
      message: t("settings.personalInfo.validation.email.invalid"),
    }),
    position: z.string().min(2, {
      message: t("settings.personalInfo.validation.position.tooShort"),
    }) /* 
    country: z
      .string()
      .min(1, {
        message: t("settings.personalInfo.validation.country.required"),
      })
      .optional()
      .nullable(),
    sector: z
      .string()
      .min(1, {
        message: t("settings.personalInfo.validation.sector.required"),
      })
      .optional()
      .nullable(), */,
  });

export type UpdateProfileFormData = z.infer<
  ReturnType<typeof updateProfileSchema>
>;
