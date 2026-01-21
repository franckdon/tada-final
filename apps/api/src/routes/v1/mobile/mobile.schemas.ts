// apps/api/src/routes/mobile/mobile.schemas.ts
import { z } from "zod";

const sexEnum = z.enum(["male", "female", "other", "prefer_not_to_say"]);

const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de naissance invalide (format attendu: YYYY-MM-DD)");

export const registerSchema = z
  .object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    passwordConfirm: z.string().min(8, "La confirmation du mot de passe est requise"),
    role: z.string().optional(),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirm"],
  });

export const verifySchema = z.object({
  email: z.string().email("Email invalide"),
  otp: z.string().length(4, "Le code doit contenir 4 chiffres"),
});

export const resendOtpSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, "Refresh token requis"),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(10, "Refresh token requis"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
  otp: z.string().length(6, "Le code doit contenir 6 chiffres"),
  newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

// Profil (PUT = complet, PATCH = partiel)
// On n'autorise pas le changement d'email ici.
export const userPutSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  position: z.string().min(1, "Position invalide").optional().nullable(),
  country: z.string().min(1, "Pays invalide").optional().nullable(),
  sector: z.string().min(1, "Secteur invalide").optional().nullable(),
  job: z.string().min(1, "Métier invalide").optional().nullable(),
  location: z.string().min(1, "Localisation invalide").optional().nullable(),
  image: z.string().url("URL d'image invalide").optional().nullable(),

  // NEW
  sex: sexEnum.optional().nullable(),
  birthDate: birthDateSchema.optional().nullable(),
});

export const userPatchSchema = z
  .object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
    position: z.string().min(1, "Position invalide").optional().nullable(),
    country: z.string().min(1, "Pays invalide").optional().nullable(),
    sector: z.string().min(1, "Secteur invalide").optional().nullable(),
    job: z.string().min(1, "Métier invalide").optional().nullable(),
    location: z.string().min(1, "Localisation invalide").optional().nullable(),
    image: z.string().url("URL d'image invalide").optional().nullable(),

    // NEW
    sex: sexEnum.optional().nullable(),
    birthDate: birthDateSchema.optional().nullable(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "Aucun champ à modifier",
    path: ["body"],
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Ancien mot de passe requis"),
    newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string().min(8, "La confirmation du mot de passe est requise"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
