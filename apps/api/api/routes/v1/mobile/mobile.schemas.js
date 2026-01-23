"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.userPatchSchema = exports.userPutSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.logoutSchema = exports.refreshSchema = exports.loginSchema = exports.resendOtpSchema = exports.verifySchema = exports.registerSchema = void 0;
// apps/api/src/routes/mobile/mobile.schemas.ts
const zod_1 = require("zod");
const sexEnum = zod_1.z.enum(["male", "female", "other", "prefer_not_to_say"]);
const birthDateSchema = zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de naissance invalide (format attendu: YYYY-MM-DD)");
exports.registerSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: zod_1.z.string().email("Email invalide"),
    password: zod_1.z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    passwordConfirm: zod_1.z.string().min(8, "La confirmation du mot de passe est requise"),
    role: zod_1.z.string().optional(),
})
    .refine((v) => v.password === v.passwordConfirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirm"],
});
exports.verifySchema = zod_1.z.object({
    email: zod_1.z.string().email("Email invalide"),
    otp: zod_1.z.string().length(4, "Le code doit contenir 4 chiffres"),
});
exports.resendOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email invalide"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email invalide"),
    password: zod_1.z.string().min(1, "Mot de passe requis"),
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(10, "Refresh token requis"),
});
exports.logoutSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(10, "Refresh token requis"),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email invalide"),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email invalide"),
    otp: zod_1.z.string().length(6, "Le code doit contenir 6 chiffres"),
    newPassword: zod_1.z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});
// Profil (PUT = complet, PATCH = partiel)
// On n'autorise pas le changement d'email ici.
exports.userPutSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    position: zod_1.z.string().min(1, "Position invalide").optional().nullable(),
    country: zod_1.z.string().min(1, "Pays invalide").optional().nullable(),
    sector: zod_1.z.string().min(1, "Secteur invalide").optional().nullable(),
    job: zod_1.z.string().min(1, "Métier invalide").optional().nullable(),
    location: zod_1.z.string().min(1, "Localisation invalide").optional().nullable(),
    image: zod_1.z.string().url("URL d'image invalide").optional().nullable(),
    // NEW
    sex: sexEnum.optional().nullable(),
    birthDate: birthDateSchema.optional().nullable(),
});
exports.userPatchSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
    position: zod_1.z.string().min(1, "Position invalide").optional().nullable(),
    country: zod_1.z.string().min(1, "Pays invalide").optional().nullable(),
    sector: zod_1.z.string().min(1, "Secteur invalide").optional().nullable(),
    job: zod_1.z.string().min(1, "Métier invalide").optional().nullable(),
    location: zod_1.z.string().min(1, "Localisation invalide").optional().nullable(),
    image: zod_1.z.string().url("URL d'image invalide").optional().nullable(),
    // NEW
    sex: sexEnum.optional().nullable(),
    birthDate: birthDateSchema.optional().nullable(),
})
    .refine((v) => Object.keys(v).length > 0, {
    message: "Aucun champ à modifier",
    path: ["body"],
});
exports.changePasswordSchema = zod_1.z
    .object({
    oldPassword: zod_1.z.string().min(1, "Ancien mot de passe requis"),
    newPassword: zod_1.z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: zod_1.z.string().min(8, "La confirmation du mot de passe est requise"),
})
    .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});
