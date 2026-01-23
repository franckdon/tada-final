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
exports.mobileMissionSurveysRoutes = void 0;
const hono_1 = require("hono");
const zod_1 = require("zod");
const requireMobileAuth_1 = require("../../../middleware/requireMobileAuth");
const mobile_errors_1 = require("./mobile.errors");
const surveys_schemas_1 = require("./surveys/surveys.schemas");
const surveysService = __importStar(require("./surveys/surveys.service"));
exports.mobileMissionSurveysRoutes = new hono_1.Hono();
exports.mobileMissionSurveysRoutes.onError((err, c) => {
    if (err instanceof zod_1.ZodError) {
        return c.json({ error: "Données invalides", details: (0, mobile_errors_1.formatZodIssuesFr)(err) }, 400);
    }
    console.error("[MOBILE MISSION SURVEYS ERROR]", err);
    return c.json({ error: "Une erreur interne est survenue" }, 500);
});
// GET /v1/mobile/missions/:missionId/surveys
exports.mobileMissionSurveysRoutes.get("/:missionId/surveys", requireMobileAuth_1.requireMobileAuth, async (c) => {
    const userId = c.get("userId");
    const missionId = c.req.param("missionId");
    const query = surveys_schemas_1.surveysListQuerySchema.parse(c.req.query());
    const r = await surveysService.listMissionSurveys(userId, missionId, query);
    if (!r.ok)
        return (0, mobile_errors_1.jsonError)(c, r.status, r.message);
    return c.json(r.data);
});
