"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

export default function AcceptWorkspaceInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params.locale || "fr"; // fallback
  const { toast } = useToast();
  const { data: session, status } = useSession();

  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setIsProcessing(false);
      toast({
        title: "Invitation invalide",
        description: "Le lien d'invitation est invalide ou incomplet.",
        variant: "destructive",
      });
      return;
    }

    if (status === "loading") return;

    if (!session?.user) {
      const nextUrl =
        `/${locale}/workspaces/invitations/accept?token=` +
        encodeURIComponent(token);

      router.push(`/${locale}/login?next=${encodeURIComponent(nextUrl)}`);
      setIsProcessing(false);
      return;
    }

    const acceptInvitation = async () => {
      try {
        setIsProcessing(true);
        const res = await fetch("/api/workspaces/invitations/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast({
            title: "Invitation non valide",
            description: data.error ?? "Impossible d'accepter l'invitation.",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        toast({
          title: "Invitation acceptée",
          description: "Vous avez rejoint le workspace avec succès.",
        });

        if (data.workspaceId) {
          router.push(`/${locale}/missions/${data.workspaceId}`);
        } else {
          router.push(`/${locale}`);
        }
      } catch (error) {
        console.error("ACCEPT_INVITATION_ERROR", error);
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors de l'acceptation de l'invitation.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    };

    acceptInvitation();
  }, [searchParams, status, session, router, toast, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {isProcessing ? (
          <>
            <Icons.spinner className="h-6 w-6 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Validation de votre invitation en cours...
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Redirection en cours...
          </p>
        )}
      </div>
    </div>
  );
}
