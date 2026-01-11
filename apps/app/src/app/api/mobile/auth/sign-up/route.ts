import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email("Email invalide"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signUpSchema.parse(body);

    // 🔒 Vérifie si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return Response.json(
        { error: "Cette adresse email est déjà utilisée" },
        { status: 409 }
      );
    }

    // 🧑 Création utilisateur
    await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        role: "contributor",
        emailVerified: false,
      },
    });

    // ✉️ Envoie de l'OTP
    const result = await auth.api.sendVerificationOTP({
      body: {
        email: validatedData.email,
        type: "email-verification",
      },
    });

    if (!result || (result && !result.success)) {
      return Response.json(
        { error: "Erreur lors de la création du compte" },
        { status: 400 }
      );
    }

    return Response.json({ ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: error.errors[0]?.message },
        { status: 400 }
      );
    }

    if (error && typeof error === "object" && "status" in error) {
      switch (error.status) {
        case "EMAIL_EXISTS":
          return Response.json(
            { error: "Cette adresse email est déjà utilisée" },
            { status: 409 }
          );
        case "INVALID_PASSWORD":
          return Response.json(
            {
              error: "Le mot de passe ne respecte pas les critères de sécurité",
            },
            { status: 400 }
          );
        case "EMAIL_NOT_VERIFIED":
          return Response.json(
            {
              error:
                "Veuillez vérifier votre adresse email avant de vous connecter",
              code: "EMAIL_NOT_VERIFIED",
            },
            { status: 403 }
          );
        default:
          console.error("[SIGN_UP_ERROR]", error);
          return Response.json(
            { error: "Une erreur est survenue lors de l'inscription" },
            { status: 500 }
          );
      }
    }

    console.error("[SIGN_UP_ERROR]", error);
    return Response.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}
