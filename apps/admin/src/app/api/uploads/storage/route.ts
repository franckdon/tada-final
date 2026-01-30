import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.NEXT_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error(
      "Env manquantes: NEXT_PUBLIC_SUPABASE_URL / NEXT_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

function sanitizePath(p: string) {
  const cleaned = p.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!cleaned) throw new Error("Invalid path");
  if (cleaned.includes("..")) throw new Error("Invalid path");
  return cleaned;
}

function makeUniquePath(inputPath: string, file: File) {
  // inputPath attendu: "mission-thumbnails/mission-xxx.png"
  const safePath = sanitizePath(inputPath);

  const ext =
    safePath.split(".").pop()?.toLowerCase() ||
    file.name.split(".").pop()?.toLowerCase() ||
    file.type.split("/").pop() ||
    "bin";

  const unique = crypto.randomUUID().slice(0, 8);

  // si safePath contient déjà une extension, on injecte -<unique> avant
  if (/\.[a-z0-9]+$/i.test(safePath)) {
    return safePath.replace(/\.[a-z0-9]+$/i, `-${unique}.${ext}`);
  }

  return `${safePath}-${unique}.${ext}`;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string | null) ?? "";
    const pathStr = (formData.get("path") as string | null) ?? "";

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier envoyé" }, { status: 400 });
    }
    if (!bucket) {
      return NextResponse.json({ error: "Bucket manquant" }, { status: 400 });
    }
    if (!pathStr) {
      return NextResponse.json({ error: "Path manquant" }, { status: 400 });
    }

    const finalPath = makeUniquePath(pathStr, file);
    const supabaseAdmin = getSupabaseAdmin();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(finalPath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      console.error("[SUPABASE_UPLOAD_ERROR]", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return NextResponse.json(
      { path: data.path, publicUrl: publicUrlData.publicUrl },
      { status: 200 }
    );
  } catch (e) {
    console.error("[UPLOAD_STORAGE_ERROR]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { bucket?: string; path?: string }
      | null;

    const bucket = body?.bucket ?? "";
    const pathStr = body?.path ?? "";

    if (!bucket || !pathStr) {
      return NextResponse.json({ error: "bucket/path manquant" }, { status: 400 });
    }

    const safePath = sanitizePath(pathStr);
    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin.storage.from(bucket).remove([safePath]);
    if (error) {
      console.error("[SUPABASE_DELETE_ERROR]", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("[DELETE_STORAGE_ERROR]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Delete error" },
      { status: 500 }
    );
  }
}
