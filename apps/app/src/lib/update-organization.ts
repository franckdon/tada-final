"use server";

import { prisma } from "@/lib/prisma";
import { Organization } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateOrganization(data: Partial<Organization>) {
  const { id, name, ...updateData } = data;

  if (!id || !name) {
    throw new Error("Missing id or name");
  }

  const updated = await prisma.organization.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/");
  return updated;
}
