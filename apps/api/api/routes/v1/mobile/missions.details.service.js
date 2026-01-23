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
exports.getMissionDetails = getMissionDetails;
const repo = __importStar(require("./missions.details.repo"));
const env_1 = require("../../../env");
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
        if (!Number.isNaN(t) && t > Date.now()) {
            return { ok: false, reason: "PUBLISH_AT_IN_FUTURE" };
        }
    }
    return { ok: true };
}
async function getMissionDetails(userId, id, query) {
    const mission = await repo.getMissionById(id);
    if (!mission)
        return { ok: false, status: 404, message: "Mission introuvable" };
    const access = canViewMissionMobile(mission);
    if (!access.ok) {
        const msg = env_1.env.NODE_ENV === "production"
            ? "Accès interdit"
            : `Accès interdit (${access.reason})`; // très utile en dev
        return { ok: false, status: 403, message: msg };
    }
    const [organization, workspace, charts, comments] = await Promise.all([
        query.includeOrganization && mission.organizationId
            ? repo.getOrganizationMini(mission.organizationId)
            : Promise.resolve(null),
        query.includeWorkspace && mission.workspaceId
            ? repo.getWorkspaceMini(mission.workspaceId)
            : Promise.resolve(null),
        query.includeCharts ? repo.getMissionCharts(id) : Promise.resolve([]),
        query.includeComments ? repo.getMissionCommentsMini(id, 20) : Promise.resolve([]),
    ]);
    return {
        ok: true,
        data: {
            mission: {
                ...mission,
                isPublished: mission.isPublish,
            },
            organization,
            workspace,
            charts,
            comments,
        },
    };
}
