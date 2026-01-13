import { z } from "zod";

const truthy = new Set(["1", "true", "yes", "y", "on"]);
const falsy = new Set(["0", "false", "no", "n", "off"]);

function parseBool(v: unknown): boolean | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim().toLowerCase();
  if (truthy.has(s)) return true;
  if (falsy.has(s)) return false;
  return undefined;
}

function parseIntSafe(v: unknown): number | undefined {
  if (typeof v !== "string") return undefined;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}

function parseDateSafe(v: unknown): Date | undefined {
  if (typeof v !== "string") return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

const StatusEnum = z.enum(["draft", "live", "completed", "on hold"]);
const TypeEnum = z.enum(["survey", "contributor-info"]);
const ModeEnum = z.enum(["manual", "ai", "contributor-info", "template"]);
const SortByEnum = z.enum(["createdAt", "updatedAt", "publishAt", "name"]);
const SortDirEnum = z.enum(["asc", "desc"]);

export const missionsListQuerySchema = z
  .object({
    page: z.string().optional().transform((v) => parseIntSafe(v) ?? 1),
    pageSize: z.string().optional().transform((v) => parseIntSafe(v) ?? 20),

    q: z.string().optional().transform((v) => (typeof v === "string" ? v.trim() : undefined)),

    status: z.string().optional().transform((v) => v?.trim()).pipe(StatusEnum.optional()),
    internal: z.string().optional().transform((v) => parseBool(v)),
    type: z.string().optional().transform((v) => v?.trim()).pipe(TypeEnum.optional()),

    isPublic: z.string().optional().transform((v) => parseBool(v)),
    isSuperAdminMission: z.string().optional().transform((v) => parseBool(v)),

    // API name "isPublished" -> DB column "isPublish"
    isPublished: z.string().optional().transform((v) => parseBool(v)),

    mode: z.string().optional().transform((v) => v?.trim()).pipe(ModeEnum.optional()),

    validationStatus: z.string().optional().transform((v) => (v ? v.trim() : undefined)),

    publishAt: z.string().optional().transform((v) => parseDateSafe(v)),
    publishFrom: z.string().optional().transform((v) => parseDateSafe(v)),
    publishTo: z.string().optional().transform((v) => parseDateSafe(v)),

    organizationId: z.string().optional().transform((v) => (v ? v.trim() : undefined)),
    workspaceId: z.string().optional().transform((v) => (v ? v.trim() : undefined)),

    sortBy: SortByEnum.optional().default("createdAt"),
    sortDir: SortDirEnum.optional().default("desc"),

    zone: z.string().optional().transform((v) => (v ? v.trim() : undefined)),
  })
  .transform((q) => {
    const page = Math.max(1, q.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, q.pageSize ?? 20));
    return { ...q, page, pageSize };
  });

export type MissionsListQuery = z.infer<typeof missionsListQuerySchema>;
