"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ImpersonatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  useEffect(() => {
    const handleImpersonation = async () => {
      if (!userId) {
        router.push("/");
        return;
      }

      try {
        await authClient.admin.impersonateUser({ userId });

        router.push("/");
      } catch (error) {
        console.error("Erreur lors de l'impersonnation:", error);
        router.push("/login");
      }
    };

    handleImpersonation();
  }, [userId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-4">Connexion en cours...</h1>
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent mx-auto" />
      </div>
    </div>
  );
}
