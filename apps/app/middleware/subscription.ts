import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function checkSubscriptionAccess(
  organizationId: string,
  feature: string
) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });

    // Si pas de souscription, accès limité
    if (!subscription || subscription.status !== "active") {
      return {
        hasAccess: false,
        reason: "No active subscription",
        upgradeRequired: true,
      };
    }

    // Vérifier si la fonctionnalité est incluse dans le plan
    const planFeatures = subscription.plan.features as string[];
    if (!planFeatures.includes(feature)) {
      return {
        hasAccess: false,
        reason: "Feature not included in current plan",
        upgradeRequired: true,
      };
    }

    return { hasAccess: true };
  } catch (error) {
    console.error("Error checking subscription access:", error);
    return {
      hasAccess: false,
      reason: "Error checking subscription",
      upgradeRequired: false,
    };
  }
}

export async function checkUsageLimits(organizationId: string) {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const [subscription, usage] = await Promise.all([
      prisma.subscription.findUnique({
        where: { organizationId },
        include: { plan: true },
      }),
      prisma.usageTracking.findUnique({
        where: {
          organizationId_month_year: {
            organizationId,
            month: currentMonth,
            year: currentYear,
          },
        },
      }),
    ]);

    if (!subscription || subscription.status !== "active") {
      return { withinLimits: false, reason: "No active subscription" };
    }

    const currentUsage = usage || {
      missionsCreated: 0,
      responsesCount: 0,
      usersCount: 0,
    };

    const plan = subscription.plan;

    // Vérifier les limites
    const limits = {
      missions:
        plan.maxMissions === -1
          ? Number.POSITIVE_INFINITY
          : plan.maxMissions || 0,
      users:
        plan.maxUsers === -1 ? Number.POSITIVE_INFINITY : plan.maxUsers || 0,
      responses:
        plan.maxResponses === -1
          ? Number.POSITIVE_INFINITY
          : plan.maxResponses || 0,
    };

    const withinLimits = {
      missions: currentUsage.missionsCreated < limits.missions,
      users: currentUsage.usersCount < limits.users,
      responses: currentUsage.responsesCount < limits.responses,
    };

    return {
      withinLimits: Object.values(withinLimits).every(Boolean),
      limits,
      currentUsage,
      details: withinLimits,
    };
  } catch (error) {
    console.error("Error checking usage limits:", error);
    return { withinLimits: false, reason: "Error checking limits" };
  }
}
