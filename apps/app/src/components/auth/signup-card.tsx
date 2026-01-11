"use client";

import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { organization, signIn, signUp } from "@/lib/auth-client";
import { type SignupFormData, createSignupSchema } from "@/lib/schemas/auth";
import { useI18n } from "@/locales/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@tada/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tada/ui/components/form";
import { Input } from "@tada/ui/components/input";
import { cn } from "@tada/ui/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import LeftSection from "./left-section";

const SignUp = () => {
  const t = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(createSignupSchema(t)),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

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

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const signUpResult = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: `${window.location.origin}/login?verified=true`,
      });

      if (signUpResult.error) {
        setError(
          signUpResult.error.message ||
            "Une erreur est survenue lors de l'inscription"
        );
        return;
      }
      form.reset();
      toast({
        title: t("auth.verifyEmail.title"),
        description: t("auth.verifyEmail.description"),
        duration: 10000,
      });

      router.push("/check-email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
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
      {/* Left Section */}
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
            {t("auth.signup.title")}
          </h2>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 md:space-y-6"
            >
              <div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm/5 font-medium">
                        {t("auth.signup.name")}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="text" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm/5 font-medium">
                        {t("auth.signup.email")}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm/5 font-medium">
                        {t("auth.signup.password")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm/5 font-medium">
                        {t("auth.signup.confirmPassword")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  t("auth.signup.submit")
                )}
              </Button>

              <p className="text-gray-400 text-center">
                {t("auth.signup.haveAccount")}{" "}
                <Link href="/signin" className="text-primary font-semibold">
                  {t("auth.signup.signIn")}
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>

      {/* Right Section */}
      <LeftSection />
    </div>
  );
};

export default SignUp;
