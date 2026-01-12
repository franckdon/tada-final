import { z } from "zod";

const truthy = new Set(["1", "true", "yes", "y", "on"]);
const falsy = new Set(["0", "false", "no", "n", "off"]);

function toBool(v: unknown): unknown {
  if (typeof v !== "string") return v;
  const s = v.trim().toLowerCase();
  if (truthy.has(s)) return true;
  if (falsy.has(s)) return false;
  return v; // laisse Zod gérer si valeur invalide
}

export const missionDetailsQuerySchema = z.object({
  includeOrganization: z.preprocess(toBool, z.boolean()).default(false),
  includeWorkspace: z.preprocess(toBool, z.boolean()).default(false),
  includeCharts: z.preprocess(toBool, z.boolean()).default(false),
  includeComments: z.preprocess(toBool, z.boolean()).default(false),
});

export type MissionDetailsQuery = z.infer<typeof missionDetailsQuerySchema>;
