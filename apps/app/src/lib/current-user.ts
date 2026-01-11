// src/lib/current-user.ts
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Récupérer juste la session Better Auth (pratique si tu veux juste l'id)
export async function getCurrentSession() {
  const sessionResult = await auth.api.getSession({
    headers: await headers(),
  });

  // sessionResult ressemble à { session: { userId, ... }, user: {...} } selon ta config
  return sessionResult?.session ?? null;
}

// Récupérer l'utilisateur complet depuis ta table Prisma `User`
export async function getCurrentUser() {
  const session = await getCurrentSession();

  if (!session?.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  return user;
}

// Variante stricte : throw si pas connecté
export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
