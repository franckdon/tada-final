import "server-only";
import crypto from "crypto";
import { getSupabaseAdmin } from "./supabase-server";
import { UPLOAD_CONFIG, type UploadCategory } from "./uploads.config";

export async function uploadFileToSupabase(options: {
  file: File;
  category: UploadCategory;
  baseName?: string;
}) {
  const { file, category, baseName } = options;

  const supabaseAdmin = getSupabaseAdmin();

  const config = UPLOAD_CONFIG[category];

  const ext =
    file.name.split(".").pop()?.toLowerCase() ||
    file.type.split("/").pop() ||
    "bin";

  const random = crypto.randomUUID();
  const safeBase = (baseName || "file")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .slice(0, 50);

  const path = `${config.folder}/${safeBase}-${Date.now()}-${random}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabaseAdmin.storage
    .from(config.bucket)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    console.error("[SUPABASE_UPLOAD_ERROR]", error);
    throw error;
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(config.bucket)
    .getPublicUrl(data.path);

  return {
    bucket: config.bucket,
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}

export async function deleteFromSupabase(options: {
  category: UploadCategory;
  path: string;
}) {
  const { category, path } = options;

  const supabaseAdmin = getSupabaseAdmin();

  const config = UPLOAD_CONFIG[category];

  const { error } = await supabaseAdmin.storage
    .from(config.bucket)
    .remove([path]);

  if (error) {
    console.error("[SUPABASE_DELETE_ERROR]", error);
    throw error;
  }
}
