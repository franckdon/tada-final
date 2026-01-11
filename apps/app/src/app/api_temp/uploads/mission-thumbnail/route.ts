import { NextResponse } from "next/server";
import { uploadFileToSupabase } from "@/lib/uploads.server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const missionId = (formData.get("missionId") as string | null) ?? "unknown";

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier envoyé" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Le thumbnail doit être une image" }, { status: 400 });
    }

    const { path } = await uploadFileToSupabase({
      file,
      category : "missionThumbnail",
      baseName: `mission-${missionId}`,
    });

    // On retourne le PATH à stocker en DB (reco)
    return NextResponse.json({ path }, { status: 200 });
  } catch (error) {
    console.error("[UPLOAD_MISSION_THUMBNAIL_ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload de l'image" },
      { status: 500 },
    );
  }
}
