"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authActionClient } from "../safe-action";

export const sendSupportAction = authActionClient
  .schema(
    z.object({
      subject: z.string(),
      priority: z.string(),
      type: z.string(),
      message: z.string(),
    })
  )
  .metadata({
    name: "send-support",
  })
  .action(async ({ parsedInput: data, ctx: { user } }) => {
    const ticket = await prisma.supportTicket.create({
      data: {
        ...data,
        userId: user?.id,
      },
    });
    console.log(ticket);
  });
