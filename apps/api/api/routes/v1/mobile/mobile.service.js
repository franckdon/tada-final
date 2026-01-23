"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.verifyEmail = verifyEmail;
exports.resendVerifyOtp = resendVerifyOtp;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.getMe = getMe;
exports.updateMeFull = updateMeFull;
exports.updateMePartial = updateMePartial;
exports.changePassword = changePassword;
// apps/api/src/routes/mobile/mobile.service.ts
const crypto = __importStar(require("node:crypto"));
const bcrypt = __importStar(require("bcryptjs"));
const env_1 = require("../../../env");
const crypto_1 = require("../../../lib/crypto");
const jwt_1 = require("../../../lib/jwt");
const sendMail_1 = require("../../../lib/mailer/sendMail");
const templates_1 = require("../../../lib/mailer/templates");
const mobile_constants_1 = require("./mobile.constants");
const repo = __importStar(require("./mobile.repo"));
/**
 * Email sending policy:
 * - If SEND_EMAILS === "true" -> actually send emails
 * - Otherwise -> log OTPs in server logs (useful for local/dev)
 *
 * This avoids relying on NODE_ENV, which is often inconsistent between
 * local/preview/production deployments (especially on Vercel).
 */
function shouldSendEmails() {
    return env_1.env.SEND_EMAILS === "true";
}
async function deliverOtp(args) {
    const { kind, email, otp, ttlMinutes } = args;
    if (!shouldSendEmails()) {
        console.log(`[MOBILE ${kind.toUpperCase()} OTP][EMAILS_DISABLED] ${email} -> ${otp} (${ttlMinutes} min)`);
        return;
    }
    console.log(`[MOBILE ${kind.toUpperCase()} OTP][SENDING] ${email}`);
    if (kind === "verify") {
        await (0, sendMail_1.sendMail)({
            to: email,
            subject: "[Tada] Code de confirmation",
            html: (0, templates_1.verifyAccountOtpEmail)({ otp, expiresInMinutes: ttlMinutes }),
        });
        return;
    }
    await (0, sendMail_1.sendMail)({
        to: email,
        subject: "[Tada] Réinitialisation du mot de passe",
        html: (0, templates_1.resetPasswordOtpEmail)({ otp, expiresInMinutes: ttlMinutes }),
    });
}
async function register(params) {
    // Register a new user with mobile account
    const { name, email, password, role = "contributor" } = params;
    const existing = await repo.findUserByEmail(email);
    if (existing) {
        const verified = await repo.isUserEmailVerified(existing.id);
        if (verified) {
            return { ok: false, status: 409, message: "Un compte existe déjà avec cet email. Connectez-vous." };
        }
        // Compte non vérifié -> on renvoie un OTP, mais on ne change pas le password ici
        const otp = (0, mobile_constants_1.randomOtp4)();
        await repo.createVerificationOtp(`${mobile_constants_1.VERIFY_IDENTIFIER_PREFIX}${email}`, (0, crypto_1.sha256)(otp), mobile_constants_1.VERIFY_OTP_TTL_MINUTES);
        await deliverOtp({ kind: "verify", email, otp, ttlMinutes: mobile_constants_1.VERIFY_OTP_TTL_MINUTES });
        return { ok: true };
    }
    const userId = crypto.randomUUID();
    await repo.createUser({ id: userId, name, email, role });
    const passwordHash = await bcrypt.hash(password, 12);
    await repo.upsertMobileAccount(userId, email, passwordHash);
    const otp = (0, mobile_constants_1.randomOtp4)();
    await repo.createVerificationOtp(`${mobile_constants_1.VERIFY_IDENTIFIER_PREFIX}${email}`, (0, crypto_1.sha256)(otp), mobile_constants_1.VERIFY_OTP_TTL_MINUTES);
    await deliverOtp({ kind: "verify", email, otp, ttlMinutes: mobile_constants_1.VERIFY_OTP_TTL_MINUTES });
    return { ok: true };
}
async function verifyEmail(params, reqMeta) {
    const { email, otp } = params;
    const identifier = `${mobile_constants_1.VERIFY_IDENTIFIER_PREFIX}${email}`;
    const row = await repo.readVerification(identifier);
    if (!row)
        return { ok: false, status: 400, message: "Code de vérification invalide" };
    if (new Date(row.expiresAt) <= new Date()) {
        await repo.deleteVerificationByIdentifier(identifier);
        return {
            ok: false,
            status: 400,
            message: "Code expiré, veuillez demander un nouveau code",
        };
    }
    if ((0, crypto_1.sha256)(otp) !== row.value) {
        return { ok: false, status: 400, message: "Code de vérification invalide" };
    }
    const user = await repo.findUserByEmail(email);
    if (!user)
        return { ok: false, status: 400, message: "Code de vérification invalide" };
    await repo.setUserVerified(user.id);
    await repo.deleteVerificationByIdentifier(identifier);
    const accessToken = await (0, jwt_1.signAccessToken)(user.id);
    const refreshToken = await repo.createRefreshSession(user.id, reqMeta.ip, reqMeta.ua);
    return {
        ok: true,
        data: {
            tokenType: "Bearer",
            accessToken,
            expiresIn: env_1.env.MOBILE_ACCESS_TTL_SECONDS,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name },
        },
    };
}
async function resendVerifyOtp(params) {
    const { email } = params;
    const user = await repo.findUserByEmail(email);
    if (!user)
        return { ok: true };
    const verified = await repo.isUserEmailVerified(user.id);
    if (verified)
        return { ok: true };
    const otp = (0, mobile_constants_1.randomOtp4)();
    const otpHash = (0, crypto_1.sha256)(otp);
    await repo.createVerificationOtp(`${mobile_constants_1.VERIFY_IDENTIFIER_PREFIX}${email}`, otpHash, mobile_constants_1.VERIFY_OTP_TTL_MINUTES);
    await deliverOtp({
        kind: "verify",
        email,
        otp,
        ttlMinutes: mobile_constants_1.VERIFY_OTP_TTL_MINUTES,
    });
    return { ok: true };
}
async function login(params, reqMeta) {
    const { email, password } = params;
    const user = await repo.findUserByEmail(email);
    if (!user)
        return { ok: false, status: 401, message: "Email ou mot de passe incorrect" };
    const verified = await repo.isUserEmailVerified(user.id);
    if (!verified) {
        return {
            ok: false,
            status: 403,
            message: "Compte non vérifié. Veuillez confirmer votre email.",
        };
    }
    const acc = await repo.findMobileAccount(user.id);
    if (!acc?.password)
        return { ok: false, status: 401, message: "Email ou mot de passe incorrect" };
    const ok = await bcrypt.compare(password, acc.password);
    if (!ok)
        return { ok: false, status: 401, message: "Email ou mot de passe incorrect" };
    const accessToken = await (0, jwt_1.signAccessToken)(user.id);
    const refreshToken = await repo.createRefreshSession(user.id, reqMeta.ip, reqMeta.ua);
    return {
        ok: true,
        data: {
            tokenType: "Bearer",
            accessToken,
            expiresIn: env_1.env.MOBILE_ACCESS_TTL_SECONDS,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name },
        },
    };
}
async function refresh(params, reqMeta) {
    const { refreshToken } = params;
    if (!refreshToken.startsWith(mobile_constants_1.REFRESH_PREFIX)) {
        return { ok: false, status: 401, message: "Refresh token invalide" };
    }
    const s = await repo.readSessionByToken(refreshToken);
    if (!s)
        return { ok: false, status: 401, message: "Refresh token invalide" };
    if (new Date(s.expiresAt) <= new Date()) {
        await repo.revokeRefreshToken(refreshToken);
        return { ok: false, status: 401, message: "Refresh token expiré" };
    }
    await repo.revokeRefreshToken(refreshToken);
    const newRefreshToken = await repo.createRefreshSession(s.userId, reqMeta.ip, reqMeta.ua);
    const accessToken = await (0, jwt_1.signAccessToken)(s.userId);
    return {
        ok: true,
        data: {
            tokenType: "Bearer",
            accessToken,
            expiresIn: env_1.env.MOBILE_ACCESS_TTL_SECONDS,
            refreshToken: newRefreshToken,
        },
    };
}
async function logout(params) {
    const { refreshToken } = params;
    await repo.revokeRefreshToken(refreshToken);
    return { ok: true };
}
async function forgotPassword(params) {
    const { email } = params;
    const user = await repo.findUserByEmail(email);
    if (!user)
        return { ok: true };
    const otp = (0, crypto_1.randomOtp6)();
    const otpHash = (0, crypto_1.sha256)(otp);
    const identifier = `${mobile_constants_1.RESET_IDENTIFIER_PREFIX}${email}`;
    await repo.createVerificationOtp(identifier, otpHash, mobile_constants_1.RESET_OTP_TTL_MINUTES);
    await deliverOtp({
        kind: "reset",
        email,
        otp,
        ttlMinutes: mobile_constants_1.RESET_OTP_TTL_MINUTES,
    });
    return { ok: true };
}
async function resetPassword(params) {
    const { email, otp, newPassword } = params;
    const identifier = `${mobile_constants_1.RESET_IDENTIFIER_PREFIX}${email}`;
    const row = await repo.readVerification(identifier);
    if (!row)
        return { ok: false, status: 400, message: "Code invalide" };
    if (new Date(row.expiresAt) <= new Date()) {
        await repo.deleteVerificationByIdentifier(identifier);
        return { ok: false, status: 400, message: "Code expiré, veuillez recommencer" };
    }
    if ((0, crypto_1.sha256)(otp) !== row.value)
        return { ok: false, status: 400, message: "Code invalide" };
    const user = await repo.findUserByEmail(email);
    if (!user)
        return { ok: false, status: 400, message: "Code invalide" };
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await repo.upsertMobileAccount(user.id, email, passwordHash);
    await repo.revokeAllMobileRefreshTokensForUser(user.id);
    await repo.deleteVerificationByIdentifier(identifier);
    return { ok: true };
}
// ---- User/profile ----
async function getMe(userId) {
    const user = await repo.findUserById(userId);
    if (!user)
        return { ok: false, status: 404, message: "Utilisateur introuvable" };
    return {
        ok: true,
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
async function updateMeFull(userId, data) {
    const user = await repo.findUserById(userId);
    if (!user)
        return { ok: false, status: 404, message: "Utilisateur introuvable" };
    await repo.updateUserFull(userId, data);
    return await getMe(userId);
}
async function updateMePartial(userId, data) {
    const user = await repo.findUserById(userId);
    if (!user)
        return { ok: false, status: 404, message: "Utilisateur introuvable" };
    await repo.updateUserPartial(userId, data);
    return await getMe(userId);
}
async function changePassword(userId, payload) {
    const user = await repo.findUserById(userId);
    if (!user)
        return { ok: false, status: 404, message: "Utilisateur introuvable" };
    const acc = await repo.findMobileAccount(userId);
    if (!acc?.password) {
        return {
            ok: false,
            status: 400,
            message: "Aucun mot de passe mobile n'est configuré pour ce compte.",
        };
    }
    const ok = await bcrypt.compare(payload.oldPassword, acc.password);
    if (!ok)
        return { ok: false, status: 401, message: "Ancien mot de passe incorrect" };
    const newHash = await bcrypt.hash(payload.newPassword, 12);
    await repo.upsertMobileAccount(userId, user.email, newHash);
    await repo.revokeAllMobileRefreshTokensForUser(userId);
    return { ok: true };
}
