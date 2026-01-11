import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email("Email invalide"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signInSchema.parse(body);

    const result = await auth.api.sendVerificationOTP({
      body: {
        email: validatedData.email,
        type: "sign-in",
      },
    });

    if (!result || (result && !result.success)) {
      return Response.json(
        { error: "Identifiants invalides" },
        { status: 401 }
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

    console.error("[SIGN_IN_ERROR]", error);
    return Response.json(
      { error: "Une erreur est survenue lors de la connexion" },
      { status: 500 }
    );
  }
}
