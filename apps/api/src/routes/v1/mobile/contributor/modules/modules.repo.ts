// apps/api/src/routes/v1/mobile/contributor/modules/modules.repo.ts
import { db } from "../../../../../lib/db";
import type { ModuleKey, ProfileModuleStatus } from "./modules.config";

// ---------- Progress ----------

export type ModuleProgressRow = {
  id: string;
  userId: string;
  moduleKey: string;
  moduleLabel: string | null;
  status: ProfileModuleStatus;
  completionPercent: number;
  answeredCount: number;
  totalCount: number;
  pointsAwarded: number;
  startedAt: string;
  completedAt: string | null;
  qualityAt: string | null;
  updatedAt: string;
};

export async function getModuleProgress(
  userId: string,
  moduleKey: ModuleKey,
): Promise<ModuleProgressRow | null> {
  const r = await db.query(
    `
    select
      id::text as id,
      user_id as "userId",
      module_key as "moduleKey",
      module_label as "moduleLabel",
      status::text as status,
      completion_percent as "completionPercent",
      answered_count as "answeredCount",
      total_count as "totalCount",
      points_awarded as "pointsAwarded",
      started_at::text as "startedAt",
      completed_at::text as "completedAt",
      quality_at::text as "qualityAt",
      updated_at::text as "updatedAt"
    from contributor_profile_module_progress
    where user_id = $1::text and module_key = $2::text
    limit 1
    `,
    [userId, moduleKey],
  );

  return (r.rows[0] as ModuleProgressRow | undefined) ?? null;
}

export async function upsertModuleProgress(params: {
  userId: string; // TEXT in DB (user_id)
  moduleKey: ModuleKey;
  moduleLabel?: string | null;
  status: ProfileModuleStatus;
  completionPercent: number;
  answeredCount: number;
  totalCount: number;
  completedAt?: string | null; // timestamptz string or null
}): Promise<ModuleProgressRow> {
  const {
    userId,
    moduleKey,
    moduleLabel,
    status,
    completionPercent,
    answeredCount,
    totalCount,
    completedAt,
  } = params;

  const r = await db.query(
    `
    insert into contributor_profile_module_progress
      (id, user_id, module_key, module_label,
       status, completion_percent, answered_count, total_count,
       points_awarded, started_at, completed_at, quality_at, updated_at)
    values
      (gen_random_uuid(), $1::text, $2::text, $3::text,
       $4::profile_module_status, $5::int, $6::int, $7::int,
       0, now(), $8::timestamptz, null, now())
    on conflict (user_id, module_key)
    do update set
      module_label = excluded.module_label,
      status = excluded.status,
      completion_percent = excluded.completion_percent,
      answered_count = excluded.answered_count,
      total_count = excluded.total_count,
      completed_at = coalesce(excluded.completed_at, contributor_profile_module_progress.completed_at),
      updated_at = now()
    returning
      id::text as id,
      user_id as "userId",
      module_key as "moduleKey",
      module_label as "moduleLabel",
      status::text as status,
      completion_percent as "completionPercent",
      answered_count as "answeredCount",
      total_count as "totalCount",
      points_awarded as "pointsAwarded",
      started_at::text as "startedAt",
      completed_at::text as "completedAt",
      quality_at::text as "qualityAt",
      updated_at::text as "updatedAt"
    `,
    [
      userId,
      moduleKey,
      moduleLabel ?? null,
      status,
      completionPercent,
      answeredCount,
      totalCount,
      completedAt ?? null,
    ],
  );

  return r.rows[0] as ModuleProgressRow;
}

export async function markModuleRewarded(params: {
  userId: string; // TEXT (user_id)
  moduleKey: ModuleKey;
  pointsAwarded: number;
}): Promise<void> {
  await db.query(
    `
    update contributor_profile_module_progress
    set points_awarded = $3::int,
        updated_at = now()
    where user_id = $1::text and module_key = $2::text
    `,
    [params.userId, params.moduleKey, params.pointsAwarded],
  );
}

// ---------- User fields ----------

export async function updateUserBasics(params: {
  userId: string; // user.id is UUID in your system
  name?: string;
  sex?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  phone2?: string | null;
}) {
  await db.query(
    `
    update "user"
    set
      name = coalesce($2, name),
      sex = coalesce($3, sex),
      birth_date = coalesce($4, birth_date),
      phone = coalesce($5, phone),
      phone2 = coalesce($6, phone2),
      "updatedAt" = now()
    where id = $1::text
    `,
    [
      params.userId,
      params.name ?? null,
      params.sex ?? null,
      params.birthDate ?? null,
      params.phone ?? null,
      params.phone2 ?? null,
    ],
  );
}

// ---------- ContributorProfile (table has camelCase columns) ----------

export type ContributorProfileRow = {
  id: string;
  userId: string;

  gender: string | null;
  birthDate: string | null;

  maritalStatus: string | null;
  hasChildren: boolean | null;
  childrenCount: number | null;

  residenceCountryCode: string | null;
  residenceCity: string | null;
  areaType: string | null;
  cityResidenceDuration: string | null;

  nationality1Code: string | null;
  nationality2Code: string | null;

  hasValidIdOrPassport: boolean | null;

  createdAt: string;
  updatedAt: string;
};

export async function getContributorProfile(userId: string): Promise<ContributorProfileRow | null> {
  const r = await db.query(
    `
    select
      id::text as id,
      "userId" as "userId",
      "gender"::text as gender,
      "birthDate"::text as "birthDate",
      "maritalStatus"::text as "maritalStatus",
      "hasChildren" as "hasChildren",
      "childrenCount" as "childrenCount",
      "residenceCountryCode" as "residenceCountryCode",
      "residenceCity" as "residenceCity",
      "areaType"::text as "areaType",
      "cityResidenceDuration"::text as "cityResidenceDuration",
      "nationality1Code" as "nationality1Code",
      "nationality2Code" as "nationality2Code",
      "hasValidIdOrPassport" as "hasValidIdOrPassport",
      "createdAt"::text as "createdAt",
      "updatedAt"::text as "updatedAt"
    from contributor_profile
    where "userId" = $1::text
    limit 1
    `,
    [userId],
  );

  return (r.rows[0] as ContributorProfileRow | undefined) ?? null;
}

export async function upsertContributorProfile(userId: string, patch: Partial<ContributorProfileRow>) {
  await db.query(
    `
    insert into contributor_profile
      (id, "userId",
       "gender", "birthDate",
       "maritalStatus", "hasChildren", "childrenCount",
       "residenceCountryCode", "residenceCity", "areaType", "cityResidenceDuration",
       "nationality1Code", "nationality2Code",
       "hasValidIdOrPassport",
       "createdAt", "updatedAt")
    values
      (gen_random_uuid(), $1::text,
       $2::gender, $3::date,
       $4::marital_status, $5::boolean, $6::int,
       $7::varchar, $8::text, $9::area_type, $10::residence_duration,
       $11::varchar, $12::varchar,
       $13::boolean,
       now(), now())
    on conflict ("userId")
    do update set
      "gender" = coalesce(excluded."gender", contributor_profile."gender"),
      "birthDate" = coalesce(excluded."birthDate", contributor_profile."birthDate"),
      "maritalStatus" = coalesce(excluded."maritalStatus", contributor_profile."maritalStatus"),
      "hasChildren" = coalesce(excluded."hasChildren", contributor_profile."hasChildren"),
      "childrenCount" = coalesce(excluded."childrenCount", contributor_profile."childrenCount"),
      "residenceCountryCode" = coalesce(excluded."residenceCountryCode", contributor_profile."residenceCountryCode"),
      "residenceCity" = coalesce(excluded."residenceCity", contributor_profile."residenceCity"),
      "areaType" = coalesce(excluded."areaType", contributor_profile."areaType"),
      "cityResidenceDuration" = coalesce(excluded."cityResidenceDuration", contributor_profile."cityResidenceDuration"),
      "nationality1Code" = coalesce(excluded."nationality1Code", contributor_profile."nationality1Code"),
      "nationality2Code" = coalesce(excluded."nationality2Code", contributor_profile."nationality2Code"),
      "hasValidIdOrPassport" = coalesce(excluded."hasValidIdOrPassport", contributor_profile."hasValidIdOrPassport"),
      "updatedAt" = now()
    `,
    [
      userId,
      // gender/birthDate
      (patch as any).gender ?? null,
      (patch as any).birthDate ?? null,

      patch.maritalStatus ?? null,
      typeof patch.hasChildren === "undefined" ? null : patch.hasChildren,
      typeof patch.childrenCount === "undefined" ? null : patch.childrenCount,

      patch.residenceCountryCode ?? null,
      patch.residenceCity ?? null,
      patch.areaType ?? null,
      patch.cityResidenceDuration ?? null,

      patch.nationality1Code ?? null,
      patch.nationality2Code ?? null,

      typeof patch.hasValidIdOrPassport === "undefined" ? null : patch.hasValidIdOrPassport,
    ],
  );
}

type AttrType = "boolean" | "number" | "string" | "date" | "single_select" | "multi_select" | "json";

export async function ensureAttributeDefinition(params: {
  key: string;
  label: string;
  family: string;
  type: AttrType;
  optionsJson?: any;
}) {
  await db.query(
    `
    insert into contributor_attribute_definition
      (id, key, label, family, type,
       "optionsJson", "isFilterable", "isSensitive", "requiresConsent",
       "createdAt", "updatedAt")
    values
      (gen_random_uuid(), $1::text, $2::text, $3::text, $4::contributor_attribute_type,
       $5::jsonb, true, false, false,
       now(), now())
    on conflict (key) do nothing
    `,
    [
      params.key,
      params.label,
      params.family,
      params.type,
      params.optionsJson == null ? null : JSON.stringify(params.optionsJson),
    ],
  );

  const r = await db.query<{ id: string }>(
    `select id::text as id from contributor_attribute_definition where key = $1::text limit 1`,
    [params.key],
  );

  return r.rows[0]?.id ?? null;
}


export async function upsertAttributeValue(params: {
  userId: string; // TEXT in contributor_attribute_value
  key: string;
  type: AttrType;
  value: any;
}) {
  const defId = await ensureAttributeDefinition({
    key: params.key,
    label: params.key,
    family: params.key.split(".")[0] ?? "auto",
    type: params.type,
  });
  if (!defId) return;

  const v = params.value;

  const valueBoolean = params.type === "boolean" ? (typeof v === "boolean" ? v : null) : null;
  const valueNumber = params.type === "number" ? (typeof v === "number" ? v : null) : null;

  const valueString =
    params.type === "string" || params.type === "single_select" ? (typeof v === "string" ? v : null) : null;

  const valueDate = params.type === "date" && typeof v === "string" ? v : null;

  const valueJson =
    params.type === "json" || params.type === "multi_select"
      ? v == null
        ? null
        : JSON.stringify(v)
      : null;

  await db.query(
    `
    insert into contributor_attribute_value
      (id, "userId", "definitionId",
       "valueBoolean", "valueNumber", "valueString", "valueDate", "valueJson",
       "createdAt", "updatedAt")
    values
      (gen_random_uuid(), $1::text, $2::uuid,
       $3::boolean, $4::float8, $5::text, $6::date, $7::jsonb,
       now(), now())
    on conflict ("userId", "definitionId")
    do update set
      "valueBoolean" = excluded."valueBoolean",
      "valueNumber" = excluded."valueNumber",
      "valueString" = excluded."valueString",
      "valueDate" = excluded."valueDate",
      "valueJson" = excluded."valueJson",
      "updatedAt" = now()
    `,
    [params.userId, defId, valueBoolean, valueNumber, valueString, valueDate, valueJson],
  );
}

export async function readAttributeValueByKey(params: { userId: string; key: string }) {
  const r = await db.query<{
    valueBoolean: boolean | null;
    valueNumber: number | null;
    valueString: string | null;
    valueDate: string | null;
    valueJson: any;
  }>(
    `
    select
      v."valueBoolean" as "valueBoolean",
      v."valueNumber" as "valueNumber",
      v."valueString" as "valueString",
      v."valueDate"::text as "valueDate",
      v."valueJson" as "valueJson"
    from contributor_attribute_value v
    join contributor_attribute_definition d on d.id = v."definitionId"
    where v."userId" = $1::text and d.key = $2::text
    limit 1
    `,
    [params.userId, params.key],
  );

  return r.rows[0] ?? null;
}

// ---------- Wallet account lookup (for rewards) ----------

export type WalletAccountRow = {
  id: string; // account PK
  providerId: string;
  balance: string;
  currency: string;
};

/**
 * account.userId is very likely UUID in your DB (NextAuth-style).
 * So we cast userId to uuid here only.
 */
const PROVIDER_PRIORITY = ["mobile_credentials", "mobile", "credential", "google"] as const;

export async function findWalletAccount(params: {
  userId: string; // UUID string (user.id)
  providerId?: string;
}): Promise<WalletAccountRow | null> {
  const { userId, providerId } = params;

  if (providerId) {
    const res = await db.query<WalletAccountRow>(
      `
      select
        a."id"::text as id,
        a."providerId" as "providerId",
        a."balance"::text as balance,
        a."currency" as currency
      from "account" a
      where a."userId" = $1::text and a."providerId" = $2::text
      limit 1
      `,
      [userId, providerId],
    );
    return res.rows[0] ?? null;
  }

  const res = await db.query<WalletAccountRow>(
    `
    select
      a."id"::text as id,
      a."providerId" as "providerId",
      a."balance"::text as balance,
      a."currency" as currency
    from "account" a
    where a."userId" = $1::uuid and a."providerId" = any($2::text[])
    order by array_position($2::text[], a."providerId") asc
    limit 1
    `,
    [userId, PROVIDER_PRIORITY],
  );

  return res.rows[0] ?? null;
}

// ---------- Debug helper ----------

export async function dbQueryUser(userId: string): Promise<any | null> {
  const r = await db.query(
    `
    select
      id::text as id,
      email,
      name,
      sex::text as sex,
      birth_date::text as birth_date,
      phone,
      phone2
    from "user"
    where id = $1::text
    limit 1
    `,
    [userId],
  );

  return r.rows[0] ?? null;
}

