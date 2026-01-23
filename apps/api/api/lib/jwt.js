"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
const env_1 = require("../env");
const secret = new TextEncoder().encode(env_1.env.MOBILE_JWT_SECRET);
async function jose() {
    // ESM-only package -> dynamic import works in CommonJS runtime
    return await import("jose");
}
async function signAccessToken(userId) {
    const { SignJWT } = await jose();
    const now = Math.floor(Date.now() / 1000);
    return new SignJWT({ typ: "access" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer("tada-api")
        .setAudience("tada-mobile")
        .setSubject(userId)
        .setIssuedAt(now)
        .setExpirationTime(now + env_1.env.MOBILE_ACCESS_TTL_SECONDS)
        .sign(secret);
}
async function verifyAccessToken(token) {
    const { jwtVerify } = await jose();
    const { payload } = await jwtVerify(token, secret, {
        issuer: "tada-api",
        audience: "tada-mobile",
    });
    if (payload.typ !== "access")
        throw new Error("Invalid token type");
    if (!payload.sub)
        throw new Error("Missing sub");
    return payload.sub;
}
