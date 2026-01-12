"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
// lib/mailer/sendMail.ts
const transporter_1 = require("./transporter");
async function sendMail({ to, subject, html }) {
    try {
        // vérifie la connectivité SMTP + auth
        await transporter_1.transporter.verify();
        const info = await transporter_1.transporter.sendMail({
            from: `"TadaIq" <no-reply@tadaiq.com>`,
            to,
            subject,
            html,
        });
        console.log("[MAIL] sent", { to, subject, messageId: info.messageId });
        return { ok: true, messageId: info.messageId };
    }
    catch (err) {
        console.error("[MAIL] failed", {
            to,
            subject,
            error: err?.message,
            code: err?.code,
            response: err?.response,
        });
        throw err;
    }
}
