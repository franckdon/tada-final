"use client";

import { toast, useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { Card, CardContent, CardHeader } from "@tada/ui/components/card";
import { Input } from "@tada/ui/components/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AcceptInvitationPageProps {
  params: {
    id: string;
  };
}

export default function AcceptInvitationPage({
  params,
}: AcceptInvitationPageProps) {
  const t = useI18n();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const handleAuthentication = async () => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        // 1. Créer le compte
        await authClient.signUp.email({
          email,
          password,
          name,
        });

        toast({
          title: t("auth.verifyEmail.title"),
          description: t("auth.verifyEmail.description"),
        });
      } else {
        await authClient.signIn.email({
          email,
          password,
        });

        await authClient.organization.acceptInvitation({
          invitationId: params.id,
        });

        router.push("/");
      }
    } catch (err) {
      setError(t("invitation.errors.acceptFailed"));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <Image
            src="/logo-group.png"
            alt="Logo"
            width={120}
            height={40}
            className="mx-auto"
          />
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center space-y-4">
              <p className="text-red-500">{error}</p>
              <Button variant="outline" onClick={() => router.push("/login")}>
                {t("invitation.backToLogin")}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">{t("invitation.title")}</h2>
              </div>
              <div className="space-y-4">
                {isSignUp && (
                  <Input
                    placeholder={t("auth.signup.name")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                )}
                <Input
                  type="email"
                  placeholder={t("auth.login.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder={t("auth.login.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleAuthentication}
                  disabled={isLoading}
                >
                  {isLoading
                    ? t("common.loading")
                    : isSignUp
                      ? t("invitation.createAndAccept")
                      : t("invitation.signInAndAccept")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp
                    ? t("invitation.alreadyHaveAccount")
                    : t("invitation.needAccount")}
                </Button>
                {/*  <Button
                  className="w-full"
                  onClick={handleAcceptInvitation}
                  disabled={isLoading}
                >
                  {isLoading ? t("common.loading") : t("invitation.accept")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/login")}
                  disabled={isLoading}
                >
                  {t("invitation.decline")}
                </Button> */}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
