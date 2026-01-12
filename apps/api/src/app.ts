// apps/api/src/app.ts
import { openapi } from "./openapi";
import { swaggerUI } from "@hono/swagger-ui";

import { mobileAuthRoutes } from "./routes/v1/mobile/auth.routes";
import { mobileUserRoutes } from "./routes/v1/mobile/user.routes";

import { sendMail } from "./lib/mailer/sendMail";

export const app = openapi;

// Health
app.get("/health", (c) => c.json({ ok: true }));

// Debug mail route (Hono)
app.post("/debug/mail", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({} as any));
    const to = typeof body?.to === "string" ? body.to.trim() : "";

    if (!to) {
      return c.json({ ok: false, error: "Missing 'to' in JSON body" }, 400);
    }

    await sendMail({
      to,
      subject: "Test SMTP",
      html: "<p>Hello</p>",
    });

    return c.json({ ok: true });
  } catch (err: any) {
    console.error("[DEBUG MAIL] failed", {
      message: err?.message,
      code: err?.code,
      response: err?.response,
    });

    return c.json(
      {
        ok: false,
        error: err?.message ?? "Mail send failed",
        code: err?.code,
        response: err?.response,
      },
      500,
    );
  }
});

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
