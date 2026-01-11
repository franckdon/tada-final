// apps/api/src/routes/mobile/mobile.errors.ts
import type { Context } from "hono";
import { ZodError } from "zod";

export function jsonError(c: Context, status: number, message: string, code?: string) {
  return c.json({ error: message, code }, status);
}

export function formatZodIssuesFr(err: ZodError) {
  return err.issues.map((i) => {
    const path = i.path.length ? i.path.join(".") : "body";

    if (i.code === "invalid_type") return `${path} : champ requis ou type invalide`;
    if (i.code === "invalid_string" && (i as any).validation === "email") return `${path} : email invalide`;
    if (i.code === "too_small") return `${path} : valeur trop courte`;
    if (i.code === "too_big") return `${path} : valeur trop longue`;

    return `${path} : ${i.message}`;
  });
}

export async function safeJson(c: Context) {
  try {
    return await c.req.json();
  } catch {
    return {};
  }
}
