"use client";

import { useEffect, useState } from "react";

export const useVeltAuth = (user: {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  organizationId?: string | null;
}) => {
  const [isVeltReady, setIsVeltReady] = useState(false);

  useEffect(() => {
    const initializeVelt = async () => {
      const checkVelt = () => {
        if (typeof window !== "undefined" && (window as any).Velt) {
          try {
            // Identifier l'utilisateur
            (window as any).Velt.identify({
              userId: user.id,
              name: user.name || user.email || "User",
              email: user.email || undefined,
              photoUrl: user.image || undefined,
              organizationId: user.organizationId,
            });

            // Attendre un peu pour que l'identification soit complète
            setTimeout(() => {
              console.log("Velt initialisé avec succès pour:", user.id);
              setIsVeltReady(true);
            }, 500);

            return true;
          } catch (error) {
            console.error("Erreur lors de l'identification Velt:", error);
          }
        }
        return false;
      };

      // Faire le check immédiatement
      if (checkVelt()) return;

      const maxAttempts = 20;
      let attempts = 0;

      const interval = setInterval(() => {
        attempts++;
        console.log(`Tentative ${attempts} de connexion à Velt...`);

        if (checkVelt() || attempts >= maxAttempts) {
          clearInterval(interval);
          if (attempts >= maxAttempts) {
            console.error(
              "Impossible de se connecter à Velt après",
              maxAttempts,
              "tentatives"
            );
          }
        }
      }, 200);
    };

    initializeVelt();
  }, [user]);

  return isVeltReady;
};
