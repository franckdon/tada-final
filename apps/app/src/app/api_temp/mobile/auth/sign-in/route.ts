import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email("Email invalide"),
  otp: z.string().min(6, "OTP invalide"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signInSchema.parse(body);

    const result = await auth.api.signInEmailOTP({
      body: {
        email: validatedData.email,
        otp: validatedData.otp,
      },
    });

    if (!result) {
      return Response.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    return Response.json({ ...result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: error.errors[0]?.message },
        { status: 400 }
      );
    }

    // 🔍 Si l'erreur vient de Better Auth avec un message clair
    if (
      typeof error === "object" &&
      error?.body?.message &&
      error?.statusCode
    ) {
      return Response.json(
        { error: error.body.message, code: error.body.code },
        { status: error.statusCode }
      );
    }

    console.error("[SIGN_IN_ERROR]", error);
    return Response.json(
      { error: "Une erreur est survenue lors de la connexion" },
      { status: 500 }
    );
  }
}
