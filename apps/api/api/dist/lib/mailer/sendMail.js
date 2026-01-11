"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
const transporter_1 = require("./transporter");
async function sendMail({ to, subject, html }) {
    await transporter_1.transporter.sendMail({
        from: `"Tada" <no-reply@monrezo.net>`,
        to,
        subject,
        html,
    });
}
