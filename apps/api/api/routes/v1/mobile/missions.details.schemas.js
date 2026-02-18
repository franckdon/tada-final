"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missionDetailsQuerySchema = void 0;
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
exports.missionDetailsQuerySchema = zod_1.z.object({
    includeOrganization: zod_1.z.preprocess(toBool, zod_1.z.boolean()).default(false),
    includeWorkspace: zod_1.z.preprocess(toBool, zod_1.z.boolean()).default(false),
    includeCharts: zod_1.z.preprocess(toBool, zod_1.z.boolean()).default(false),
    includeComments: zod_1.z.preprocess(toBool, zod_1.z.boolean()).default(false),
});
