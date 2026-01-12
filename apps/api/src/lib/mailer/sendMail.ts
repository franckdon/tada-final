// lib/mailer/sendMail.ts
import { transporter } from "./transporter";

export async function sendMail({ to, subject, html }: {to:string; subject:string; html:string}) {
  try {
    // vérifie la connectivité SMTP + auth
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"TadaIq" <no-reply@tadaiq.com>`,
      to,
      subject,
      html,
    });

    console.log("[MAIL] sent", { to, subject, messageId: info.messageId });
    return { ok: true as const, messageId: info.messageId };
  } catch (err: any) {
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
