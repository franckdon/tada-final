// src/lib/prisma/serialize.ts
import { Prisma } from "@prisma/client";

/**
 * Convertit les types non-serializables (Decimal, Date, BigInt, etc.)
 * en types JSON-friendly (number/string).
 *
 * - Decimal -> number (ou string si tu préfères)
 * - Date -> ISO string
 * - BigInt -> string
 */
export function serializePrisma<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => {
      // Prisma.Decimal
      if (v && typeof v === "object" && v.constructor?.name === "Decimal") {
        // option 1: number
        return Number(v);
        // option 2: string (si tu veux éviter les soucis de précision)
        // return v.toString();
      }

      // Date
      if (v instanceof Date) {
        return v.toISOString();
      }

      // BigInt
      if (typeof v === "bigint") {
        return v.toString();
      }

      return v;
    }),
  );
}
