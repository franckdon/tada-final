// apps/api/src/dev.ts
import { serve } from "@hono/node-server";
import app from "./app";
import { env } from "./env";

const port = Number(env.API_PORT ?? 4000);

console.log(`[API] Listening on http://localhost:${port}`);
serve({
  fetch: app.fetch,
  port,
});
