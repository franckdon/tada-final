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
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.isUserEmailVerified = isUserEmailVerified;
exports.createUser = createUser;
exports.setUserVerified = setUserVerified;
exports.updateUserFull = updateUserFull;
exports.updateUserPartial = updateUserPartial;
exports.findMobileAccount = findMobileAccount;
exports.upsertMobileAccount = upsertMobileAccount;
exports.createRefreshSession = createRefreshSession;
exports.readSessionByToken = readSessionByToken;
exports.revokeRefreshToken = revokeRefreshToken;
exports.revokeAllMobileRefreshTokensForUser = revokeAllMobileRefreshTokensForUser;
exports.deleteVerificationByIdentifier = deleteVerificationByIdentifier;
exports.readVerification = readVerification;
exports.createVerificationOtp = createVerificationOtp;
// apps/api/src/routes/mobile/mobile.repo.ts
const crypto = __importStar(require("node:crypto"));
const db_1 = require("../../../lib/db");
const env_1 = require("../../../env");
const crypto_1 = require("../../../lib/crypto");
const mobile_constants_1 = require("./mobile.constants");
async function findUserByEmail(email) {
    const r = await db_1.db.query(`select id, email, image, name from "user" where email = $1 limit 1`, [email]);
    return r.rows[0];
}
async function findUserById(userId) {
    const r = await db_1.db.query(`select
        id,
        email,
        name,
        image,
        "emailVerified",
        position,
        country,
        sector,
        job,
        location,
        sex,
        birth_date
     from "user"
     where id = $1
     limit 1`, [userId]);
    return r.rows[0];
}
async function isUserEmailVerified(userId) {
    const r = await db_1.db.query(`select "emailVerified" from "user" where id = $1 limit 1`, [userId]);
    return Boolean(r.rows[0]?.emailVerified);
}
async function createUser(params) {
    await db_1.db.query(`insert into "user" (id, name, email, role, "emailVerified", "createdAt", "updatedAt")
     values ($1, $2, $3, $4, false, now(), now())`, [params.id, params.name, params.email, params.role]);
}
async function setUserVerified(userId) {
    await db_1.db.query(`update "user" set "emailVerified" = true, "updatedAt" = now() where id = $1`, [userId]);
}
async function updateUserFull(userId, data) {
    await db_1.db.query(`update "user"
     set name = $2,
         position = $3,
         country = $4,
         sector = $5,
         job = $6,
         location = $7,
         image = $8,
         sex = $9,
         birth_date = $10,
         "updatedAt" = now()
     where id = $1`, [
        userId,
        data.name,
        data.position ?? null,
        data.country ?? null,
        data.sector ?? null,
        data.job ?? null,
        data.location ?? null,
        data.image ?? null,
        data.sex ?? null,
        data.birthDate ?? null,
    ]);
}
async function updateUserPartial(userId, data) {
    const fields = [];
    const values = [userId];
    let idx = 2;
    // Mapping API -> colonnes DB
    const map = {
        name: data.name,
        position: data.position,
        country: data.country,
        sector: data.sector,
        job: data.job,
        location: data.location,
        image: data.image,
        sex: data.sex,
        birth_date: data.birthDate,
    };
    for (const [column, value] of Object.entries(map)) {
        if (typeof value === "undefined")
            continue;
        fields.push(`${column} = $${idx}`);
        values.push(value);
        idx++;
    }
    fields.push(`"updatedAt" = now()`);
    await db_1.db.query(`update "user" set ${fields.join(", ")} where id = $1`, values);
}
async function findMobileAccount(userId) {
    const r = await db_1.db.query(`select id, "userId", "providerId", password
     from account
     where "userId" = $1 and "providerId" = $2
     limit 1`, [userId, mobile_constants_1.MOBILE_PROVIDER]);
    return r.rows[0];
}
async function upsertMobileAccount(userId, email, passwordHash) {
    const existing = await findMobileAccount(userId);
    if (existing) {
        await db_1.db.query(`update account set password = $1, "updatedAt" = now() where id = $2`, [
            passwordHash,
            existing.id,
        ]);
        return existing.id;
    }
    const id = crypto.randomUUID();
    await db_1.db.query(`insert into account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
     values ($1, $2, $3, $4, $5, now(), now())`, [id, email, mobile_constants_1.MOBILE_PROVIDER, userId, passwordHash]);
    return id;
}
async function createRefreshSession(userId, ipAddress, userAgent) {
    const id = crypto.randomUUID();
    const raw = mobile_constants_1.REFRESH_PREFIX + (0, crypto_1.randomToken)(48);
    const days = env_1.env.MOBILE_REFRESH_TTL_DAYS;
    await db_1.db.query(`insert into session
      (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId")
     values
      ($1, now() + ($2 || ' days')::interval, $3, now(), now(), $4, $5, $6)`, [id, String(days), raw, ipAddress, userAgent, userId]);
    return raw;
}
async function readSessionByToken(token) {
    const r = await db_1.db.query(`select id, "userId", "expiresAt" from session where token = $1 and token like $2 limit 1`, [token, `${mobile_constants_1.REFRESH_PREFIX}%`]);
    return r.rows[0];
}
async function revokeRefreshToken(token) {
    await db_1.db.query(`delete from session where token = $1 and token like $2`, [token, `${mobile_constants_1.REFRESH_PREFIX}%`]);
}
async function revokeAllMobileRefreshTokensForUser(userId) {
    await db_1.db.query(`delete from session where "userId" = $1 and token like $2`, [userId, `${mobile_constants_1.REFRESH_PREFIX}%`]);
}
async function deleteVerificationByIdentifier(identifier) {
    await db_1.db.query(`delete from verification where identifier = $1`, [identifier]);
}
async function readVerification(identifier) {
    const r = await db_1.db.query(`select id, value, "expiresAt" from verification where identifier = $1 limit 1`, [
        identifier,
    ]);
    return r.rows[0];
}
async function createVerificationOtp(identifier, otpHash, ttlMinutes) {
    const id = crypto.randomUUID();
    await deleteVerificationByIdentifier(identifier);
    await db_1.db.query(`insert into verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt")
     values ($1, $2, $3, now() + interval '${ttlMinutes} minutes', now(), now())`, [id, identifier, otpHash]);
    return id;
}
