// src/lib/prisma.ts
import "server-only";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function redactDatabaseUrl(url: string) {
  return url.replace(/:\/\/([^@]+)@/, "://***@");
}

function shouldDebug() {
  return process.env.NODE_ENV !== "production" || process.env.PRISMA_DEBUG === "1";
}

const prismaClient =
  global.prisma ??
  new PrismaClient({
    datasources: { db: { url: connectionString } },
    log:
      process.env.NODE_ENV === "production"
        ? [{ emit: "stdout", level: "error" }]
        : [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "warn" },
            { emit: "stdout", level: "error" },
          ],
  });

// ✅ IMPORTANT : cache global en dev (sinon nouveau client à chaque HMR)
if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaClient;
}

// (optionnel) un seul dump au boot pour debug
let didDump = false;
async function dumpDbContextOnce() {
  if (!shouldDebug() || didDump) return;
  didDump = true;

  try {
    const rows = await prismaClient.$queryRaw<
      Array<{ db: string; schema: string; user: string; search_path: string }>
    >`
      select
        current_database() as db,
        current_schema() as schema,
        current_user as user,
        current_setting('search_path') as search_path
    `;
    console.log("[prisma][db-context]", rows?.[0], redactDatabaseUrl(connectionString));
  } catch (err) {
    console.log("[prisma][db-context] failed", err);
  }
}

dumpDbContextOnce().catch(() => {});

export const prisma = prismaClient;
