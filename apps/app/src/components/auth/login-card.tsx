"use client";

import type React from "react";

import { useToast } from "@/hooks/use-toast";
import { organization, signIn, useSession } from "@/lib/auth-client";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import LeftSection from "./left-section";
import { useIdentify, useVeltClient } from "@veltdev/react";

const Login = () => {
  const t = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerified = searchParams.get("verified") === "true";
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { client } = useVeltClient();
  const { data } = useSession();

  useEffect(() => {
    if (isVerified) {
      toast({
        title: t("auth.login.emailVerified.title"),
        description: t("auth.login.emailVerified.description"),
        duration: 5000,
      });
    }
  }, [isVerified]);

  const checkOrganizations = async () => {
    try {
      const orgs = await organization.list();

      if (!orgs.data || orgs.data.length === 0) {
        router.push("/organization-setup");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking organizations:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "An error occurred during sign in");
        return;
      }

      console.log("session", data?.session);

      if (client) {
        await client.identify({
          ...result.data.user,
          userId: result.data.user.id,
          organizationId: data?.session?.activeOrganizationId || "",
        });
      }

      const hasOrgs = await checkOrganizations();
      if (hasOrgs) {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.social({
        provider,
        requestSignUp: false,
      });

      if (result.error) {
        setError(
          result.error.message || "An error occurred during social sign in"
        );
        return;
      }

      const hasOrgs = await checkOrganizations();
      if (hasOrgs) {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Section - Login Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-start justify-center">
        <div className="max-w-md w-full pt-20">
          <Image
            src="/logos/tada.svg"
            alt="Tada"
            width={1}
            height={1}
            className="h-6 md:h-10 w-auto mb-20"
          />
          <h1 className="text-2xl md:text-3xl font-sora font-bold">
            {t("auth.login.welcomeBack")}
          </h1>
          <h2 className="text-[#48505E] mb-2">{t("auth.login.description")}</h2>

          {error && (
            <div className="mt-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 mt-5">
            <div>
              <Label className="text-sm/5 font-medium text-[#48505E]">
                {t("auth.login.email")}
              </Label>
              <Input
                required
                autoFocus
                type="email"
                placeholder={t("auth.login.email")}
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label className="text-sm/5 font-medium text-[#48505E]">
                {t("auth.login.password")}
              </Label>
              <Input
                required
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-gray-700 cursor-pointer"
                >
                  {t("auth.login.rememberMe")}
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-[#FF5B4A] hover:text-[#FF5B4A]/80 font-semibold"
              >
                {t("auth.login.forgotPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary"
              disabled={isLoading}
            >
              {isLoading ? t("auth.login.loading") : t("auth.login.submit")}
            </Button>
            <div className="mt-8 space-y-3">
              <div className="flex space-x-4">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleSocialLogin("google")}
                  disabled={isLoading}
                >
                  <Image
                    src="/logos/google.svg"
                    alt="Tada"
                    width={1}
                    height={1}
                    className="size-5 mr-3"
                  />
                  {t("auth.login.google")}
                </Button>
              </div>
            </div>
          </form>

          <p className="text-gray-400 mt-7 text-center">
            {t("auth.login.noAccount")}{" "}
            <Link href="/signup" className="text-primary font-semibold">
              {t("auth.login.signUp")}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section - Marketing Content */}
      <LeftSection />
    </div>
  );
};

export default Login;
