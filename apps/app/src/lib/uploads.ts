import crypto from "crypto";
import { supabaseAdmin } from "./supabase-server";

export type UploadCategory =
  | "workspaceLogo"
  | "userAvatar"
  | "organizationLogo"
  | "surveyImage";

type UploadCfg = { bucket: string; folder: string };

export const UPLOAD_CONFIG: Record<UploadCategory, UploadCfg> = {
  workspaceLogo: { bucket: "tada", folder: "workspace-logos" },
  userAvatar: { bucket: "tada", folder: "user-avatars" },
  organizationLogo: { bucket: "tada", folder: "organization-logos" },
  surveyImage: { bucket: "tada", folder: "surveys" },
};

function isHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

/**
 * Centralise la construction d'URL publique à partir d'un path stocké en DB.
 * - Si `pathOrUrl` est déjà une URL, on la renvoie (compat legacy).
 * - Sinon on génère l'URL publique via supabase storage:
 *   `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/<bucket>/<path>`
 *
 * À utiliser côté CLIENT (recommandé) ou côté serveur.
 */
export function getPublicUrlForPath(options: {
  category: UploadCategory;
  pathOrUrl?: string | null;
  supabaseUrl?: string; // optionnel: override pour tests
}) {
  const { category, pathOrUrl, supabaseUrl } = options;

  if (!pathOrUrl) return null;
  if (isHttpUrl(pathOrUrl)) return pathOrUrl;

  const config = UPLOAD_CONFIG[category];
  const base =
    supabaseUrl ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL;

  if (!base) {
    // On préfère retourner null plutôt que casser le rendu
    return null;
  }

  // pathOrUrl = "workspace-logos/xxx.png" (déjà avec folder)
  return `${base}/storage/v1/object/public/${config.bucket}/${pathOrUrl}`;
}

/**
 * Upload et retourne (bucket, path, publicUrl)
 * -> toi tu peux stocker `path` en DB (recommandé)
 */
export async function uploadFileToSupabase(options: {
  file: File;
  category: UploadCategory;
  baseName?: string;
}) {
  const { file, category, baseName } = options;

  const config = UPLOAD_CONFIG[category];

  const ext =
    file.name.split(".").pop()?.toLowerCase() ||
    file.type.split("/").pop() ||
    "bin";

  const random = crypto.randomUUID();
  const safeBase = (baseName || "file")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .slice(0, 50);

  const path = `${config.folder}/${safeBase}-${Date.now()}-${random}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabaseAdmin.storage
    .from(config.bucket)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    console.error("[SUPABASE_UPLOAD_ERROR]", error);
    throw error;
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(config.bucket)
    .getPublicUrl(data.path);

  return {
    bucket: config.bucket,
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}

export async function deleteFromSupabase(options: {
  category: UploadCategory;
  path: string;
}) {
  const { category, path } = options;
  const config = UPLOAD_CONFIG[category];

  const { error } = await supabaseAdmin.storage.from(config.bucket).remove([path]);

  if (error) {
    console.error("[SUPABASE_DELETE_ERROR]", error);
    throw error;
  }
}
