"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// apps/api/src/app.ts
const openapi_1 = require("./openapi");
const swagger_ui_1 = require("@hono/swagger-ui");
const auth_routes_1 = require("./routes/v1/mobile/auth.routes");
const user_routes_1 = require("./routes/v1/mobile/user.routes");
const sendMail_1 = require("./lib/mailer/sendMail");
exports.app = openapi_1.openapi;
// Health
exports.app.get("/health", (c) => c.json({ ok: true }));
// Debug mail route (Hono)
exports.app.post("/debug/mail", async (c) => {
    try {
        const body = await c.req.json().catch(() => ({}));
        const to = typeof body?.to === "string" ? body.to.trim() : "";
        if (!to) {
            return c.json({ ok: false, error: "Missing 'to' in JSON body" }, 400);
        }
        await (0, sendMail_1.sendMail)({
            to,
            subject: "Test SMTP",
            html: "<p>Hello</p>",
        });
        return c.json({ ok: true });
    }
    catch (err) {
        console.error("[DEBUG MAIL] failed", {
            message: err?.message,
            code: err?.code,
            response: err?.response,
        });
        return c.json({
            ok: false,
            error: err?.message ?? "Mail send failed",
            code: err?.code,
            response: err?.response,
        }, 500);
    }
});
// Routes API
exports.app.route("/v1/mobile/auth", auth_routes_1.mobileAuthRoutes);
exports.app.route("/v1/mobile/user", user_routes_1.mobileUserRoutes);
// Swagger UI
exports.app.get("/docs", (0, swagger_ui_1.swaggerUI)({
    url: "/openapi.json",
}));
// JSON OpenAPI
exports.app.doc("/openapi.json", {
    openapi: "3.0.3",
    info: {
        title: "Tada Mobile API",
        version: "1.0.0",
    },
});
exports.default = exports.app;
