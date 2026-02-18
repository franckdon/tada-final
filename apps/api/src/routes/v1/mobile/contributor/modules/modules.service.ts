// apps/api/src/routes/v1/mobile/contributor/modules/modules.service.ts
import * as repo from "./modules.repo";
import { DEFAULT_MODULES, mergeRuntimeConfig, ORDERED_MODULE_KEYS, type ModuleKey, type ProfileModuleStatus } from "./modules.config";
import type { PersonalInfoInput, LocationInput, EthnicityInput } from "./modules.schemas";

type ServiceResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

type RuntimeModuleConfig = {
  key: ModuleKey;
  label: string;
  order: number;
  rewardXof: number;
  dependsOn?: ModuleKey;
  isActive: boolean;
};

function isFilled(v: any) {
  if (v === null || typeof v === "undefined") return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true; // boolean/number/date/json
}

/**
 * Charge la config DB et construit une config runtime
 * (fallback sur MODULES si DB vide ou module absent)
 */
async function getRuntimeModulesConfig(): Promise<{
  modulesByKey: Record<ModuleKey, RuntimeModuleConfig>;
  orderedKeys: ModuleKey[];
}> {
  const dbConfigs = await repo.getAllModuleRewardConfigs();

  const modulesByKey = {} as Record<ModuleKey, RuntimeModuleConfig>;

  for (const key of ORDERED_MODULE_KEYS) {
    const base = DEFAULT_MODULES[key];
    const db = dbConfigs[key];

    const runtime = mergeRuntimeConfig(key, db);

    // dependsOn : DB > base
    const dependsOnRaw = (db?.dependsOn ?? base.dependsOn) ?? undefined;

    modulesByKey[key] = {
      key,
      label: db?.moduleLabel ?? base.label,
      order: typeof db?.order === "number" ? db.order : base.order,
      //rewardXof: typeof db?.rewardXof === "number" ? db.rewardXof : base.rewardXof,
      rewardXof: runtime.rewardXof,
      dependsOn: (dependsOnRaw as ModuleKey | undefined) ?? undefined,
      isActive: runtime.isActive,
    };
  }

  // ordre : si DB fournit des "order" cohérents => tri asc, sinon fallback ORDERED_MODULE_KEYS
  const orderedKeys = [...ORDERED_MODULE_KEYS].sort((a, b) => {
    const oa = modulesByKey[a]?.order ?? 9999;
    const ob = modulesByKey[b]?.order ?? 9999;
    return oa - ob;
  });

  return { modulesByKey, orderedKeys };
}

async function assertModuleUnlocked(
  userId: string,
  moduleKey: ModuleKey,
  cfgByKey: Record<ModuleKey, RuntimeModuleConfig>,
): Promise<ServiceResult<true>> {
  const cfg = cfgByKey[moduleKey];
  if (!cfg?.dependsOn) return { ok: true, data: true };

  const depKey = cfg.dependsOn;
  const dep = await repo.getModuleProgress(userId, depKey);
  if (!dep || dep.completionPercent < 100 || dep.status !== "completed") {
    return { ok: false, status: 423, message: `Module verrouillé. Complète d'abord: ${depKey}` };
  }

  return { ok: true, data: true };
}

async function computePersonalInfoProgress(userId: string) {
  const userRes = await repo.dbQueryUser(userId);
  const profile = await repo.getContributorProfile(userId);

  const required = [
    isFilled(userRes?.name),
    isFilled(userRes?.email),
    isFilled(userRes?.sex),
    isFilled(userRes?.birth_date),
    isFilled(userRes?.phone),
    isFilled(profile?.maritalStatus),
    typeof profile?.hasChildren === "boolean",
    isFilled(profile?.nationality1Code),
    typeof profile?.hasValidIdOrPassport === "boolean",
  ];

  if (profile?.hasChildren === true) required.push(isFilled(profile.childrenCount));

  const total = required.length;
  const answered = required.filter(Boolean).length;

  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  const status: ProfileModuleStatus = percent >= 100 ? "completed" : "in_progress";

  return { answeredCount: answered, totalCount: total, completionPercent: percent, status };
}

async function computeLocationProgress(userId: string) {
  const profile = await repo.getContributorProfile(userId);

  const required = [
    isFilled(profile?.residenceCountryCode),
    isFilled(profile?.residenceCity),
    isFilled(profile?.cityResidenceDuration),
    isFilled(profile?.areaType),
  ];

  const total = required.length;
  const answered = required.filter(Boolean).length;

  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  const status: ProfileModuleStatus = percent >= 100 ? "completed" : "in_progress";

  return { answeredCount: answered, totalCount: total, completionPercent: percent, status };
}

async function computeEthnicityProgress(userId: string) {
  const requiredKeys = [
    { key: "ethnicity.main", type: "single_select" as const },
    { key: "ethnicity.speaks_ethnic_language", type: "boolean" as const },
    { key: "ethnicity.traditional_events", type: "boolean" as const },
    { key: "ethnicity.consumption_influenced", type: "boolean" as const },
  ];

  const values: Record<string, any> = {};
  for (const rk of requiredKeys) {
    const row = await repo.readAttributeValueByKey({ userId, key: rk.key });
    values[rk.key] =
      row?.valueString ?? row?.valueBoolean ?? row?.valueJson ?? row?.valueNumber ?? row?.valueDate ?? null;
  }

  const checks: boolean[] = [
    isFilled(values["ethnicity.main"]),
    typeof values["ethnicity.speaks_ethnic_language"] === "boolean",
    typeof values["ethnicity.traditional_events"] === "boolean",
    typeof values["ethnicity.consumption_influenced"] === "boolean",
  ];

  const speaks = values["ethnicity.speaks_ethnic_language"];
  if (speaks === true) {
    const row = await repo.readAttributeValueByKey({ userId, key: "ethnicity.ethnic_language" });
    checks.push(isFilled(row?.valueString ?? null));
  }

  const influenced = values["ethnicity.consumption_influenced"];
  if (influenced === true) {
    const row = await repo.readAttributeValueByKey({ userId, key: "ethnicity.influence_details" });
    checks.push(isFilled(row?.valueString ?? null));
  }

  const total = checks.length;
  const answered = checks.filter(Boolean).length;
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  const status: ProfileModuleStatus = percent >= 100 ? "completed" : "in_progress";

  return { answeredCount: answered, totalCount: total, completionPercent: percent, status };
}

// ---- PUBLIC API ----

export async function getAllProgress(userId: string): Promise<ServiceResult<{ modules: any[] }>> {
  const { modulesByKey, orderedKeys } = await getRuntimeModulesConfig();

  const out: any[] = [];

  for (const key of orderedKeys) {
    const cfg = modulesByKey[key];

    // si module désactivé côté admin, on le renvoie quand même (pour UI) mais en locked
    // (tu peux changer ce choix plus tard)
    const isDisabled = !cfg.isActive;

    // compute progress
    let computed;
    if (key === "personal_info") computed = await computePersonalInfoProgress(userId);
    else if (key === "location") computed = await computeLocationProgress(userId);
    else computed = await computeEthnicityProgress(userId);

    // lock rule: if dependsOn not completed => locked
    let status: ProfileModuleStatus = computed.status;
    let locked = false;

    if (isDisabled) {
      locked = true;
      status = "locked";
    } else if (cfg.dependsOn) {
      const dep = await repo.getModuleProgress(userId, cfg.dependsOn);
      if (!dep || dep.status !== "completed" || dep.completionPercent < 100) {
        locked = true;
        status = "locked";
      }
    }

    const row = await repo.upsertModuleProgress({
      userId,
      moduleKey: key,
      moduleLabel: cfg.label,
      status,
      completionPercent: computed.completionPercent,
      answeredCount: computed.answeredCount,
      totalCount: computed.totalCount,
      completedAt: status === "completed" ? new Date().toISOString() : null,
    });

    out.push({
      key,
      label: cfg.label,
      order: cfg.order,
      rewardXof: cfg.rewardXof,
      isActive: cfg.isActive,
      dependsOn: cfg.dependsOn ?? null,
      ...row,
      isLocked: locked,
    });
  }

  return { ok: true, data: { modules: out } };
}

export async function updatePersonalInfo(userId: string, input: PersonalInfoInput): Promise<ServiceResult<any>> {
  await repo.updateUserBasics({
    userId,
    name: input.name,
    sex: typeof input.sex === "undefined" ? null : input.sex,
    birthDate: typeof input.birthDate === "undefined" ? null : input.birthDate,
    phone: typeof input.phone === "undefined" ? null : input.phone,
    phone2: typeof input.phone2 === "undefined" ? null : input.phone2,
  });

  await repo.upsertContributorProfile(userId, {
    maritalStatus: input.maritalStatus ?? null,
    hasChildren: typeof input.hasChildren === "undefined" ? null : input.hasChildren,
    childrenCount: typeof input.childrenCount === "undefined" ? null : input.childrenCount,
    nationality1Code: input.nationality1Code ?? null,
    nationality2Code: input.nationality2Code ?? null,
    hasValidIdOrPassport: typeof input.hasValidIdOrPassport === "undefined" ? null : input.hasValidIdOrPassport,
  });

  await getAllProgress(userId);
  return { ok: true, data: { ok: true } };
}

export async function updateLocation(userId: string, input: LocationInput): Promise<ServiceResult<any>> {
  const { modulesByKey } = await getRuntimeModulesConfig();

  const unlocked = await assertModuleUnlocked(userId, "location", modulesByKey);
  if (!unlocked.ok) return unlocked;

  await repo.upsertContributorProfile(userId, {
    residenceCountryCode: input.residenceCountryCode ?? null,
    residenceCity: input.residenceCity ?? null,
    cityResidenceDuration: input.cityResidenceDuration ?? null,
    areaType: input.areaType ?? null,
  });

  const attrPairs: Array<{ key: string; type: any; value: any }> = [
    { key: "location.neighborhood", type: "string", value: input.neighborhood },
    { key: "location.address", type: "string", value: input.address },
    { key: "location.postal_code", type: "string", value: input.postalCode },
    { key: "location.city_influences_consumption", type: "boolean", value: input.cityInfluencesConsumption },
    { key: "location.city_influence_details", type: "string", value: input.cityInfluenceDetails },
    { key: "location.lived_other_city", type: "boolean", value: input.livedOtherCity },
    { key: "location.other_city_name", type: "string", value: input.otherCityName },
    { key: "location.traveled_abroad", type: "boolean", value: input.traveledAbroad },
    { key: "location.countries_visited", type: "multi_select", value: input.countriesVisited },
    { key: "location.work_near_home", type: "single_select", value: input.workNearHome },
  ];

  for (const a of attrPairs) {
    if (typeof a.value === "undefined") continue;
    await repo.upsertAttributeValue({ userId, key: a.key, type: a.type, value: a.value });
  }

  await getAllProgress(userId);
  return { ok: true, data: { ok: true } };
}

export async function updateEthnicity(userId: string, input: EthnicityInput): Promise<ServiceResult<any>> {
  const { modulesByKey } = await getRuntimeModulesConfig();

  const unlocked = await assertModuleUnlocked(userId, "ethnicity", modulesByKey);
  if (!unlocked.ok) return unlocked;

  const attrPairs: Array<{ key: string; type: any; value: any }> = [
    { key: "ethnicity.main", type: "single_select", value: input.main },
    { key: "ethnicity.speaks_ethnic_language", type: "boolean", value: input.speaksEthnicLanguage },
    { key: "ethnicity.ethnic_language", type: "string", value: input.ethnicLanguage },
    { key: "ethnicity.traditional_events", type: "boolean", value: input.traditionalEvents },
    { key: "ethnicity.cultural_practices", type: "boolean", value: input.culturalPractices },
    { key: "ethnicity.cultural_practices_details", type: "string", value: input.culturalPracticesDetails },
    { key: "ethnicity.travel_to_village_frequency", type: "single_select", value: input.travelToVillageFrequency },
    { key: "ethnicity.traditional_foods", type: "boolean", value: input.traditionalFoods },
    { key: "ethnicity.traditional_foods_details", type: "string", value: input.traditionalFoodsDetails },
    { key: "ethnicity.transmit_culture_to_children", type: "boolean", value: input.transmitCultureToChildren },
    { key: "ethnicity.consumption_influenced", type: "boolean", value: input.consumptionInfluenced },
    { key: "ethnicity.influence_details", type: "string", value: input.influenceDetails },
    { key: "ethnicity.traditional_clothes", type: "single_select", value: input.traditionalClothes },
    { key: "ethnicity.listen_traditional_music", type: "boolean", value: input.listenTraditionalMusic },
    { key: "ethnicity.favorite_artist", type: "string", value: input.favoriteArtist },
  ];

  for (const a of attrPairs) {
    if (typeof a.value === "undefined") continue;
    await repo.upsertAttributeValue({ userId, key: a.key, type: a.type, value: a.value });
  }

  await getAllProgress(userId);
  return { ok: true, data: { ok: true } };
}
