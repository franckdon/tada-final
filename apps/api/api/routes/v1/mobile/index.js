"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mobileRoutes = void 0;
// apps/api/src/routes/v1/mobile/index.ts
const hono_1 = require("hono");
const auth_routes_1 = require("./auth.routes");
const user_routes_1 = require("./user.routes");
exports.mobileRoutes = new hono_1.Hono();
// Debug (temporaire) : si l'un est undefined, tu le verras immédiatement
if (!auth_routes_1.mobileAuthRoutes) {
    throw new Error("[mobileRoutes] mobileAuthRoutes est undefined. Vérifie import/export de auth.routes.ts");
}
if (!user_routes_1.mobileUserRoutes) {
    throw new Error("[mobileRoutes] mobileUserRoutes est undefined. Vérifie import/export de user.routes.ts");
}
exports.mobileRoutes.route("/auth", auth_routes_1.mobileAuthRoutes);
exports.mobileRoutes.route("/user", user_routes_1.mobileUserRoutes);
