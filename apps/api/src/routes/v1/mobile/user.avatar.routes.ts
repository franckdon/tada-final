// apps/api/src/routes/v1/mobile/user.avatar.routes.ts
import { Hono } from "hono";
import { ZodError } from "zod";

import { requireMobileAuth } from "../../../middleware/requireMobileAuth";
import { formatZodIssuesFr, jsonError } from "./mobile.errors";
import { uploadUserAvatar } from "../../../lib/storage/avatar.service";
import { getUserImage, updateUserImage } from "./user.avatar.repo";

export const mobileUserAvatarRoutes = new Hono();

mobileUserAvatarRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json(
      { error: "Données invalides", details: formatZodIssuesFr(err) },
      400,
    );
  }
  console.error("[MOBILE USER AVATAR ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

function pickFirstFile(v: unknown): File | null {
  // Hono parseBody => string | File | (string|File)[]
  if (v instanceof File) return v;
  if (Array.isArray(v)) {
    const f = v.find((x) => x instanceof File);
    return (f as File | undefined) ?? null;
  }
  return null;
}

function validateAvatarFile(file: File) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  const maxBytes = 5 * 1024 * 1024; // 5MB

  if (!allowed.includes(file.type)) {
    return { ok: false as const, message: "Format invalide. Formats autorisés: jpg, png, webp" };
  }
  if (file.size <= 0) {
    return { ok: false as const, message: "Fichier invalide" };
  }
  if (file.size > maxBytes) {
    return { ok: false as const, message: "Image trop volumineuse (max 5 Mo)" };
  }

  return { ok: true as const };
}

/**
 * POST /me/avatar
 * PUT  /me/avatar
 * multipart/form-data:
 *  - file: image (jpg/png/webp)
 */
async function avatarHandler(c: any) {
  const userId = c.get("userId") as string;

  // parse multipart/form-data
  const body = await c.req.parseBody();
  const file = pickFirstFile(body["file"]);

  if (!file) {
    return jsonError(c, 400, "Fichier manquant. Utilisez form-data avec la clé 'file'");
  }

  const v = validateAvatarFile(file);
  if (!v.ok) return jsonError(c, 400, v.message);

  const up = await uploadUserAvatar({ userId, file });
  if (!up.ok) return jsonError(c, up.status, up.message);

  const updated = await updateUserImage(userId, up.publicUrl);
  if (!updated) return jsonError(c, 404, "Utilisateur introuvable");

  return c.json({
    ok: true,
    image: updated.image,
    user: { id: updated.id, email: updated.email, name: updated.name },
  });
}

mobileUserAvatarRoutes.post("/me/avatar", requireMobileAuth, avatarHandler);
mobileUserAvatarRoutes.put("/me/avatar", requireMobileAuth, avatarHandler);

/**
 * GET /me/avatar
 * -> redirige vers l'URL publique enregistrée en DB
 */
mobileUserAvatarRoutes.get("/me/avatar", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;
  const image = await getUserImage(userId);

  if (!image) return jsonError(c, 404, "Aucune photo de profil");

  // Redirection simple vers le storage (évite proxy streaming)
  return c.redirect(image, 302);
});

/**
 * DELETE /me/avatar
 * -> supprime la référence DB (et laisse le fichier dans le bucket)
 */
mobileUserAvatarRoutes.delete("/me/avatar", requireMobileAuth, async (c) => {
  const userId = c.get("userId") as string;

  const updated = await updateUserImage(userId, null);
  if (!updated) return jsonError(c, 404, "Utilisateur introuvable");

  return c.json({ ok: true });
});
