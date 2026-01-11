import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../../env";

let _client: SupabaseClient | null = null;

export function supabaseAdmin() {
  if (_client) return _client;

  if (!env.SUPABASE_URL) throw new Error("SUPABASE_URL manquant");
  if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquant");

  _client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  return _client;
}
