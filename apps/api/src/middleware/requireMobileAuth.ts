import type { Context, Next } from "hono";
import { verifyAccessToken } from "../lib/jwt";

export async function requireMobileAuth(c: Context, next: Next) {
  const auth = c.req.header("authorization");
  if (!auth?.startsWith("Bearer ")) return c.json({ error: "Unauthorized" }, 401);

  try {
    const userId = await verifyAccessToken(auth.slice(7));
    c.set("userId", userId);
    await next();
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
}
