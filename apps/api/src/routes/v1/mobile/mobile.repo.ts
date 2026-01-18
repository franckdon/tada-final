// apps/api/src/routes/mobile/mobile.repo.ts
import * as crypto from "node:crypto";
import { db } from "../../../lib/db";
import { env } from "../../../env";
import { randomToken } from "../../../lib/crypto";
import { MOBILE_PROVIDER, REFRESH_PREFIX } from "./mobile.constants";

export type UserSex = "male" | "female" | "other" | "prefer_not_to_say";

export type DbUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;

  emailVerified: boolean;

  position: string | null;
  country: string | null;
  sector: string | null;
  job: string | null;
  location: string | null;

  // NEW
  sex: UserSex | null;
  // DB = date -> pg renvoie généralement "YYYY-MM-DD" en string via node-postgres
  birth_date: string | null;
};

export type DbAccount = { id: string; userId: string; providerId: string; password: string | null };
export type DbSession = { id: string; userId: string; expiresAt: Date };
export type DbVerification = { id: string; value: string; expiresAt: Date };

export async function findUserByEmail(
  email: string,
): Promise<Pick<DbUser, "id" | "email" | "name" | "image"> | undefined> {
  const r = await db.query(`select id, email, image, name from "user" where email = $1 limit 1`, [email]);
  return r.rows[0] as Pick<DbUser, "id" | "email" | "name" | "image"> | undefined;
}

export async function findUserById(userId: string): Promise<DbUser | undefined> {
  const r = await db.query(
    `select
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
     limit 1`,
    [userId],
  );
  return r.rows[0] as DbUser | undefined;
}

export async function isUserEmailVerified(userId: string): Promise<boolean> {
  const r = await db.query(`select "emailVerified" from "user" where id = $1 limit 1`, [userId]);
  return Boolean((r.rows[0] as { emailVerified?: boolean } | undefined)?.emailVerified);
}

export async function createUser(params: { id: string; name: string; email: string; role: string }) {
  await db.query(
    `insert into "user" (id, name, email, role, "emailVerified", "createdAt", "updatedAt")
     values ($1, $2, $3, $4, false, now(), now())`,
    [params.id, params.name, params.email, params.role],
  );
}

export async function setUserVerified(userId: string) {
  await db.query(`update "user" set "emailVerified" = true, "updatedAt" = now() where id = $1`, [userId]);
}

export async function updateUserFull(
  userId: string,
  data: {
    name: string;
    position?: string | null;
    country?: string | null;
    sector?: string | null;
    job?: string | null;
    location?: string | null;
    image?: string | null;

    // NEW (API)
    sex?: UserSex | null;
    birthDate?: string | null; // "YYYY-MM-DD"
  },
) {
  await db.query(
    `update "user"
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
     where id = $1`,
    [
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
    ],
  );
}

export async function updateUserPartial(
  userId: string,
  data: Partial<{
    name: string;
    position: string | null;
    country: string | null;
    sector: string | null;
    job: string | null;
    location: string | null;
    image: string | null;

    // NEW (API)
    sex: UserSex | null;
    birthDate: string | null; // "YYYY-MM-DD"
  }>,
) {
  const fields: string[] = [];
  const values: any[] = [userId];
  let idx = 2;

  // Mapping API -> colonnes DB
  const map: Record<string, unknown> = {
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
    if (typeof value === "undefined") continue;
    fields.push(`${column} = $${idx}`);
    values.push(value);
    idx++;
  }

  fields.push(`"updatedAt" = now()`);

  await db.query(`update "user" set ${fields.join(", ")} where id = $1`, values);
}

export async function findMobileAccount(userId: string): Promise<DbAccount | undefined> {
  const r = await db.query(
    `select id, "userId", "providerId", password
     from account
     where "userId" = $1 and "providerId" = $2
     limit 1`,
    [userId, MOBILE_PROVIDER],
  );
  return r.rows[0] as DbAccount | undefined;
}

export async function upsertMobileAccount(userId: string, email: string, passwordHash: string) {
  const existing = await findMobileAccount(userId);

  if (existing) {
    await db.query(`update account set password = $1, "updatedAt" = now() where id = $2`, [
      passwordHash,
      existing.id,
    ]);
    return existing.id;
  }

  const id = crypto.randomUUID();
  await db.query(
    `insert into account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
     values ($1, $2, $3, $4, $5, now(), now())`,
    [id, email, MOBILE_PROVIDER, userId, passwordHash],
  );

  return id;
}

export async function createRefreshSession(userId: string, ipAddress: string | null, userAgent: string | null) {
  const id = crypto.randomUUID();
  const raw = REFRESH_PREFIX + randomToken(48);
  const days = env.MOBILE_REFRESH_TTL_DAYS;

  await db.query(
    `insert into session
      (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId")
     values
      ($1, now() + ($2 || ' days')::interval, $3, now(), now(), $4, $5, $6)`,
    [id, String(days), raw, ipAddress, userAgent, userId],
  );

  return raw;
}

export async function readSessionByToken(token: string): Promise<DbSession | undefined> {
  const r = await db.query(
    `select id, "userId", "expiresAt" from session where token = $1 and token like $2 limit 1`,
    [token, `${REFRESH_PREFIX}%`],
  );
  return r.rows[0] as DbSession | undefined;
}

export async function revokeRefreshToken(token: string) {
  await db.query(`delete from session where token = $1 and token like $2`, [token, `${REFRESH_PREFIX}%`]);
}

export async function revokeAllMobileRefreshTokensForUser(userId: string) {
  await db.query(`delete from session where "userId" = $1 and token like $2`, [userId, `${REFRESH_PREFIX}%`]);
}

export async function deleteVerificationByIdentifier(identifier: string) {
  await db.query(`delete from verification where identifier = $1`, [identifier]);
}

export async function readVerification(identifier: string): Promise<DbVerification | undefined> {
  const r = await db.query(`select id, value, "expiresAt" from verification where identifier = $1 limit 1`, [
    identifier,
  ]);
  return r.rows[0] as DbVerification | undefined;
}

export async function createVerificationOtp(identifier: string, otpHash: string, ttlMinutes: number) {
  const id = crypto.randomUUID();
  await deleteVerificationByIdentifier(identifier);

  await db.query(
    `insert into verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt")
     values ($1, $2, $3, now() + interval '${ttlMinutes} minutes', now(), now())`,
    [id, identifier, otpHash],
  );

  return id;
}
