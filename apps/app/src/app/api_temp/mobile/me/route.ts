import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fromNodeHeaders } from "better-auth/node";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const headers = Object.fromEntries(req.headers.entries());
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        role: "contributor",
      },
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
