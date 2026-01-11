"use client";

import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { forgetPassword } from "@/lib/auth-client";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LeftSection from "./left-section";

export default function ForgotPasswordCard() {
  const t = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await forgetPassword({
        email: email,
        redirectTo: "/reset-password",
      });

      toast({
        title: t("auth.forgotPassword.success"),
      });

      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      toast({
        title: t("auth.forgotPassword.error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Image
            src="/logos/tada.svg"
            alt="Tada"
            width={1}
            height={1}
            className="h-6 md:h-10 w-auto mb-20"
          />
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {t("auth.forgotPassword.title")}
          </h2>
          <p className="text-gray-400 mb-6 md:mb-8">
            {t("auth.forgotPassword.description")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <Label className="text-sm/5 font-medium">
                {t("auth.forgotPassword.email")}
              </Label>
              <Input
                required
                autoFocus
                placeholder={t("auth.forgotPassword.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="mt-8">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isLoading
                  ? t("auth.forgotPassword.loading")
                  : t("auth.forgotPassword.submit")}
              </Button>
            </div>
            <div className="mt-8">
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">
                  <Icons.arrowLeft className="mr-2 h-4 w-4" />
                  {t("auth.forgotPassword.backToLogin")}
                </Link>
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Left Section */}
      <LeftSection />
    </div>
    /*   <div className="flex justify-center items-center h-screen">
      <Card className="shadow-none w-1/2">
        <CardHeader className="w-full flex items-center justify-center">
          <Link
            href="/"
            title="Home"
            className="flex items-center justify-center"
          >
            <Image
              src="/logo-group.png"
              alt="Tada Logo"
              width={120}
              height={40}
              priority
              className=""
            />
          </Link>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="py-5 sm:py-8">
            <h1 className="text-base/6 font-medium">
              {t("auth.forgotPassword.title")}
            </h1>
            <p className="mt-1 text-sm/5 dark:text-gray-300 text-gray-600">
              {t("auth.forgotPassword.description")}
            </p>

            <div className="mt-8 space-y-3">
              <Label className="text-sm/5 font-medium">
                {t("auth.forgotPassword.email")}
              </Label>
              <Input
                required
                autoFocus
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="mt-8">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isLoading
                  ? t("auth.forgotPassword.loading")
                  : t("auth.forgotPassword.submit")}
              </Button>
            </div>

            <div className="mt-8">
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">
                  <Icons.arrowLeft className="mr-2 h-4 w-4" />
                  {t("auth.forgotPassword.backToLogin")}
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div> */
  );
}
