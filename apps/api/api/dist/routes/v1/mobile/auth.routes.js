"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.mobileAuthRoutes = void 0;
// apps/api/src/routes/v1/mobile/auth.routes.ts
const hono_1 = require("hono");
const zod_1 = require("zod");
const mobile_errors_1 = require("./mobile.errors");
const mobile_schemas_1 = require("./mobile.schemas");
const service = __importStar(require("./mobile.service"));
exports.mobileAuthRoutes = new hono_1.Hono();
exports.mobileAuthRoutes.onError((err, c) => {
    if (err instanceof zod_1.ZodError) {
        return c.json({ error: "Données invalides", details: (0, mobile_errors_1.formatZodIssuesFr)(err) }, 400);
    }
    console.error("[MOBILE AUTH ERROR]", err);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
});
exports.mobileAuthRoutes.get("/health", (c) => c.json({ ok: true }));
// POST /register
exports.mobileAuthRoutes.post("/register", async (c) => {
    const body = await (0, mobile_errors_1.safeJson)(c);
    const { name, email, password } = mobile_schemas_1.registerSchema.parse(body);
    const r = await service.register({ name, email, password });
    return c.json(r);
});
// POST /verify
exports.mobileAuthRoutes.post("/verify", async (c) => {
    const body = await (0, mobile_errors_1.safeJson)(c);
    const { email, otp } = mobile_schemas_1.verifySchema.parse(body);
    const ip = c.req.header("x-forwarded-for") ?? null;
    const ua = c.req.header("user-agent") ?? null;
    const r = await service.verifyEmail({ email, otp }, { ip, ua });
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
// POST /resend-otp
exports.mobileAuthRoutes.post("/resend-otp", async (c) => {
    const body = await (0, mobile_errors_1.safeJson)(c);
    const { email } = mobile_schemas_1.resendOtpSchema.parse(body);
    const r = await service.resendVerifyOtp({ email });
    return c.json(r);
});
// POST /login
exports.mobileAuthRoutes.post("/login", async (c) => {
    const body = await (0, mobile_errors_1.safeJson)(c);
    const { email, password } = mobile_schemas_1.loginSchema.parse(body);
    const ip = c.req.header("x-forwarded-for") ?? null;
    const ua = c.req.header("user-agent") ?? null;
    const r = await service.login({ email, password }, { ip, ua });
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
// POST /refresh
exports.mobileAuthRoutes.post("/refresh", async (c) => {
    const body = await (0, mobile_errors_1.safeJson)(c);
    const { refreshToken } = mobile_schemas_1.refreshSchema.parse(body);
    const ip = c.req.header("x-forwarded-for") ?? null;
    const ua = c.req.header("user-agent") ?? null;
    const r = await service.refresh({ refreshToken }, { ip, ua });
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
// POST /logout
exports.mobileAuthRoutes.post("/logout", async (c) => {
    const body = await (0, mobile_errors_1.safeJson)(c);
    const { refreshToken } = mobile_schemas_1.logoutSchema.parse(body);
    const r = await service.logout({ refreshToken });
    return c.json(r);
});
// POST /password/forgot
exports.mobileAuthRoutes.post("/password/forgot", async (c) => {
    const body = await (0, mobile_errors_1.safeJson)(c);
    const { email } = mobile_schemas_1.forgotPasswordSchema.parse(body);
    // Toujours ok (anti-enumeration géré dans service)
    const r = await service.forgotPassword({ email });
    return c.json(r);
});
// POST /password/reset
exports.mobileAuthRoutes.post("/password/reset", async (c) => {
    const body = await (0, mobile_errors_1.safeJson)(c);
    const { email, otp, newPassword } = mobile_schemas_1.resetPasswordSchema.parse(body);
    const r = await service.resetPassword({ email, otp, newPassword });
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r);
});
