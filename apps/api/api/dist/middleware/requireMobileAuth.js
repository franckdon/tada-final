"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireMobileAuth = requireMobileAuth;
const jwt_1 = require("../lib/jwt");
async function requireMobileAuth(c, next) {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer "))
        return c.json({ error: "Unauthorized" }, 401);
    try {
        const userId = await (0, jwt_1.verifyAccessToken)(auth.slice(7));
        c.set("userId", userId);
        await next();
    }
    catch {
        return c.json({ error: "Unauthorized" }, 401);
    }
}
