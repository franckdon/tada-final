// lib/subscription/utils.ts
import { prisma } from "@/lib/prisma";

export async function findSubscriptionPlanById(planId: string) {
  if (!planId) {
    throw new Error("planId est requis mais est undefined");
  }

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  return plan;
}
