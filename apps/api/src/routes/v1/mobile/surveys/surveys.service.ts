import type { SurveysListQuery, SurveyDetailsQuery } from "./surveys.schemas";
import * as repo from "./surveys.repo";
import { db } from "../../../../lib/db";
import { env } from "../../../../env";

type MissionAccessRow = {
  id: string;
  //internal: boolean;
  isPublic: boolean;
  isSuperAdminMission: boolean;
  isPublish: boolean;
  publishAt: string | null;
};

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

function canViewMissionMobile(m: MissionAccessRow) {
  //if (m.internal) return { ok: false as const, reason: "MISSION_INTERNAL" };
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

export async function listMissionSurveys(userId: string, missionId: string, q: SurveysListQuery) {
  const mission = await getMissionAccess(missionId);
  if (!mission) return { ok: false as const, status: 404, message: "Mission introuvable" };

  const access = canViewMissionMobile(mission);
  if (!access.ok) return forbid(access.reason);

  const { items, total } = await repo.listSurveysByMission(missionId, q);
  return { ok: true as const, data: { items, total } };
}

export async function getSurveyDetails(userId: string, surveyId: string, q: SurveyDetailsQuery) {
  const survey = await repo.getSurveyById(surveyId, q.includeQuestions);
  if (!survey) return { ok: false as const, status: 404, message: "Survey introuvable" };

  if (!survey.missionId) return forbid("SURVEY_WITHOUT_MISSION");

  const mission = await getMissionAccess(survey.missionId);
  if (!mission) return { ok: false as const, status: 404, message: "Mission introuvable" };

  const access = canViewMissionMobile(mission);
  if (!access.ok) return forbid(access.reason);

  return { ok: true as const, data: { survey } };
}

export async function getSurveyQuestions(userId: string, surveyId: string) {
  // on doit vérifier l'accès via la mission
  const survey = await repo.getSurveyById(surveyId, false);
  if (!survey) return { ok: false as const, status: 404, message: "Survey introuvable" };
  if (!survey.missionId) return forbid("SURVEY_WITHOUT_MISSION");

  const mission = await getMissionAccess(survey.missionId);
  if (!mission) return { ok: false as const, status: 404, message: "Mission introuvable" };

  const access = canViewMissionMobile(mission);
  if (!access.ok) return forbid(access.reason);

  const questions = await repo.getSurveyQuestions(surveyId);
  return { ok: true as const, data: { surveyId, questions } };
}
