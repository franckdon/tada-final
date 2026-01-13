// apps/api/src/app.ts
import { openapi } from "./openapi";
import { swaggerUI } from "@hono/swagger-ui";

import { mobileAuthRoutes } from "./routes/v1/mobile/auth.routes";
import { mobileUserRoutes } from "./routes/v1/mobile/user.routes";

import { sendMail } from "./lib/mailer/sendMail";
import { mobileMissionsRoutes } from "./routes/v1/mobile/missions.routes";
import { mobileMissionDetailsRoutes } from "./routes/v1/mobile/missions.details.routes";
import { mobileSurveysRoutes } from "./routes/v1/mobile/surveys/surveys.routes";
import { mobileMissionSurveysRoutes } from "./routes/v1/mobile/missions.surveys.routes";
import { mobileSurveyResponsesRoutes } from "./routes/v1/mobile/surveys/responses.routes";
import { mobileSupportRoutes } from "./routes/v1/mobile/support/support.routes";
import { mobileAccountRoutes } from "./routes/v1/mobile/account/account.routes";
import { mobilePayoutAccountsRoutes } from "./routes/v1/mobile/payout-accounts/payout-accounts.routes";

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
app.route("/v1/mobile/missions", mobileMissionsRoutes);
app.route("/v1/mobile/missions", mobileMissionDetailsRoutes);
app.route("/v1/mobile/surveys", mobileSurveysRoutes);
app.route("/v1/mobile/missions", mobileMissionSurveysRoutes);
app.route("/v1/mobile/surveys", mobileSurveyResponsesRoutes);

//new routes
app.route("/v1/mobile/support", mobileSupportRoutes);
app.route("/v1/mobile/account", mobileAccountRoutes);
app.route("/v1/mobile/payout-accounts", mobilePayoutAccountsRoutes);

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
