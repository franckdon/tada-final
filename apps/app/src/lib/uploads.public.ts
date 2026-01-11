import { UPLOAD_CONFIG, isHttpUrl, type UploadCategory } from "./uploads.config";

/**
 * Construit une URL publique à partir d'un path stocké en DB.
 * Compat: si on reçoit déjà une URL (legacy), on la renvoie.
 */
export function getPublicUrlForPath(options: {
  category: UploadCategory;
  pathOrUrl?: string | null;
}) {
  const { category, pathOrUrl } = options;

  if (!pathOrUrl) return null;
  if (isHttpUrl(pathOrUrl)) return pathOrUrl;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  const { bucket } = UPLOAD_CONFIG[category];

  // pathOrUrl contient déjà le folder: "workspace-logos/....png"
  return `${base}/storage/v1/object/public/${bucket}/${pathOrUrl}`;
}
