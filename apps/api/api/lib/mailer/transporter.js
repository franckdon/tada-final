"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
// lib/mailer/transporter.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../../env");
exports.transporter = nodemailer_1.default.createTransport({
    host: env_1.env.SMTP_HOST,
    port: Number(env_1.env.SMTP_PORT),
    secure: Number(env_1.env.SMTP_PORT) === 465,
    auth: {
        user: env_1.env.SMTP_EMAIL,
        pass: env_1.env.SMTP_PASSWORD,
    },
    logger: env_1.env.NODE_ENV !== "production",
    debug: env_1.env.NODE_ENV !== "production",
});
