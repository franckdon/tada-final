import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Redact DATABASE_URL to avoid leaking credentials in logs.
 */
function redactDatabaseUrl(url: string) {
  // ex: postgresql://user:pass@host:5432/db?schema=public
  return url.replace(/:\/\/([^@]+)@/, "://***@");
}

function shouldDebug() {
  return process.env.NODE_ENV !== "production" || process.env.PRISMA_DEBUG === "1";
}

/**
 * Identify if the query is relevant to the current investigation.
 * You can extend this list as needed.
 */
function isRelevantQuery(qLower: string) {
  return (
    qLower.includes('"workspace_credit_purchase"') ||
    qLower.includes("workspace_credit_purchase") ||
    qLower.includes('"workspacecreditpurchase"') ||
    qLower.includes("workspacecreditpurchase") ||
    qLower.includes("credits/purchase") ||
    // Keep your existing filters if you still want them:
    qLower.includes('"mission"') ||
    qLower.includes('"survey"') ||
    qLower.includes('"response"')
  );
}

console.log("NODE_ENV =", process.env.NODE_ENV);
console.log("[prisma] cwd:", process.cwd());
console.log("[prisma] DATABASE_URL =", redactDatabaseUrl(connectionString));
console.log(
  "[prisma] DATABASE_URL startsWith:",
  (connectionString ?? "").slice(0, 30),
);

const prismaClient =
  global.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: connectionString },
    },
    log:
      process.env.NODE_ENV === "production"
        ? [{ emit: "stdout", level: "error" }]
        : [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "warn" },
            { emit: "stdout", level: "error" },
          ],
  });

/**
 * One-time DB context dump at boot (dev only)
 * Helps confirm: DB name, schema, user, search_path (common source of weirdness).
 */
async function dumpDbContextOnce() {
  if (!shouldDebug()) return;

  try {
    const rows = await prismaClient.$queryRaw<
      Array<{
        db: string;
        schema: string;
        user: string;
        search_path: string;
      }>
    >`
      select
        current_database() as db,
        current_schema() as schema,
        current_user as user,
        current_setting('search_path') as search_path
    `;

    console.log("[prisma][db-context]", rows?.[0]);
  } catch (err) {
    console.log("[prisma][db-context] failed", err);
  }
}

/**
 * Optional helper you can call from your route handlers too:
 *   await prismaDebug.debugDbContext("initialize.route");
 */
export async function debugDbContext(tag = "debug") {
  try {
    const rows = await prismaClient.$queryRaw<
      Array<{
        db: string;
        schema: string;
        user: string;
        search_path: string;
        now: string;
      }>
    >`
      select
        current_database() as db,
        current_schema() as schema,
        current_user as user,
        current_setting('search_path') as search_path,
        now()::text as now
    `;

    console.log(`[prisma][${tag}][db-context]`, rows?.[0]);
  } catch (err) {
    console.log(`[prisma][${tag}][db-context] failed`, err);
  }
}

if (shouldDebug()) {
  // Query logs (filtered)
  prismaClient.$on("query", (e) => {
    const qLower = e.query.toLowerCase();
    if (!isRelevantQuery(qLower)) return;

    console.log("\n[prisma:query]", e.query);
    console.log("[prisma:params]", e.params);
    console.log("[prisma:duration(ms)]", e.duration);
  });

  // Error logs (include Prisma known error codes if available)
  prismaClient.$on("error", (e) => {
    console.log("\n[prisma:error]", e.message);
  });

  // Cache in dev to avoid too many connections in Next.js hot reload
  global.prisma = prismaClient;

  // Boot-time context dump (non-blocking)
  // Note: fire-and-forget is okay here; it only logs context.
  void dumpDbContextOnce();
}

export const prisma = prismaClient;
