// app/api/workspaces/[workspaceId]/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { assertWorkspaceAdmin } from "@/lib/workspaces";
import { transporter } from "@/lib/transporter";
import {
  getPlanLimits,
  isUnlimited,
  isCustom,
  type PlanCode,
} from "@/lib/plans/plan-limits";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

function planLabelToPlanCode(label?: string | null): PlanCode | null {
  if (!label) return null;
  const v = label.trim().toLowerCase();

  if (v.includes("starter")) return "starter";
  if (v.includes("growth")) return "growth";
  if (v.includes("business")) return "business";
  if (v.includes("entre")) return "entreprise";
  return null;
}

/**
 * IMPORTANT:
 * Ici, on suppose que tu as une relation Prisma:
 *   workspace.subscription.planLabel
 * Si dans ton schéma c'est différent (organization.subscription, workspace.planCode, etc.),
 * remplace juste le findUnique/select ci-dessous.
 */
async function getWorkspacePlanCode(workspaceId: string): Promise<PlanCode | null> {
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      workspacePlanSubscription: {
        select: {
          planCode: true,
          status: true,
        },
      },
    },
  });

  const planLabel = ws?.workspacePlanSubscription?.planCode ?? null;
  const status = ws?.workspacePlanSubscription?.status ?? null;

  // Si tu veux être strict: n'accepter que "active"
  // (sinon, commente ce bloc)
  if (status && status !== "active") return null;

  return planLabelToPlanCode(planLabel);
}

async function countUsedSeats(workspaceId: string): Promise<number> {
  const [activeMembers, pendingInvites] = await Promise.all([
    prisma.workspaceMember.count({
      where: { workspaceId, status: "active" },
    }),
    prisma.workspaceInvitation.count({
      where: { workspaceId, status: "pending" },
    }),
  ]);

  return activeMembers + pendingInvites;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, role } = body as { email: string; role?: string };

    if (!email) {
      return NextResponse.json(
        { error: "L'email est obligatoire" },
        { status: 400 },
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace introuvable" },
        { status: 404 },
      );
    }

    // Vérif admin/owner
    try {
      await assertWorkspaceAdmin(workspaceId, user.id);
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /**
     * ✅ Seat limit enforcement (source de vérité backend)
     * Règle: si pas de forfait -> impossible d'ajouter quelqu'un
     * Règle: si limite atteinte -> impossible d'ajouter
     */
    const planCode = await getWorkspacePlanCode(workspaceId);
    if (!planCode) {
      return NextResponse.json(
        {
          error: "Aucun forfait actif. Vous ne pouvez pas ajouter de membres.",
          code: "NO_PLAN",
        },
        { status: 403 },
      );
    }

    const seatsLimit = getPlanLimits(planCode).userSeats;
    const usedSeats = await countUsedSeats(workspaceId);

    if (!isUnlimited(seatsLimit) && !isCustom(seatsLimit)) {
      if (usedSeats >= seatsLimit) {
        return NextResponse.json(
          {
            error: "Limite de sièges atteinte pour ce forfait.",
            code: "SEAT_LIMIT_REACHED",
            meta: { used: usedSeats, limit: seatsLimit, planCode },
          },
          { status: 403 },
        );
      }
    }

    // Vérif utilisateur existant / déjà membre
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      const existingMembership = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: existingUser.id,
          status: "active",
        },
      });

      if (existingMembership) {
        return NextResponse.json(
          { error: "Cet utilisateur est déjà membre du workspace" },
          { status: 400 },
        );
      }
    }

    // Optionnel: éviter de spammer plusieurs invitations pending pour le même email
    const existingPendingInvite = await prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        email,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    if (existingPendingInvite) {
      return NextResponse.json(
        { error: "Une invitation est déjà en attente pour cet email" },
        { status: 400 },
      );
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        email,
        role: role || "member",
        token,
        status: "pending",
        expiresAt,
        invitedById: user.id,
      },
    });

    const inviteUrl = `${APP_URL}/fr/invitations/accept?token=${token}`;

    console.log("====================================");
    console.log("🔐 Email confirm link (LOCAL) :");
    console.log(inviteUrl);
    console.log("====================================");

    try {
      await transporter.sendMail({
        from: "no-reply@monrezo.net",
        to: [email],
        subject: `[Tada] Invitation à rejoindre un workspace`,
        html: `
          <p>Bonjour,</p>
          <p>${user.name || user.email} vous a invité à rejoindre le workspace <b>${workspace.name}</b> sur Tada.</p>
          <p>Cliquez sur le lien ci-dessous pour accepter l'invitation :</p>
          <p><a href="${inviteUrl}">${inviteUrl}</a></p>
          <p>Ce lien expire le ${expiresAt.toLocaleDateString("fr-FR")}.</p>
        `,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email d'invitation :", error);
      // On ne bloque pas la création de l'invitation si l'email échoue.
    }

    return NextResponse.json(
      {
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          ...(process.env.NODE_ENV !== "production" && { token: invitation.token }),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur /api/workspaces/[workspaceId]/invite", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérif admin/owner
    try {
      await assertWorkspaceAdmin(workspaceId, user.id);
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const invitationId = body?.invitationId as string | undefined;

    if (!invitationId) {
      return NextResponse.json(
        { error: "invitationId est requis" },
        { status: 400 },
      );
    }

    const invitation = await prisma.workspaceInvitation.findFirst({
      where: { id: invitationId, workspaceId },
      select: { id: true },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation introuvable" },
        { status: 404 },
      );
    }

    await prisma.workspaceInvitation.delete({
      where: { id: invitationId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erreur DELETE /api/workspaces/[workspaceId]/invite", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
