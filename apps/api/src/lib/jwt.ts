import { SignJWT, jwtVerify } from "jose";
import { env } from "../env";

const secret = new TextEncoder().encode(env.MOBILE_JWT_SECRET);

export async function signAccessToken(userId: string) {
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
  const { payload } = await jwtVerify(token, secret, {
    issuer: "tada-api",
    audience: "tada-mobile",
  });

  if (payload.typ !== "access") throw new Error("Invalid token type");
  if (!payload.sub) throw new Error("Missing sub");

  return payload.sub;
}
