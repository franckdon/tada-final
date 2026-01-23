"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missionsListQuerySchema = void 0;
const zod_1 = require("zod");
const truthy = new Set(["1", "true", "yes", "y", "on"]);
const falsy = new Set(["0", "false", "no", "n", "off"]);
function parseBool(v) {
    if (typeof v !== "string")
        return undefined;
    const s = v.trim().toLowerCase();
    if (truthy.has(s))
        return true;
    if (falsy.has(s))
        return false;
    return undefined;
}
function parseIntSafe(v) {
    if (typeof v !== "string")
        return undefined;
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : undefined;
}
function parseDateSafe(v) {
    if (typeof v !== "string")
        return undefined;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
}
const StatusEnum = zod_1.z.enum(["draft", "live", "completed", "on hold"]);
const TypeEnum = zod_1.z.enum(["survey", "contributor-info"]);
const ModeEnum = zod_1.z.enum(["manual", "ai", "contributor-info", "template"]);
const SortByEnum = zod_1.z.enum(["createdAt", "updatedAt", "publishAt", "name"]);
const SortDirEnum = zod_1.z.enum(["asc", "desc"]);
exports.missionsListQuerySchema = zod_1.z
    .object({
    page: zod_1.z.string().optional().transform((v) => parseIntSafe(v) ?? 1),
    pageSize: zod_1.z.string().optional().transform((v) => parseIntSafe(v) ?? 20),
    q: zod_1.z.string().optional().transform((v) => (typeof v === "string" ? v.trim() : undefined)),
    status: zod_1.z.string().optional().transform((v) => v?.trim()).pipe(StatusEnum.optional()),
    internal: zod_1.z.string().optional().transform((v) => parseBool(v)),
    type: zod_1.z.string().optional().transform((v) => v?.trim()).pipe(TypeEnum.optional()),
    isPublic: zod_1.z.string().optional().transform((v) => parseBool(v)),
    isSuperAdminMission: zod_1.z.string().optional().transform((v) => parseBool(v)),
    // API name "isPublished" -> DB column "isPublish"
    isPublished: zod_1.z.string().optional().transform((v) => parseBool(v)),
    mode: zod_1.z.string().optional().transform((v) => v?.trim()).pipe(ModeEnum.optional()),
    validationStatus: zod_1.z.string().optional().transform((v) => (v ? v.trim() : undefined)),
    publishAt: zod_1.z.string().optional().transform((v) => parseDateSafe(v)),
    publishFrom: zod_1.z.string().optional().transform((v) => parseDateSafe(v)),
    publishTo: zod_1.z.string().optional().transform((v) => parseDateSafe(v)),
    organizationId: zod_1.z.string().optional().transform((v) => (v ? v.trim() : undefined)),
    workspaceId: zod_1.z.string().optional().transform((v) => (v ? v.trim() : undefined)),
    sortBy: SortByEnum.optional().default("createdAt"),
    sortDir: SortDirEnum.optional().default("desc"),
    zone: zod_1.z.string().optional().transform((v) => (v ? v.trim() : undefined)),
})
    .transform((q) => {
    const page = Math.max(1, q.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, q.pageSize ?? 20));
    return { ...q, page, pageSize };
});
