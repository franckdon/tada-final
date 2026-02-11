import type { MiddlewareHandler } from "hono";
import { env } from "../env"; // adapte ton import

export const requireServerKey: MiddlewareHandler = async (c, next) => {
  const key = c.req.header("x-server-key");
  if (!key || key !== env.SERVER_KEY) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
};
