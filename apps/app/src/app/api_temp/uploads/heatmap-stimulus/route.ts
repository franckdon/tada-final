import { NextResponse } from "next/server";
import { uploadFileToSupabase } from "@/lib/uploads.server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }


    const uploaded = await uploadFileToSupabase({
      file,
      category: "surveyImage",
      baseName: "heatmap-stimulus",
    });

    return NextResponse.json({
      bucket: uploaded.bucket,
      path: uploaded.path,
      publicUrl: uploaded.publicUrl,
      url: uploaded.publicUrl,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Upload error" },
      { status: 500 }
    );
  }
}
