"use server";

import { prisma } from "@/lib/prisma";
import { authActionClient } from "@/actions/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const sendNowSchema = z.object({
  campaignId: z.string().uuid(),
});

type Targeting = {
  audience?: "all" | "contributors" | "clients";
  countries?: string[]; // contributors by country
  planCodes?: string[]; // clients by plan
  activeContributorsOnly?: boolean;
};

function uniqLower(arr: string[]) {
  const m = new Map<string, string>();
  for (const s of arr) {
    const k = s.toLowerCase();
    if (!m.has(k)) m.set(k, s);
  }
  return Array.from(m.values());
}

export const sendNotificationCampaignAction = authActionClient
  .schema(sendNowSchema)
  .metadata({ name: "send-notification-campaign-action" })
  .action(async ({ parsedInput }) => {
    const { campaignId } = parsedInput;

    // 1) lock campaign + validate
    const campaign = await prisma.notificationCampaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        title: true,
        body: true,
        data: true,
        channels: true,
        targeting: true,
        status: true,
        scheduledAt: true,
      },
    });

    if (!campaign) throw new Error("Campaign introuvable");

    if (!["draft", "scheduled"].includes(campaign.status)) {
      throw new Error(`Impossible d'envoyer: status=${campaign.status}`);
    }

    const channels = (campaign.channels ?? {}) as any;
    const targeting = (campaign.targeting ?? {}) as Targeting;

    if (!channels.push && !channels.web) {
      throw new Error("Aucun canal activé (push/web).");
    }

    // 2) set sending (optimistic lock simple)
    await prisma.notificationCampaign.update({
      where: { id: campaignId },
      data: { status: "sending", scheduledAt: null },
    });

    // 3) compute recipients
    // ⚠️ Ici on fait un ciblage minimal compatible avec ton schéma actuel.
    // - contributors = role contains "contributor" (à adapter si tu as un enum/role strict)
    // - clients = users ayant un workspace plan subscription (via workspace membership/ownership selon ton modèle)
    //
    // Si tu as déjà une logique “contributor actif”, on utilisera un critère fiable:
    // ex: missionAssignmentsAsContributor some completed/started dans les X jours.

    const audience = targeting.audience ?? "all";
    const countries = uniqLower(targeting.countries ?? []);
    const planCodes = uniqLower(targeting.planCodes ?? []);
    const activeOnly = Boolean(targeting.activeContributorsOnly);

    // Base users query (à affiner selon tes règles)
    // NOTE: ton User.role est String? donc je fais un contains.
    const userWhere: any = {};

    if (audience === "contributors") {
      userWhere.role = { contains: "contributor", mode: "insensitive" };
    } else if (audience === "clients") {
      userWhere.NOT = { role: { contains: "contributor", mode: "insensitive" } };
    }

    if (countries.length > 0) {
      userWhere.country = { in: countries };
    }

    // “clients par plan” : basé sur WorkspacePlanSubscription.planCode
    // On prend les users liés à un workspace (owner ou member) ayant un plan matching.
    // Tu peux ajuster si “client” = owner uniquement.
    let userIdsByPlan: string[] | null = null;

    if (planCodes.length > 0) {
      const ws = await prisma.workspacePlanSubscription.findMany({
        where: { planCode: { in: planCodes }, status: "active" },
        select: { workspaceId: true },
      });

      const workspaceIds = ws.map((x) => x.workspaceId);
      if (workspaceIds.length === 0) userIdsByPlan = [];
      else {
        const members = await prisma.workspaceMember.findMany({
          where: { workspaceId: { in: workspaceIds }, status: "active" },
          select: { userId: true },
        });

        const owners = await prisma.workspace.findMany({
          where: { id: { in: workspaceIds } },
          select: { ownerId: true },
        });

        userIdsByPlan = uniqLower([
          ...members.map((m) => m.userId),
          ...owners.map((o) => o.ownerId),
        ]);
      }

      userWhere.id = { in: userIdsByPlan };
    }

    // “contributeurs actifs seulement”
    // Heuristique simple: a une missionAssignment dans les 60 derniers jours.
    // Ajuste si tu as une meilleure source (lastSeenAt via PushDevice, etc.)
    if (audience !== "clients" && activeOnly) {
      const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      userWhere.missionAssignmentsAsContributor = {
        some: { updatedAt: { gte: since } },
      };
    }

    const users = await prisma.user.findMany({
      where: userWhere,
      select: { id: true },
      take: 200000, // garde-fou
    });

    const userIds = users.map((u) => u.id);

    // 4) upsert recipients rows (fan-out table)
    if (userIds.length > 0) {
      // Create many recipients (ignore duplicates thanks to unique)
      await prisma.notificationRecipient.createMany({
        data: userIds.map((userId) => ({
          campaignId,
          userId,
          pushStatus: channels.push ? "queued" : "skipped",
          webStatus: channels.web ? "queued" : "skipped",
        })),
        skipDuplicates: true,
      });

      // 5) Inbox notifications (web popup / in-app list)
      // On crée des lignes dans `notification` pour chaque user (si web)
      if (channels.web) {
        await prisma.notification.createMany({
          data: userIds.map((userId) => ({
            userId,
            campaignId,
            type: "system",
            title: campaign.title,
            body: campaign.body,
            data: campaign.data ?? undefined,
          })),
        });

        await prisma.notificationRecipient.updateMany({
          where: { campaignId },
          data: { inboxCreatedAt: new Date(), webStatus: "sent", webSentAt: new Date() },
        });
      }

      // 6) Push: ici on ne peut pas “envoyer” sans provider (FCM/APNs).
      // On marque “queued” et on laissera un worker/edge-function consommer PushDevice tokens.
      // Si tu as déjà un service push, c’est là qu’on l’appelle.
      if (channels.push) {
        // Exemple: on laisse queued (et un worker fera send + pushStatus sent/failed)
      }
    }

    // 7) done
    await prisma.notificationCampaign.update({
      where: { id: campaignId },
      data: { status: "sent" },
    });

    revalidatePath("/notifications");
    return { success: true, data: { recipients: userIds.length } };
  });
