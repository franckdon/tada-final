import type { useI18n } from "@/locales/client";
import { z } from "zod";

export const createSignupSchema = (t: ReturnType<typeof useI18n>) =>
  z
    .object({
      email: z
        .string()
        .min(1, t("auth.validation.email.required"))
        .email(t("auth.validation.email.invalid")),
      password: z
        .string()
        .min(8, t("auth.validation.password.minLength"))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          t("auth.validation.password.pattern"),
        ),
      confirmPassword: z
        .string()
        .min(1, t("auth.validation.confirmPassword.required")),
      name: z.string().min(1, t("auth.validation.name.required")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.validation.confirmPassword.match"),
      path: ["confirmPassword"],
    });

export type SignupFormData = z.infer<ReturnType<typeof createSignupSchema>>;
