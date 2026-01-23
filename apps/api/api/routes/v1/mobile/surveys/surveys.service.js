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
exports.listMissionSurveys = listMissionSurveys;
exports.getSurveyDetails = getSurveyDetails;
exports.getSurveyQuestions = getSurveyQuestions;
const repo = __importStar(require("./surveys.repo"));
const db_1 = require("../../../../lib/db");
const env_1 = require("../../../../env");
async function getMissionAccess(missionId) {
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
    const r = await db_1.db.query(sql, [missionId]);
    return r.rows[0] ?? null;
}
function canViewMissionMobile(m) {
    //if (m.internal) return { ok: false as const, reason: "MISSION_INTERNAL" };
    if (m.isSuperAdminMission)
        return { ok: false, reason: "SUPERADMIN_ONLY" };
    if (!m.isPublic)
        return { ok: false, reason: "NOT_PUBLIC" };
    if (!m.isPublish)
        return { ok: false, reason: "NOT_PUBLISHED" };
    if (m.publishAt) {
        const t = new Date(m.publishAt).getTime();
        if (!Number.isNaN(t) && t > Date.now())
            return { ok: false, reason: "PUBLISH_AT_IN_FUTURE" };
    }
    return { ok: true };
}
function forbid(reason) {
    const msg = env_1.env.NODE_ENV === "production" ? "Accès interdit" : `Accès interdit (${reason})`;
    return { ok: false, status: 403, message: msg };
}
async function listMissionSurveys(userId, missionId, q) {
    const mission = await getMissionAccess(missionId);
    if (!mission)
        return { ok: false, status: 404, message: "Mission introuvable" };
    const access = canViewMissionMobile(mission);
    if (!access.ok)
        return forbid(access.reason);
    const { items, total } = await repo.listSurveysByMission(missionId, q);
    return { ok: true, data: { items, total } };
}
async function getSurveyDetails(userId, surveyId, q) {
    const survey = await repo.getSurveyById(surveyId, q.includeQuestions);
    if (!survey)
        return { ok: false, status: 404, message: "Survey introuvable" };
    if (!survey.missionId)
        return forbid("SURVEY_WITHOUT_MISSION");
    const mission = await getMissionAccess(survey.missionId);
    if (!mission)
        return { ok: false, status: 404, message: "Mission introuvable" };
    const access = canViewMissionMobile(mission);
    if (!access.ok)
        return forbid(access.reason);
    return { ok: true, data: { survey } };
}
async function getSurveyQuestions(userId, surveyId) {
    // on doit vérifier l'accès via la mission
    const survey = await repo.getSurveyById(surveyId, false);
    if (!survey)
        return { ok: false, status: 404, message: "Survey introuvable" };
    if (!survey.missionId)
        return forbid("SURVEY_WITHOUT_MISSION");
    const mission = await getMissionAccess(survey.missionId);
    if (!mission)
        return { ok: false, status: 404, message: "Mission introuvable" };
    const access = canViewMissionMobile(mission);
    if (!access.ok)
        return forbid(access.reason);
    const questions = await repo.getSurveyQuestions(surveyId);
    return { ok: true, data: { surveyId, questions } };
}
