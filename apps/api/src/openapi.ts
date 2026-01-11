import { OpenAPIHono } from "@hono/zod-openapi";

export const openapi = new OpenAPIHono({
  openapi: "3.0.3",
  info: {
    title: "Tada Mobile API",
    version: "1.0.0",
    description: "API Mobile (Auth, Missions, Surveys)",
  },
});
