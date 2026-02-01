import { z } from "zod";

/* -------------------- */
/* Sub-schemas */
/* -------------------- */

export const channelsSchema = z.object({
  push: z.boolean().optional().default(false),
  web: z.boolean().optional().default(false),
});

export const targetingSchema = z.object({
  // ✅ important: valeur attendue par ton backend = all | contributors | clients
  audience: z.enum(["all", "contributors", "clients"]).default("all"),

  // contributors only
  countries: z.array(z.string().min(2)).optional().default([]),
  activeOnly: z.boolean().optional().default(false),
  activeDays: z.number().int().min(1).max(365).optional().default(30),

  // clients only
  planCodes: z.array(z.string().min(1)).optional().default([]),
});

/* -------------------- */
/* Base object (extendable) */
/* -------------------- */

const campaignBaseSchema = z.object({
  type: z.string().default("system"),
  title: z.string().min(1),
  body: z.string().optional().nullable(),
  data: z.any().optional(),

  channels: channelsSchema,
  targeting: targetingSchema,

  scheduledAt: z.date().optional().nullable(),
});

/* -------------------- */
/* Cross-field validations (reusable) */
/* -------------------- */

function withCampaignRules<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((val: any, ctx) => {
    const channels = val?.channels;
    const targeting = val?.targeting;

    // 1) Au moins un canal
    if (!channels?.push && !channels?.web) {
      ctx.addIssue({
        code: "custom",
        path: ["channels"],
        message: "Au moins un canal doit être activé (push ou web).",
      });
    }

    // 2) Contributors-only fields
    if (targeting?.audience !== "contributors") {
      if ((targeting?.countries?.length ?? 0) > 0) {
        ctx.addIssue({
          code: "custom",
          path: ["targeting", "countries"],
          message:
            "Le ciblage par pays est autorisé uniquement pour les contributeurs.",
        });
      }

      if (targeting?.activeOnly) {
        ctx.addIssue({
          code: "custom",
          path: ["targeting", "activeOnly"],
          message: "activeOnly est autorisé uniquement pour les contributeurs.",
        });
      }
    }

    // 3) Clients-only fields
    if (targeting?.audience !== "clients") {
      if ((targeting?.planCodes?.length ?? 0) > 0) {
        ctx.addIssue({
          code: "custom",
          path: ["targeting", "planCodes"],
          message: "Le ciblage par plan est autorisé uniquement pour les clients.",
        });
      }
    }
  });
}

/* -------------------- */
/* Exported schemas */
/* -------------------- */

// ✅ Extend possible because base is a ZodObject
export const createCampaignSchema = withCampaignRules(campaignBaseSchema);

export const updateCampaignSchema = withCampaignRules(
  campaignBaseSchema.extend({
    campaignId: z.string().uuid(),
  }),
);

export const deleteCampaignSchema = z.object({
  campaignId: z.string().uuid(),
});

export const scheduleCampaignSchema = z.object({
  campaignId: z.string().uuid(),
  scheduledAt: z.date().nullable(), // null => unschedule
});

export const sendCampaignSchema = z.object({
  campaignId: z.string().uuid(),
});
