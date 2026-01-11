"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadUserAvatar = uploadUserAvatar;
const crypto = __importStar(require("node:crypto"));
const env_1 = require("../../env");
const supabase_1 = require("./supabase");
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
function extFromMime(mime) {
    if (mime === "image/jpeg")
        return "jpg";
    if (mime === "image/png")
        return "png";
    if (mime === "image/webp")
        return "webp";
    return "bin";
}
async function uploadUserAvatar(params) {
    const { userId, file } = params;
    if (!file)
        return { ok: false, status: 400, message: "Fichier manquant (champ 'file')" };
    if (!ALLOWED_MIME.has(file.type)) {
        return {
            ok: false,
            status: 400,
            message: "Format invalide. Formats acceptés: JPG, PNG, WEBP",
        };
    }
    if (file.size > MAX_BYTES) {
        return {
            ok: false,
            status: 400,
            message: "Fichier trop volumineux (max 5MB)",
        };
    }
    const bucket = env_1.env.SUPABASE_STORAGE_BUCKET ?? "avatars";
    const ext = extFromMime(file.type);
    const filename = `${crypto.randomUUID()}.${ext}`;
    const path = `${userId}/${filename}`;
    const supabase = (0, supabase_1.supabaseAdmin)();
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
    });
    if (error) {
        return {
            ok: false,
            status: 500,
            message: "Erreur lors de l'upload vers Supabase Storage",
        };
    }
    // URL publique (bucket public)
    const base = env_1.env.SUPABASE_PUBLIC_BASE ?? `${env_1.env.SUPABASE_URL}/storage/v1/object/public`;
    const publicUrl = `${base}/${bucket}/${path}`;
    return { ok: true, path, publicUrl };
}
