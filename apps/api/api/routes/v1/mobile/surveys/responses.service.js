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
exports.createSurveyResponse = createSurveyResponse;
const crypto = __importStar(require("node:crypto"));
const db_1 = require("../../../../lib/db");
const env_1 = require("../../../../env");
const repo = __importStar(require("./responses.repo"));
async function getSurveyMini(surveyId) {
    const sql = `
    SELECT s."id", s."missionId"
    FROM "survey" s
    WHERE s."id" = $1
    LIMIT 1
  `;
    const r = await db_1.db.query(sql, [surveyId]);
    return r.rows[0] ?? null;
}
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
// Policy: internal visible par tous => pas de blocage internal
function canViewMissionMobile(m) {
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
async function createSurveyResponse(userId, surveyId, input, reqMeta) {
    const survey = await getSurveyMini(surveyId);
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
        ok: true,
        data: {
            response: row,
        },
    };
}
