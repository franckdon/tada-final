// apps/api/src/routes/v1/mobile/auth.routes.ts
import { Hono } from "hono";
import { ZodError } from "zod";

import { formatZodIssuesFr, jsonError, safeJson } from "./mobile.errors";
import {
  registerSchema,
  verifySchema,
  resendOtpSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./mobile.schemas";

import * as service from "./mobile.service";

export const mobileAuthRoutes = new Hono();

mobileAuthRoutes.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ error: "Données invalides", details: formatZodIssuesFr(err) }, 400);
  }
  console.error("[MOBILE AUTH ERROR]", err);
  return c.json({ error: "Une erreur interne est survenue" }, 500);
});

mobileAuthRoutes.get("/health", (c) => c.json({ ok: true }));

// POST /register
mobileAuthRoutes.post("/register", async (c) => {
  const body = await safeJson(c);
  const { name, email, password } = registerSchema.parse(body);

  const r = await service.register({ name, email, password });
  return c.json(r);
});

// POST /verify
mobileAuthRoutes.post("/verify", async (c) => {
  const body = await safeJson(c);
  const { email, otp } = verifySchema.parse(body);

  const ip = c.req.header("x-forwarded-for") ?? null;
  const ua = c.req.header("user-agent") ?? null;

  const r = await service.verifyEmail({ email, otp }, { ip, ua });
  if (!r.ok) return jsonError(c, r.status, r.message);
  return c.json(r.data);
});

// POST /resend-otp
mobileAuthRoutes.post("/resend-otp", async (c) => {
  const body = await safeJson(c);
  const { email } = resendOtpSchema.parse(body);

  const r = await service.resendVerifyOtp({ email });
  return c.json(r);
});

// POST /login
mobileAuthRoutes.post("/login", async (c) => {
  const body = await safeJson(c);
  const { email, password } = loginSchema.parse(body);

  const ip = c.req.header("x-forwarded-for") ?? null;
  const ua = c.req.header("user-agent") ?? null;

  const r = await service.login({ email, password }, { ip, ua });
  if (!r.ok) return jsonError(c, r.status, r.message);
  return c.json(r.data);
});

// POST /refresh
mobileAuthRoutes.post("/refresh", async (c) => {
  const body = await safeJson(c);
  const { refreshToken } = refreshSchema.parse(body);

  const ip = c.req.header("x-forwarded-for") ?? null;
  const ua = c.req.header("user-agent") ?? null;

  const r = await service.refresh({ refreshToken }, { ip, ua });
  if (!r.ok) return jsonError(c, r.status, r.message);
  return c.json(r.data);
});

// POST /logout
mobileAuthRoutes.post("/logout", async (c) => {
  const body = await safeJson(c);
  const { refreshToken } = logoutSchema.parse(body);

  const r = await service.logout({ refreshToken });
  return c.json(r);
});

// POST /password/forgot
mobileAuthRoutes.post("/password/forgot", async (c) => {
  const body = await safeJson(c);
  const { email } = forgotPasswordSchema.parse(body);

  // Toujours ok (anti-enumeration géré dans service)
  const r = await service.forgotPassword({ email });
  return c.json(r);
});

// POST /password/reset
mobileAuthRoutes.post("/password/reset", async (c) => {
  const body = await safeJson(c);
  const { email, otp, newPassword } = resetPasswordSchema.parse(body);

  const r = await service.resetPassword({ email, otp, newPassword });
  if (!r.ok) return jsonError(c, r.status, r.message);
  return c.json(r);
});
