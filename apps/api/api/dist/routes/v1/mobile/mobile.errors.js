"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonError = jsonError;
exports.formatZodIssuesFr = formatZodIssuesFr;
exports.safeJson = safeJson;
function jsonError(c, status, message, code) {
    const payload = { error: message };
    if (code)
        payload.code = code;
    return c.json(payload, status);
}
function formatZodIssuesFr(err) {
    return err.issues.map((i) => {
        const path = i.path.length ? i.path.join(".") : "body";
        if (i.code === "invalid_type")
            return `${path} : champ requis ou type invalide`;
        if (i.code === "invalid_string" && i.validation === "email")
            return `${path} : email invalide`;
        if (i.code === "too_small")
            return `${path} : valeur trop courte`;
        if (i.code === "too_big")
            return `${path} : valeur trop longue`;
        return `${path} : ${i.message}`;
    });
}
async function safeJson(c) {
    try {
        return (await c.req.json());
    }
    catch {
        return {};
    }
}
