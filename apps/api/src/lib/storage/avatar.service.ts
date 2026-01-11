import * as crypto from "node:crypto";
import { env } from "../../env";
import { supabaseAdmin } from "./supabase";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function extFromMime(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

export type UploadAvatarResult =
  | { ok: true; path: string; publicUrl: string }
  | { ok: false; status: number; message: string };

export async function uploadUserAvatar(params: {
  userId: string;
  file: File;
}): Promise<UploadAvatarResult> {
  const { userId, file } = params;

  if (!file) return { ok: false, status: 400, message: "Fichier manquant (champ 'file')" };

  if (!ALLOWED_MIME.has(file.type)) {
    return {
      ok: false,
      status: 400,
      message: "Format invalide. Formats acceptés: JPG, PNG, WEBP",
    };
  }

  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      status: 400,
      message: "Fichier trop volumineux (max 5MB)",
    };
  }

  const bucket = env.SUPABASE_STORAGE_BUCKET ?? "avatars";
  const ext = extFromMime(file.type);
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `${userId}/${filename}`;

  const supabase = supabaseAdmin();

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: "3600",
  });

  if (error) {
    return {
      ok: false,
      status: 500,
      message: "Erreur lors de l'upload vers Supabase Storage",
    };
  }

  // URL publique (bucket public)
  const base = env.SUPABASE_PUBLIC_BASE ?? `${env.SUPABASE_URL}/storage/v1/object/public`;
  const publicUrl = `${base}/${bucket}/${path}`;

  return { ok: true, path, publicUrl };
}
