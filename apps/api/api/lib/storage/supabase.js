"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = supabaseAdmin;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../env");
let _client = null;
function supabaseAdmin() {
    if (_client)
        return _client;
    if (!env_1.env.SUPABASE_URL)
        throw new Error("SUPABASE_URL manquant");
    if (!env_1.env.SUPABASE_SERVICE_ROLE_KEY)
        throw new Error("SUPABASE_SERVICE_ROLE_KEY manquant");
    _client = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
    });
    return _client;
}
