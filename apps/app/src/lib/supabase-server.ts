import "server-only";
import { createClient } from "@supabase/supabase-js";

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.NEXT_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error(
      "Supabase env vars manquantes (NEXT_PUBLIC_SUPABASE_URL / NEXT_SERVICE_ROLE_KEY)"
    );
  }

  _client = createClient(url, serviceRole, {
    auth: { persistSession: false },
  });

  return _client;
}
