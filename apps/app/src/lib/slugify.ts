// src/lib/slugify.ts

/**
 * Transforme une chaîne en slug URL-safe.
 * - enlève les accents
 * - remplace les espaces et caractères spéciaux par des tirets
 * - supprime les tirets en début/fin
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD") // enlève les accents
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
