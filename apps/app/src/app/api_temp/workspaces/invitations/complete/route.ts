import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const runtime = "nodejs";

const BodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string().min(1),
});

function forwardSetCookies(from: Headers, to: NextResponse) {
  const anyHeaders = from as any;

  const cookies: string[] =
    typeof anyHeaders.getSetCookie === "function"
      ? anyHeaders.getSetCookie()
      : from.get("set-cookie")
        ? [from.get("set-cookie") as string]
        : [];

  for (const cookie of cookies) {
    if (cookie) to.headers.append("set-cookie", cookie);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { token, password, confirmPassword } = parsed.data;

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Les mots de passe ne correspondent pas" },
        { status: 400 },
      );
    }

    // 1) Charger + valider l'invitation
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: { workspace: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "Cette invitation n'est plus valide" }, { status: 400 });
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: "expired" },
      });
      return NextResponse.json({ error: "Cette invitation a expiré" }, { status: 400 });
    }

    const workspaceOrgId = invitation.workspace.organizationId ?? null;

    // 2) Si user existe déjà => flow "existing account"
    const existing = await prisma.user.findUnique({
      where: { email: invitation.email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email. Connecte-toi pour accepter l’invitation." },
        { status: 409 },
      );
    }

    // 3) Sign-up Better Auth
    const signUpResult = await auth.api.signUpEmail({
      returnHeaders: true,
      body: {
        email: invitation.email,
        password,
        name: invitation.email.split("@")[0] || "User",
      },
    });

    const signUpHeaders = (signUpResult as any).headers as Headers | undefined;
    const signUpResponse = (signUpResult as any).response as any;

    const userId: string | undefined = signUpResponse?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Création du compte échouée (user manquant)" },
        { status: 500 },
      );
    }

    // 4) emailVerified = true
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    // 5) Si le workspace appartient à une org => s'assurer que le user est membre de l'org
    // IMPORTANT: ton modèle Member n’a pas de @@unique([organizationId,userId]) et createdAt n’a pas @default
    if (workspaceOrgId) {
      const existingOrgMember = await prisma.member.findFirst({
        where: {
          organizationId: workspaceOrgId,
          userId,
        },
        select: { id: true },
      });

      if (!existingOrgMember) {
        await prisma.member.create({
          data: {
            organizationId: workspaceOrgId,
            userId,
            role: "member", // adapte si tu veux un autre rôle par défaut
            createdAt: new Date(), // requis dans ton schema
          },
        });
      }
    }

    // 6) Sign-in (c’est lui qui doit poser les cookies de session)
    const signInResult = await auth.api.signInEmail({
      returnHeaders: true,
      body: {
        email: invitation.email,
        password,
      },
    });

    const signInHeaders = (signInResult as any).headers as Headers | undefined;

    // 7) Workspace membership + invitation accepted en transaction
    const txRes = await prisma.$transaction(async (tx) => {
      const membership = await tx.workspaceMember.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId,
          role: invitation.role || "member",
          status: "active",
          invitedById: invitation.invitedById,
        },
    });

  // ✅ si le workspace est rattaché à une organization, on y attache aussi le user
  const orgId = invitation.workspace.organizationId;
  if (orgId) {
    const existingOrgMember = await tx.member.findFirst({
      where: { organizationId: orgId, userId },
      select: { id: true },
    });

    if (!existingOrgMember) {
      await tx.member.create({
        data: {
          organizationId: orgId,
          userId,
          role: "member", // ou autre mapping si besoin
          createdAt: new Date(), // votre schema impose @db.Timestamp(6) sans default
        },
      });
    }
  }

  await tx.workspaceInvitation.update({
    where: { id: invitation.id },
    data: { status: "accepted", acceptedAt: new Date() },
  });

  return { membership };
});

    // 8) Réponse + forward cookies
    const res = NextResponse.json(
      {
        success: true,
        workspaceId: invitation.workspaceId,
        workspaceSlug: invitation.workspace.slug,
        organizationId: workspaceOrgId, // utile côté client
        membership: txRes.membership,
      },
      { status: 200 },
    );

    // IMPORTANT: forward les cookies du sign-in (session)
    if (signInHeaders) forwardSetCookies(signInHeaders, res);

    // Optionnel: forward sign-up cookies aussi (ne nuit pas)
    if (signUpHeaders) forwardSetCookies(signUpHeaders, res);

    return res;
  } catch (error) {
    console.error("/api/workspaces/invitations/complete error", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
