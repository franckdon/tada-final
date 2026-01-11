"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// apps/api/src/app.ts
const openapi_1 = require("./openapi");
const swagger_ui_1 = require("@hono/swagger-ui");
const auth_routes_1 = require("./routes/v1/mobile/auth.routes");
const user_routes_1 = require("./routes/v1/mobile/user.routes");
exports.app = openapi_1.openapi; // si openapi est ton OpenAPIHono()
// Health
exports.app.get("/health", (c) => c.json({ ok: true }));
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
