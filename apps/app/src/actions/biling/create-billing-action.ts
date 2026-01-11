// src/actions/biling/create-billing-action.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authActionClient } from "../safe-action";
import { createBillingInfoSchema } from "../missions/schema";

export const createBillingAction = authActionClient
  .schema(createBillingInfoSchema)
  .metadata({ name: "create-billing-action" })
  .action(async ({ parsedInput }) => {
    const {
      credits,
      street,
      city,
      zip,
      country,
      company,
      civility,
      firstName,
      lastName,
      acceptTerms,
      organizationId,
    } = parsedInput;

    try {
      const billingInfo = await prisma.billingInfo.upsert({
        where: { organizationId: organizationId },
        update: {
          organizationId: organizationId,
          credits: credits,
          street: street ?? null,
          city: city ?? null,
          zip: zip ?? null,
          country: country,
          company: company,
          civility: civility ?? "m",
          firstName: firstName,
          lastName: lastName,
          acceptTerms: acceptTerms,
        },
        create: {
          organizationId: organizationId,
          credits: credits,
          street: street ?? null,
          city: city ?? null,
          zip: zip ?? null,
          country: country,
          company: company,
          civility: civility ?? "m",
          firstName: firstName,
          lastName: lastName,
          acceptTerms: acceptTerms,
        },
      });

      revalidatePath("/api/billing/get-one");

      return {
        success: true,
        billingInfo,
      };
    } catch (error) {
      console.error("[CREATE_BILLING_ACTION_ERROR]", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  });
