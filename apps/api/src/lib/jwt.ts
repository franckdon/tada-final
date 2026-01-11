import { env } from "../env";

const secret = new TextEncoder().encode(env.MOBILE_JWT_SECRET);

type JoseModule = typeof import("jose");

async function jose(): Promise<JoseModule> {
  // ESM-only package -> dynamic import works in CommonJS runtime
  return await import("jose");
}

export async function signAccessToken(userId: string) {
  const { SignJWT } = await jose();

  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ typ: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("tada-api")
    .setAudience("tada-mobile")
    .setSubject(userId)
    .setIssuedAt(now)
    .setExpirationTime(now + env.MOBILE_ACCESS_TTL_SECONDS)
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  const { jwtVerify } = await jose();

  const { payload } = await jwtVerify(token, secret, {
    issuer: "tada-api",
    audience: "tada-mobile",
  });

  if (payload.typ !== "access") throw new Error("Invalid token type");
  if (!payload.sub) throw new Error("Missing sub");

  return payload.sub;
}
