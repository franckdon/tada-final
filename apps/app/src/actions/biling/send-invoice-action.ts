"use server";

import { render } from "@react-email/render";
import { authActionClient } from "../safe-action";
import { transporter } from "@/lib/transporter";
import { InvoiceEmail } from "@tada/email/emails/send-invoice";
import { z } from "zod";

export const sendInvoiceEmailAction = authActionClient
  .schema(
    z.object({
      email: z.string().email(),
      total: z.string().min(1, "Total amount is required"),
    })
  )
  .metadata({ name: "send-reset-password" })
  .action(async ({ parsedInput: { email, total } }) => {
    try {
      const payload = {
        from: "no-reply@tadatiq.com",
        to: [email],
        subject: "[Tada] Facture",
        html: await render(
          InvoiceEmail({
            invoiceUrl: "",
            amount: total,
            date: new Date().toLocaleString(),
            locale: "fr",
          })
        ),
      };

      await transporter.sendMail(payload);

      return { success: true };
    } catch (error) {
      console.error("[SEND_RESET_PASSWORD]", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de l’envoi de l’email.",
      };
    }
  });
