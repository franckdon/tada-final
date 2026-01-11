// apps/api/src/routes/v1/mobile/index.ts
import { Hono } from "hono";
import { mobileAuthRoutes } from "./auth.routes";
import { mobileUserRoutes } from "./user.routes";

export const mobileRoutes = new Hono();

// Debug (temporaire) : si l'un est undefined, tu le verras immédiatement
if (!mobileAuthRoutes) {
  throw new Error("[mobileRoutes] mobileAuthRoutes est undefined. Vérifie import/export de auth.routes.ts");
}
if (!mobileUserRoutes) {
  throw new Error("[mobileRoutes] mobileUserRoutes est undefined. Vérifie import/export de user.routes.ts");
}

mobileRoutes.route("/auth", mobileAuthRoutes);
mobileRoutes.route("/user", mobileUserRoutes);
