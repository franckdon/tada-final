import { createClient } from "@tada/supabase/client";
import { remove, upload } from "@tada/supabase/storage";
import { useState } from "react";

interface UploadParams {
  file: File;
  path: string[];
  bucket: string;
}

export function useUpload() {
  const supabase = createClient();
  const [isLoading, setLoading] = useState(false);

  const uploadFile = async ({ file, path, bucket }: UploadParams) => {
    setLoading(true);

    const url = await upload(supabase, {
      path,
      file,
      bucket,
    });

    setLoading(false);

    return {
      url,
      path,
    };
  };

  const removedFile = async ({ path, bucket }: Omit<UploadParams, "file">) => {
    setLoading(true);

    const url = await remove(supabase, {
      path,
      bucket,
    });

    setLoading(false);
  };

  return {
    uploadFile,
    isLoading,
    removedFile,
  };
}
