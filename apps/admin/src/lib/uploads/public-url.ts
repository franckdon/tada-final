export function isHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

/**
 * Transforme un `path` DB en URL publique Supabase.
 * - Si on reçoit déjà une URL => on renvoie tel quel (legacy).
 * - Si bucket non public => il faudra une signed URL (autre option).
 */
export function getPublicUrlFromPath(options: {
  bucket: string;
  pathOrUrl?: string | null;
}) {
  const { bucket, pathOrUrl } = options;

  if (!pathOrUrl) return null;
  if (isHttpUrl(pathOrUrl)) return pathOrUrl;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  return `${base}/storage/v1/object/public/${bucket}/${pathOrUrl}`;
}
