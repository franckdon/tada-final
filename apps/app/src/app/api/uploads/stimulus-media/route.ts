import { uploadFileToSupabase } from "@/lib/uploads.server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE_MB = 250; // vidéo possible
const ALLOWED_PREFIXES = ["image/", "video/", "audio/"];

function inferMediaType(mime: string): "photo" | "video" | "audio" | null {
  if (mime.startsWith("image/")) return "photo";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return null;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const okType = ALLOWED_PREFIXES.some((p) => file.type.startsWith(p));
    if (!okType) {
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

    const mediaType = inferMediaType(file.type);
    if (!mediaType) {
      return NextResponse.json(
        { error: "Could not infer media type" },
        { status: 400 }
      );
    }

    const uploaded = await uploadFileToSupabase({
      file,
      category: "stimulusMedia",
      baseName: file.name.replace(/\.[^/.]+$/, ""),
    });

    return NextResponse.json({
      url: uploaded.publicUrl,
      bucket: uploaded.bucket,
      path: uploaded.path,
      mediaType,
      mimeType: file.type,
      fileName: file.name,
      size: file.size,
    });
  } catch (e: any) {
    console.error("[UPLOAD_STIMULUS_MEDIA]", e);
    return NextResponse.json(
      { error: e?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
