"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mobileUserAvatarRoutes = void 0;
// apps/api/src/routes/v1/mobile/user.avatar.routes.ts
const hono_1 = require("hono");
const zod_1 = require("zod");
const requireMobileAuth_1 = require("../../../middleware/requireMobileAuth");
const mobile_errors_1 = require("./mobile.errors");
const avatar_service_1 = require("../../../lib/storage/avatar.service");
const user_avatar_repo_1 = require("./user.avatar.repo");
exports.mobileUserAvatarRoutes = new hono_1.Hono();
exports.mobileUserAvatarRoutes.onError((err, c) => {
    if (err instanceof zod_1.ZodError) {
        return c.json({ error: "Données invalides", details: (0, mobile_errors_1.formatZodIssuesFr)(err) }, 400);
    }
    console.error("[MOBILE USER AVATAR ERROR]", err);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
});
function pickFirstFile(v) {
    // Hono parseBody => string | File | (string|File)[]
    if (v instanceof File)
        return v;
    if (Array.isArray(v)) {
        const f = v.find((x) => x instanceof File);
        return f ?? null;
    }
    return null;
}
function validateAvatarFile(file) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (!allowed.includes(file.type)) {
        return { ok: false, message: "Format invalide. Formats autorisés: jpg, png, webp" };
    }
    if (file.size <= 0) {
        return { ok: false, message: "Fichier invalide" };
    }
    if (file.size > maxBytes) {
        return { ok: false, message: "Image trop volumineuse (max 5 Mo)" };
    }
    return { ok: true };
}
/**
 * POST /me/avatar
 * PUT  /me/avatar
 * multipart/form-data:
 *  - file: image (jpg/png/webp)
 */
async function avatarHandler(c) {
    const userId = c.get("userId");
    // parse multipart/form-data
    const body = await c.req.parseBody();
    const file = pickFirstFile(body["file"]);
    if (!file) {
        return (0, mobile_errors_1.jsonError)(c, 400, "Fichier manquant. Utilisez form-data avec la clé 'file'");
    }
    const v = validateAvatarFile(file);
    if (!v.ok)
        return (0, mobile_errors_1.jsonError)(c, 400, v.message);
    const up = await (0, avatar_service_1.uploadUserAvatar)({ userId, file });
    if (!up.ok) {
        return (0, mobile_errors_1.jsonError)(c, up.status, up.message);
    }
    const updated = await (0, user_avatar_repo_1.updateUserImage)(userId, up.publicUrl);
    if (!updated)
        return (0, mobile_errors_1.jsonError)(c, 404, "Utilisateur introuvable");
    return c.json({
        ok: true,
        image: updated.image,
        user: { id: updated.id, email: updated.email, name: updated.name },
    });
}
exports.mobileUserAvatarRoutes.post("/me/avatar", requireMobileAuth_1.requireMobileAuth, avatarHandler);
exports.mobileUserAvatarRoutes.put("/me/avatar", requireMobileAuth_1.requireMobileAuth, avatarHandler);
/**
 * GET /me/avatar
 * -> redirige vers l'URL publique enregistrée en DB
 */
exports.mobileUserAvatarRoutes.get("/me/avatar", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const image = await (0, user_avatar_repo_1.getUserImage)(userId);
    if (!image)
        return (0, mobile_errors_1.jsonError)(c, 404, "Aucune photo de profil");
    // Redirection simple vers le storage (évite proxy streaming)
    return c.redirect(image, 302);
});
/**
 * DELETE /me/avatar
 * -> supprime la référence DB (et laisse le fichier dans le bucket)
 */
exports.mobileUserAvatarRoutes.delete("/me/avatar", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const updated = await (0, user_avatar_repo_1.updateUserImage)(userId, null);
    if (!updated)
        return (0, mobile_errors_1.jsonError)(c, 404, "Utilisateur introuvable");
    return c.json({ ok: true });
});
