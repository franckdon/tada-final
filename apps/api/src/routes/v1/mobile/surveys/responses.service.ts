import * as crypto from "node:crypto";
import { db } from "../../../../lib/db";
import { env } from "../../../../env";
import type { CreateSurveyResponseInput } from "./responses.schemas";
import * as repo from "./responses.repo";

type SurveyMini = { id: string; missionId: string | null };
type MissionAccessRow = {
  id: string;
  internal: boolean;
  isPublic: boolean;
  isSuperAdminMission: boolean;
  isPublish: boolean;
  publishAt: string | null;
};

async function getSurveyMini(surveyId: string): Promise<SurveyMini | null> {
  const sql = `
    SELECT s."id", s."missionId"
    FROM "survey" s
    WHERE s."id" = $1
    LIMIT 1
  `;
  const r = await db.query<SurveyMini>(sql, [surveyId]);
  return r.rows[0] ?? null;
}

async function getMissionAccess(missionId: string): Promise<MissionAccessRow | null> {
  const sql = `
    SELECT
      m."id",
      COALESCE(m."internal", false) AS "internal",
      COALESCE(m."isPublic", true) AS "isPublic",
      COALESCE(m."isSuperAdminMission", false) AS "isSuperAdminMission",
      m."isPublish",
      m."publishAt"
    FROM "mission" m
    WHERE m."id" = $1
    LIMIT 1
  `;
  const r = await db.query<MissionAccessRow>(sql, [missionId]);
  return r.rows[0] ?? null;
}

// Policy: internal visible par tous => pas de blocage internal
function canViewMissionMobile(m: MissionAccessRow) {
  if (m.isSuperAdminMission) return { ok: false as const, reason: "SUPERADMIN_ONLY" };
  if (!m.isPublic) return { ok: false as const, reason: "NOT_PUBLIC" };
  if (!m.isPublish) return { ok: false as const, reason: "NOT_PUBLISHED" };

  if (m.publishAt) {
    const t = new Date(m.publishAt).getTime();
    if (!Number.isNaN(t) && t > Date.now()) return { ok: false as const, reason: "PUBLISH_AT_IN_FUTURE" };
  }
  return { ok: true as const };
}

function forbid(reason: string) {
  const msg = env.NODE_ENV === "production" ? "Accès interdit" : `Accès interdit (${reason})`;
  return { ok: false as const, status: 403, message: msg };
}

export async function createSurveyResponse(
  userId: string,
  surveyId: string,
  input: CreateSurveyResponseInput,
  reqMeta: { ip: string | null; ua: string | null },
) {
  const survey = await getSurveyMini(surveyId);
  if (!survey) return { ok: false as const, status: 404, message: "Survey introuvable" };
  if (!survey.missionId) return forbid("SURVEY_WITHOUT_MISSION");

  const mission = await getMissionAccess(survey.missionId);
  if (!mission) return { ok: false as const, status: 404, message: "Mission introuvable" };

  const access = canViewMissionMobile(mission);
  if (!access.ok) return forbid(access.reason);

  const id = crypto.randomUUID();

  const row = await repo.insertSurveyResponse({
    id,
    surveyId,
    userId: userId ?? null,
    responses: input.responses ?? {},
    age: input.age ?? 18,
    gender: input.gender ?? "unknown",
    location: input.location ?? {},
    ipAddress: reqMeta.ip,
    userAgent: reqMeta.ua,
    status: "submitted",
  });

  return {
    ok: true as const,
    data: {
      response: row,
    },
  };
}
