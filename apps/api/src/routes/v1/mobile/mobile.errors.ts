// apps/api/src/routes/mobile/mobile.errors.ts
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";

export function jsonError(c: Context, status: ContentfulStatusCode, message: string, code?: string) {
  const payload: { error: string; code?: string } = { error: message };
  if (code) payload.code = code;
  return c.json(payload, status);
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

export async function safeJson(c: Context): Promise<Record<string, unknown>> {
  try {
    return (await c.req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}
