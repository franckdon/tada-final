// apps/api/src/app.ts
import { openapi } from "./openapi";
import { swaggerUI } from "@hono/swagger-ui";

import { mobileAuthRoutes } from "./routes/v1/mobile/auth.routes";
import { mobileUserRoutes } from "./routes/v1/mobile/user.routes";

export const app = openapi; // si openapi est ton OpenAPIHono()

// Health
app.get("/health", (c) => c.json({ ok: true }));

// Routes API
app.route("/v1/mobile/auth", mobileAuthRoutes);
app.route("/v1/mobile/user", mobileUserRoutes);

// Swagger UI
app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.json",
  }),
);

// JSON OpenAPI
app.doc("/openapi.json", {
  openapi: "3.0.3",
  info: {
    title: "Tada Mobile API",
    version: "1.0.0",
  },
});

export default app;
