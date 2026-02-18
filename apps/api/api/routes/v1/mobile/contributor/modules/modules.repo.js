"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllModuleRewardConfigs = getAllModuleRewardConfigs;
exports.getModuleRewardConfig = getModuleRewardConfig;
exports.getModuleProgress = getModuleProgress;
exports.upsertModuleProgress = upsertModuleProgress;
exports.markModuleRewarded = markModuleRewarded;
exports.updateUserBasics = updateUserBasics;
exports.getContributorProfile = getContributorProfile;
exports.upsertContributorProfile = upsertContributorProfile;
exports.ensureAttributeDefinition = ensureAttributeDefinition;
exports.upsertAttributeValue = upsertAttributeValue;
exports.readAttributeValueByKey = readAttributeValueByKey;
exports.findWalletAccount = findWalletAccount;
exports.dbQueryUser = dbQueryUser;
// apps/api/src/routes/v1/mobile/contributor/modules/modules.repo.ts
const db_1 = require("../../../../../lib/db");
/**
 * Récupère toutes les configs de rewards (admin-driven)
 */
async function getAllModuleRewardConfigs() {
    const r = await db_1.db.query(`
    select
      id::text as id,
      module_key as "moduleKey",
      module_label as "moduleLabel",
      "order"::int as "order",
      reward_xof::int as "rewardXof",
      is_active as "isActive",
      depends_on as "dependsOn",
      created_at::text as "createdAt",
      updated_at::text as "updatedAt"
    from contributor_module_reward_config
    `);
    const out = {};
    for (const row of r.rows) {
        out[row.moduleKey] = row;
    }
    return out;
}
/**
 * Récupère la config d’un module (admin-driven)
 */
async function getModuleRewardConfig(moduleKey) {
    const r = await db_1.db.query(`
    select
      id::text as id,
      module_key as "moduleKey",
      module_label as "moduleLabel",
      "order"::int as "order",
      reward_xof::int as "rewardXof",
      is_active as "isActive",
      depends_on as "dependsOn",
      created_at::text as "createdAt",
      updated_at::text as "updatedAt"
    from contributor_module_reward_config
    where module_key = $1::text
    limit 1
    `, [moduleKey]);
    return r.rows[0] ?? null;
}
async function getModuleProgress(userId, moduleKey) {
    const r = await db_1.db.query(`
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
    `, [userId, moduleKey]);
    return r.rows[0] ?? null;
}
async function upsertModuleProgress(params) {
    const { userId, moduleKey, moduleLabel, status, completionPercent, answeredCount, totalCount, completedAt, } = params;
    const r = await db_1.db.query(`
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
    `, [
        userId,
        moduleKey,
        moduleLabel ?? null,
        status,
        completionPercent,
        answeredCount,
        totalCount,
        completedAt ?? null,
    ]);
    return r.rows[0];
}
async function markModuleRewarded(params) {
    await db_1.db.query(`
    update contributor_profile_module_progress
    set points_awarded = $3::int,
        updated_at = now()
    where user_id = $1::text and module_key = $2::text
    `, [params.userId, params.moduleKey, params.pointsAwarded]);
}
// ---------- User fields ----------
async function updateUserBasics(params) {
    await db_1.db.query(`
    update "user"
    set
      name = coalesce($2, name),
      sex = coalesce($3, sex),
      birth_date = coalesce($4, birth_date),
      phone = coalesce($5, phone),
      phone2 = coalesce($6, phone2),
      "updatedAt" = now()
    where id = $1::text
    `, [
        params.userId,
        params.name ?? null,
        params.sex ?? null,
        params.birthDate ?? null,
        params.phone ?? null,
        params.phone2 ?? null,
    ]);
}
async function getContributorProfile(userId) {
    const r = await db_1.db.query(`
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
    `, [userId]);
    return r.rows[0] ?? null;
}
async function upsertContributorProfile(userId, patch) {
    await db_1.db.query(`
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
    `, [
        userId,
        // gender/birthDate
        patch.gender ?? null,
        patch.birthDate ?? null,
        patch.maritalStatus ?? null,
        typeof patch.hasChildren === "undefined" ? null : patch.hasChildren,
        typeof patch.childrenCount === "undefined" ? null : patch.childrenCount,
        patch.residenceCountryCode ?? null,
        patch.residenceCity ?? null,
        patch.areaType ?? null,
        patch.cityResidenceDuration ?? null,
        patch.nationality1Code ?? null,
        patch.nationality2Code ?? null,
        typeof patch.hasValidIdOrPassport === "undefined"
            ? null
            : patch.hasValidIdOrPassport,
    ]);
}
async function ensureAttributeDefinition(params) {
    await db_1.db.query(`
    insert into contributor_attribute_definition
      (id, key, label, family, type,
       "optionsJson", "isFilterable", "isSensitive", "requiresConsent",
       "createdAt", "updatedAt")
    values
      (gen_random_uuid(), $1::text, $2::text, $3::text, $4::contributor_attribute_type,
       $5::jsonb, true, false, false,
       now(), now())
    on conflict (key) do nothing
    `, [
        params.key,
        params.label,
        params.family,
        params.type,
        params.optionsJson == null ? null : JSON.stringify(params.optionsJson),
    ]);
    const r = await db_1.db.query(`select id::text as id from contributor_attribute_definition where key = $1::text limit 1`, [params.key]);
    return r.rows[0]?.id ?? null;
}
async function upsertAttributeValue(params) {
    const defId = await ensureAttributeDefinition({
        key: params.key,
        label: params.key,
        family: params.key.split(".")[0] ?? "auto",
        type: params.type,
    });
    if (!defId)
        return;
    const v = params.value;
    const valueBoolean = params.type === "boolean" ? (typeof v === "boolean" ? v : null) : null;
    const valueNumber = params.type === "number" ? (typeof v === "number" ? v : null) : null;
    const valueString = params.type === "string" || params.type === "single_select"
        ? typeof v === "string"
            ? v
            : null
        : null;
    const valueDate = params.type === "date" && typeof v === "string" ? v : null;
    const valueJson = params.type === "json" || params.type === "multi_select"
        ? v == null
            ? null
            : JSON.stringify(v)
        : null;
    await db_1.db.query(`
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
    `, [params.userId, defId, valueBoolean, valueNumber, valueString, valueDate, valueJson]);
}
async function readAttributeValueByKey(params) {
    const r = await db_1.db.query(`
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
    `, [params.userId, params.key]);
    return r.rows[0] ?? null;
}
const PROVIDER_PRIORITY = ["mobile_credentials", "mobile", "credential", "google"];
async function findWalletAccount(params) {
    const { userId, providerId } = params;
    if (providerId) {
        const res = await db_1.db.query(`
      select
        a."id"::text as id,
        a."providerId" as "providerId",
        a."balance"::text as balance,
        a."currency" as currency
      from "account" a
      where a."userId"::text = $1::text
        and a."providerId" = $2::text
      limit 1
      `, [userId, providerId]);
        return res.rows[0] ?? null;
    }
    const res = await db_1.db.query(`
    select
      a."id"::text as id,
      a."providerId" as "providerId",
      a."balance"::text as balance,
      a."currency" as currency
    from "account" a
    where a."userId"::text = $1::text
      and a."providerId" = any($2::text[])
    order by array_position($2::text[], a."providerId") asc
    limit 1
    `, [userId, PROVIDER_PRIORITY]);
    return res.rows[0] ?? null;
}
// ---------- Debug helper ----------
async function dbQueryUser(userId) {
    const r = await db_1.db.query(`
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
    `, [userId]);
    return r.rows[0] ?? null;
}
