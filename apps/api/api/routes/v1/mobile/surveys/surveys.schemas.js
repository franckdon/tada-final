"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.surveyDetailsQuerySchema = exports.surveysListQuerySchema = void 0;
const zod_1 = require("zod");
const truthy = new Set(["1", "true", "yes", "y", "on"]);
const falsy = new Set(["0", "false", "no", "n", "off"]);
function toBool(v) {
    if (typeof v !== "string")
        return v;
    const s = v.trim().toLowerCase();
    if (truthy.has(s))
        return true;
    if (falsy.has(s))
        return false;
    return v;
}
exports.surveysListQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    // search
    q: zod_1.z.string().trim().min(1).max(200).optional(),
    // sorting
    sortBy: zod_1.z.enum(["createdAt", "updatedAt", "name"]).default("createdAt"),
    sortDir: zod_1.z.enum(["asc", "desc"]).default("desc"),
    // include payload
    includeQuestions: zod_1.z.preprocess(toBool, zod_1.z.boolean()).default(false),
});
exports.surveyDetailsQuerySchema = zod_1.z.object({
    includeQuestions: zod_1.z.preprocess(toBool, zod_1.z.boolean()).default(true),
});
