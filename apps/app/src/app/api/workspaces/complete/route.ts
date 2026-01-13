//src/app/api/workspaces/complete/route.ts
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

function appendSetCookie(fromHeaders: Headers, to: NextResponse) {
  const sc = fromHeaders.get("set-cookie");
  if (sc) to.headers.append("set-cookie", sc);
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

    // 2) Si user existe déjà => on refuse ici (il faut passer par le flow "existing account")
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

    // 3) Créer le compte via Better Auth (ça crée aussi les credentials correctement)
    // On récupère les headers/cookies si Better Auth en émet.
    const signUpResult = await auth.api.signUpEmail({
      returnHeaders: true,
      body: {
        email: invitation.email,
        password,
        name: invitation.email.split("@")[0] || "User",
      },
    });

    // NB: selon versions, signUpResult peut être { headers, response }
    const signUpHeaders = (signUpResult as any).headers as Headers | undefined;
    const signUpResponse = (signUpResult as any).response as any;

    const userId: string | undefined = signUpResponse?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Création du compte échouée (user manquant)" },
        { status: 500 },
      );
    }

    // 4) Dans ton cas, invitation = preuve de possession email => on marque verified
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    // 5) Sign-in immédiat pour obtenir une session cookie (Set-Cookie)
    const signInResult = await auth.api.signInEmail({
      returnHeaders: true,
      body: {
        email: invitation.email,
        password,
      },
    });

    const signInHeaders = (signInResult as any).headers as Headers | undefined;

    // 6) Membership + invitation accepted en transaction
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

      await tx.workspaceInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "accepted",
          acceptedAt: new Date(),
        },
      });

      return { membership };
    });

    // 7) Réponse + forward cookie(s)
    const res = NextResponse.json(
      {
        success: true,
        workspaceId: invitation.workspaceId,
        workspaceSlug: invitation.workspace.slug,
        membership: txRes.membership,
      },
      { status: 200 },
    );

    // Important: on forward le cookie issu du sign-in (c’est lui qui “connecte”)
    if (signInHeaders) appendSetCookie(signInHeaders, res);

    // (Optionnel) si ton sign-up renvoie aussi des cookies, tu peux les forward également
    // si (signUpHeaders) appendSetCookie(signUpHeaders, res);

    return res;
  } catch (error) {
    console.error("/api/workspaces/invitations/complete error", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
