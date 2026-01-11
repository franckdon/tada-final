import { uploadFileToSupabase } from "@/lib/uploads.server";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // important (File.arrayBuffer + Buffer)
export const dynamic = "force-dynamic";

const MAX_SIZE_MB = 8;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_SIZE_MB) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_SIZE_MB}MB)` },
        { status: 400 }
      );
    }

    // Tu peux utiliser "surveyImage" tel que ton config le définit
    const uploaded = await uploadFileToSupabase({
      file,
      category: "surveyImage",
      baseName: file.name.replace(/\.[^/.]+$/, ""),
    });

    // Important: renvoie aussi bucket+path pour pouvoir supprimer et persister proprement
    return NextResponse.json({
      url: uploaded.publicUrl,
      bucket: uploaded.bucket,
      path: uploaded.path,
    });
  } catch (e: any) {
    console.error("[UPLOAD_QUESTION_IMAGE]", e);
    return NextResponse.json(
      { error: e?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
