import { NextResponse } from "next/server";
import { uploadFileToSupabase } from "@/lib/uploads.server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const orgId = (formData.get("orgId") as string | null) ?? "unknown";

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Le logo doit être une image" }, { status: 400 });
    }

    const { path } = await uploadFileToSupabase({
      file,
      category: "organizationLogo",
      baseName: orgId,
    });

    // On retourne le PATH (à stocker en DB), l'URL sera reconstruite côté client
    return NextResponse.json({ path }, { status: 200 });
  } catch (error) {
    console.error("[UPLOAD_ORGANIZATION_LOGO_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du logo" },
      { status: 500 },
    );
  }
}
