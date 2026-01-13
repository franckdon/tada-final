import { z } from "zod";

const truthy = new Set(["1", "true", "yes", "y", "on"]);
const falsy = new Set(["0", "false", "no", "n", "off"]);

function parseBool(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (typeof v !== "string") return undefined;
  const s = v.trim().toLowerCase();
  if (truthy.has(s)) return true;
  if (falsy.has(s)) return false;
  return undefined;
}

export const notificationTypeEnum = z.enum(["mission", "payment", "system", "support", "comment"]);

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),

  unreadOnly: z.preprocess((v) => parseBool(v) ?? false, z.boolean()).default(false),
  type: notificationTypeEnum.optional(),

  // polymorphic filters
  entityType: z.string().trim().min(1).max(30).optional(),
  entityId: z.string().trim().min(1).max(80).optional(),

  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),

  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

export const createNotificationSchema = z.object({
  userId: z.string().uuid(), // qui reçoit la notif (admin/backoffice)
  type: notificationTypeEnum,
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(0).max(2000).optional(),
  data: z.any().optional(),
  entityType: z.string().trim().min(1).max(50).optional(),
  entityId: z.string().trim().min(1).max(100).optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
