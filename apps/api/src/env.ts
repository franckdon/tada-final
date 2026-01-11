import { z } from "zod";

export const env = z.object({
  API_PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string().min(10),

  MOBILE_JWT_SECRET: z.string().min(32),
  MOBILE_ACCESS_TTL_SECONDS: z.coerce.number().default(900),
  MOBILE_REFRESH_TTL_DAYS: z.coerce.number().default(30),

  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLIC_BASE: z.string().url(),
  SUPABASE_STORAGE_BUCKET: z.string().min(1),

  // IMPORTANT : il te faut la clé admin (service role) pour upload server-side
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  APP_URL: z.string().default("http://localhost:3000"),
  NODE_ENV: z.string().optional(),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_EMAIL: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  
}).parse(process.env);
