"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationSchema = exports.listNotificationsQuerySchema = exports.notificationTypeEnum = void 0;
const zod_1 = require("zod");
const truthy = new Set(["1", "true", "yes", "y", "on"]);
const falsy = new Set(["0", "false", "no", "n", "off"]);
function parseBool(v) {
    if (typeof v === "boolean")
        return v;
    if (typeof v !== "string")
        return undefined;
    const s = v.trim().toLowerCase();
    if (truthy.has(s))
        return true;
    if (falsy.has(s))
        return false;
    return undefined;
}
exports.notificationTypeEnum = zod_1.z.enum(["mission", "payment", "system", "support", "comment"]);
exports.listNotificationsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    unreadOnly: zod_1.z.preprocess((v) => parseBool(v) ?? false, zod_1.z.boolean()).default(false),
    type: exports.notificationTypeEnum.optional(),
    // polymorphic filters
    entityType: zod_1.z.string().trim().min(1).max(30).optional(),
    entityId: zod_1.z.string().trim().min(1).max(80).optional(),
    createdFrom: zod_1.z.coerce.date().optional(),
    createdTo: zod_1.z.coerce.date().optional(),
    sortDir: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
exports.createNotificationSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(), // qui reçoit la notif (admin/backoffice)
    type: exports.notificationTypeEnum,
    title: zod_1.z.string().trim().min(1).max(200),
    body: zod_1.z.string().trim().min(0).max(2000).optional(),
    data: zod_1.z.any().optional(),
    entityType: zod_1.z.string().trim().min(1).max(50).optional(),
    entityId: zod_1.z.string().trim().min(1).max(100).optional(),
});
