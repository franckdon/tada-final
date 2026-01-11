import { z } from "zod";

export const updateOrganizationSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  logo: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  status: z.string().optional(),
  id: z.string(),
});
