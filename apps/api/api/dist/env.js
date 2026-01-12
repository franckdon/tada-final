"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
exports.env = zod_1.z.object({
    API_PORT: zod_1.z.coerce.number().default(4000),
    DATABASE_URL: zod_1.z.string().min(10),
    MOBILE_JWT_SECRET: zod_1.z.string().min(32),
    MOBILE_ACCESS_TTL_SECONDS: zod_1.z.coerce.number().default(900),
    MOBILE_REFRESH_TTL_DAYS: zod_1.z.coerce.number().default(30),
    SUPABASE_URL: zod_1.z.string().url(),
    SUPABASE_PUBLIC_BASE: zod_1.z.string().url(),
    SUPABASE_STORAGE_BUCKET: zod_1.z.string().min(1),
    // IMPORTANT : il te faut la clé admin (service role) pour upload server-side
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().min(1),
    APP_URL: zod_1.z.string().default("http://localhost:3000"),
    NODE_ENV: zod_1.z.string().optional(),
    SMTP_HOST: zod_1.z.string().min(1),
    SMTP_PORT: zod_1.z.coerce.number().default(465),
    SMTP_EMAIL: zod_1.z.string().min(1),
    SMTP_PASSWORD: zod_1.z.string().min(1),
    SEND_EMAILS: zod_1.z.string().default("true"),
}).parse(process.env);
