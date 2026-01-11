// apps/api/src/openapi.ts
import { OpenAPIHono } from "@hono/zod-openapi";

export const openapi = new OpenAPIHono();

// JSON OpenAPI
openapi.doc("/openapi.json", {
  openapi: "3.0.3",
  info: {
    title: "Tada Mobile API",
    version: "1.0.0",
  },
});
