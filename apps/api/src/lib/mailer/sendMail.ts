import { transporter } from "./transporter";

type SendMailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail({ to, subject, html }: SendMailParams) {
  await transporter.sendMail({
    from: `"Tada" <no-reply@monrezo.net>`,
    to,
    subject,
    html,
  });
}
