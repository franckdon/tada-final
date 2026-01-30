"use client";

import { useState } from "react";

interface UploadParams {
  file: File;
  path: string[];   // ex: ["mission-thumbnails", "mission-xxx.png"]
  bucket: string;   // ex: "tada"
}

export function useUpload() {
  const [isLoading, setLoading] = useState(false);

  const uploadFile = async ({ file, path, bucket }: UploadParams) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", bucket);
      fd.append("path", path.join("/"));

      const res = await fetch("/api/uploads/storage", {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Upload failed");

      return {
        // url = pour preview UI
        url: json.publicUrl as string,
        // path = à stocker en DB
        path: json.path as string,
      };
    } finally {
      setLoading(false);
    }
  };

  const removedFile = async ({ path, bucket }: Omit<UploadParams, "file">) => {
    setLoading(true);
    try {
      const res = await fetch("/api/uploads/storage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket, path: path.join("/") }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Delete failed");

      return true;
    } finally {
      setLoading(false);
    }
  };

  return { uploadFile, removedFile, isLoading };
}
