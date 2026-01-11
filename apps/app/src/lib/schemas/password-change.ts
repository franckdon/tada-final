import type { useI18n } from "@/locales/client";
import { z } from "zod";

export const updatePasswordSchema = (t: ReturnType<typeof useI18n>) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, t("settings.password.validation.currentRequired")),
      newPassword: z
        .string()
        .min(8, t("settings.password.validation.tooShort")),
      confirmPassword: z
        .string()
        .min(1, t("settings.password.validation.confirmRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("settings.password.validation.noMatch"),
      path: ["confirmPassword"],
    });

export type UpdatePasswordFormData = z.infer<
  ReturnType<typeof updatePasswordSchema>
>;
