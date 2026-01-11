// apps/api/src/routes/mobile/mobile.service.ts
import * as crypto from "node:crypto";
import * as bcrypt from "bcryptjs";

import { env } from "../../../env";
import { sha256, randomOtp6 } from "../../../lib/crypto";
import { signAccessToken } from "../../../lib/jwt";
import { sendMail } from "../../../lib/mailer/sendMail";
import { resetPasswordOtpEmail, verifyAccountOtpEmail } from "../../../lib/mailer/templates";

import {
  RESET_IDENTIFIER_PREFIX,
  VERIFY_IDENTIFIER_PREFIX,
  VERIFY_OTP_TTL_MINUTES,
  RESET_OTP_TTL_MINUTES,
  REFRESH_PREFIX,
  randomOtp4,
} from "./mobile.constants";

import * as repo from "./mobile.repo";

function isProd() {
  return (env.NODE_ENV ?? "development") === "production";
}

export async function register(params: { name: string; email: string; password: string }) {
  const { name, email, password } = params;

  const existing = await repo.findUserByEmail(email);
  let userId: string;

  if (existing) {
    userId = existing.id;
  } else {
    userId = crypto.randomUUID();
    await repo.createUser({ id: userId, name, email });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await repo.upsertMobileAccount(userId, email, passwordHash);

  const otp = randomOtp4();
  const otpHash = sha256(otp);
  await repo.createVerificationOtp(`${VERIFY_IDENTIFIER_PREFIX}${email}`, otpHash, VERIFY_OTP_TTL_MINUTES);

  if (!isProd()) {
    console.log(`[MOBILE VERIFY OTP] ${email} -> ${otp} (${VERIFY_OTP_TTL_MINUTES} min)`);
  } else {
    await sendMail({
      to: email,
      subject: "[Tada] Code de confirmation",
      html: verifyAccountOtpEmail({ otp, expiresInMinutes: VERIFY_OTP_TTL_MINUTES }),
    });
  }

  return { ok: true as const };
}

export async function verifyEmail(
  params: { email: string; otp: string },
  reqMeta: { ip: string | null; ua: string | null },
) {
  const { email, otp } = params;

  const identifier = `${VERIFY_IDENTIFIER_PREFIX}${email}`;
  const row = await repo.readVerification(identifier);

  if (!row) return { ok: false as const, status: 400, message: "Code de vérification invalide" };

  if (new Date(row.expiresAt) <= new Date()) {
    await repo.deleteVerificationByIdentifier(identifier);
    return { ok: false as const, status: 400, message: "Code expiré, veuillez demander un nouveau code" };
  }

  if (sha256(otp) !== row.value) {
    return { ok: false as const, status: 400, message: "Code de vérification invalide" };
  }

  const user = await repo.findUserByEmail(email);
  if (!user) return { ok: false as const, status: 400, message: "Code de vérification invalide" };

  await repo.setUserVerified(user.id);
  await repo.deleteVerificationByIdentifier(identifier);

  const accessToken = await signAccessToken(user.id);
  const refreshToken = await repo.createRefreshSession(user.id, reqMeta.ip, reqMeta.ua);

  return {
    ok: true as const,
    data: {
      tokenType: "Bearer",
      accessToken,
      expiresIn: env.MOBILE_ACCESS_TTL_SECONDS,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name },
    },
  };
}

export async function resendVerifyOtp(params: { email: string }) {
  const { email } = params;

  const user = await repo.findUserByEmail(email);
  if (!user) return { ok: true as const };

  const verified = await repo.isUserEmailVerified(user.id);
  if (verified) return { ok: true as const };

  const otp = randomOtp4();
  const otpHash = sha256(otp);
  await repo.createVerificationOtp(`${VERIFY_IDENTIFIER_PREFIX}${email}`, otpHash, VERIFY_OTP_TTL_MINUTES);

  if (!isProd()) {
    console.log(`[MOBILE VERIFY OTP] ${email} -> ${otp} (${VERIFY_OTP_TTL_MINUTES} min)`);
  } else {
    await sendMail({
      to: email,
      subject: "[Tada] Nouveau code de confirmation",
      html: verifyAccountOtpEmail({ otp, expiresInMinutes: VERIFY_OTP_TTL_MINUTES }),
    });
  }

  return { ok: true as const };
}

export async function login(
  params: { email: string; password: string },
  reqMeta: { ip: string | null; ua: string | null },
) {
  const { email, password } = params;

  const user = await repo.findUserByEmail(email);
  if (!user) return { ok: false as const, status: 401, message: "Email ou mot de passe incorrect" };

  const verified = await repo.isUserEmailVerified(user.id);
  if (!verified) {
    return { ok: false as const, status: 403, message: "Compte non vérifié. Veuillez confirmer votre email." };
  }

  const acc = await repo.findMobileAccount(user.id);
  if (!acc?.password) return { ok: false as const, status: 401, message: "Email ou mot de passe incorrect" };

  const ok = await bcrypt.compare(password, acc.password);
  if (!ok) return { ok: false as const, status: 401, message: "Email ou mot de passe incorrect" };

  const accessToken = await signAccessToken(user.id);
  const refreshToken = await repo.createRefreshSession(user.id, reqMeta.ip, reqMeta.ua);

  return {
    ok: true as const,
    data: {
      tokenType: "Bearer",
      accessToken,
      expiresIn: env.MOBILE_ACCESS_TTL_SECONDS,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name },
    },
  };
}

export async function refresh(params: { refreshToken: string }, reqMeta: { ip: string | null; ua: string | null }) {
  const { refreshToken } = params;

  if (!refreshToken.startsWith(REFRESH_PREFIX)) {
    return { ok: false as const, status: 401, message: "Refresh token invalide" };
  }

  const s = await repo.readSessionByToken(refreshToken);
  if (!s) return { ok: false as const, status: 401, message: "Refresh token invalide" };

  if (new Date(s.expiresAt) <= new Date()) {
    await repo.revokeRefreshToken(refreshToken);
    return { ok: false as const, status: 401, message: "Refresh token expiré" };
  }

  await repo.revokeRefreshToken(refreshToken);

  const newRefreshToken = await repo.createRefreshSession(s.userId, reqMeta.ip, reqMeta.ua);
  const accessToken = await signAccessToken(s.userId);

  return {
    ok: true as const,
    data: {
      tokenType: "Bearer",
      accessToken,
      expiresIn: env.MOBILE_ACCESS_TTL_SECONDS,
      refreshToken: newRefreshToken,
    },
  };
}

export async function logout(params: { refreshToken: string }) {
  const { refreshToken } = params;
  await repo.revokeRefreshToken(refreshToken);
  return { ok: true as const };
}

export async function forgotPassword(params: { email: string }) {
  const { email } = params;

  const user = await repo.findUserByEmail(email);
  if (!user) return { ok: true as const };

  const otp = randomOtp6();
  const otpHash = sha256(otp);

  const identifier = `${RESET_IDENTIFIER_PREFIX}${email}`;
  await repo.createVerificationOtp(identifier, otpHash, RESET_OTP_TTL_MINUTES);

  if (!isProd()) {
    console.log(`[MOBILE RESET OTP] ${email} -> ${otp} (${RESET_OTP_TTL_MINUTES} min)`);
  } else {
    await sendMail({
      to: email,
      subject: "[Tada] Réinitialisation du mot de passe",
      html: resetPasswordOtpEmail({ otp, expiresInMinutes: RESET_OTP_TTL_MINUTES }),
    });
  }

  return { ok: true as const };
}

export async function resetPassword(params: { email: string; otp: string; newPassword: string }) {
  const { email, otp, newPassword } = params;

  const identifier = `${RESET_IDENTIFIER_PREFIX}${email}`;
  const row = await repo.readVerification(identifier);

  if (!row) return { ok: false as const, status: 400, message: "Code invalide" };

  if (new Date(row.expiresAt) <= new Date()) {
    await repo.deleteVerificationByIdentifier(identifier);
    return { ok: false as const, status: 400, message: "Code expiré, veuillez recommencer" };
  }

  if (sha256(otp) !== row.value) return { ok: false as const, status: 400, message: "Code invalide" };

  const user = await repo.findUserByEmail(email);
  if (!user) return { ok: false as const, status: 400, message: "Code invalide" };

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await repo.upsertMobileAccount(user.id, email, passwordHash);

  await repo.revokeAllMobileRefreshTokensForUser(user.id);
  await repo.deleteVerificationByIdentifier(identifier);

  return { ok: true as const };
}

// ---- User/profile ----

export async function getMe(userId: string) {
  const user = await repo.findUserById(userId);
  if (!user) return { ok: false as const, status: 404, message: "Utilisateur introuvable" };

  return {
    ok: true as const,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image ?? null,
        emailVerified: user.emailVerified,
        position: user.position,
        country: user.country,
        sector: user.sector,
        job: user.job,
        location: user.location,

        // NEW
        sex: user.sex ?? null,
        birthDate: user.birth_date ?? null,
      },
    },
  };
}

export async function updateMeFull(
  userId: string,
  data: {
    name: string;
    position?: string | null;
    country?: string | null;
    sector?: string | null;
    job?: string | null;
    location?: string | null;
    image?: string | null;

    // NEW
    sex?: repo.UserSex | null;
    birthDate?: string | null; // "YYYY-MM-DD"
  },
) {
  const user = await repo.findUserById(userId);
  if (!user) return { ok: false as const, status: 404, message: "Utilisateur introuvable" };

  await repo.updateUserFull(userId, data);
  return await getMe(userId);
}

export async function updateMePartial(
  userId: string,
  data: Partial<{
    name: string;
    position: string | null;
    country: string | null;
    sector: string | null;
    job: string | null;
    location: string | null;
    image: string | null;

    // NEW
    sex: repo.UserSex | null;
    birthDate: string | null; // "YYYY-MM-DD"
  }>,
) {
  const user = await repo.findUserById(userId);
  if (!user) return { ok: false as const, status: 404, message: "Utilisateur introuvable" };

  await repo.updateUserPartial(userId, data);
  return await getMe(userId);
}

export async function changePassword(userId: string, payload: { oldPassword: string; newPassword: string }) {
  const user = await repo.findUserById(userId);
  if (!user) return { ok: false as const, status: 404, message: "Utilisateur introuvable" };

  const acc = await repo.findMobileAccount(userId);
  if (!acc?.password) {
    return { ok: false as const, status: 400, message: "Aucun mot de passe mobile n'est configuré pour ce compte." };
  }

  const ok = await bcrypt.compare(payload.oldPassword, acc.password);
  if (!ok) return { ok: false as const, status: 401, message: "Ancien mot de passe incorrect" };

  const newHash = await bcrypt.hash(payload.newPassword, 12);
  await repo.upsertMobileAccount(userId, user.email, newHash);

  await repo.revokeAllMobileRefreshTokensForUser(userId);

  return { ok: true as const };
}
