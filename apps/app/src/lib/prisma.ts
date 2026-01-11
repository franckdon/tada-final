import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

console.log("NODE_ENV =", process.env.NODE_ENV);

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

if (process.env.NODE_ENV !== "production") {
    prismaClient.$on("query", (e) => {
      const q = e.query.toLowerCase();
      if (q.includes('"mission"') || q.includes('"survey"') || q.includes('"response"')) {
        console.log("prisma:query", e.query);
        console.log("prisma:params", e.params);
        console.log("prisma:duration(ms)", e.duration);
      }
    });

  global.prisma = prismaClient;
}

export const prisma = prismaClient;
