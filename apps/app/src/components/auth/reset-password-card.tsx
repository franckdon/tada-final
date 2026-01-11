"use client";

import { Icons } from "@/components/icons";
import { resetPassword } from "@/lib/auth-client";
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
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import LeftSection from "./left-section";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export function ResetPasswordCard() {
  const t = useI18n();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) {
      toast.error(t("auth.resetPassword.errors.invalidToken"));
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await resetPassword({
        newPassword: values.password,
        token,
      });
      if (error) {
        toast.error(t("auth.resetPassword.errors.failed"));
        return;
      }

      toast.success(t("auth.resetPassword.success"));
      router.push("/signin");
    } catch (error) {
      toast.error(t("auth.resetPassword.errors.failed"));
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-4xl rounded-xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Icons.warning className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("auth.resetPassword.errors.invalidToken")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("auth.resetPassword.errors.tokenExpired")}
          </p>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            {t("auth.resetPassword.requestNewLink")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Right Section */}
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
            {t("auth.resetPassword.title")}
          </h2>
          <p className="mb-6 md:mb-8">{t("auth.resetPassword.description")}</p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 md:space-y-6"
            >
              <div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm/5 font-medium">
                        {t("auth.resetPassword.newPassword")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t(
                            "auth.resetPassword.passwordPlaceholder"
                          )}
                          {...field}
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
                        {t("auth.resetPassword.confirmPassword")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t(
                            "auth.resetPassword.confirmPasswordPlaceholder"
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("auth.resetPassword.submit")}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              {t("auth.resetPassword.backToSignIn")}
            </Link>
          </div>
        </div>
      </div>

      {/* Left Section */}
      <LeftSection />
    </div>
    /*  <div className="flex justify-center items-center h-screen">
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
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {t("auth.resetPassword.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("auth.resetPassword.description")}
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("auth.resetPassword.newPassword")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t(
                            "auth.resetPassword.passwordPlaceholder",
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("auth.resetPassword.confirmPassword")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t(
                            "auth.resetPassword.confirmPasswordPlaceholder",
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("auth.resetPassword.submit")}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm">
              <Link
                href="/auth/signin"
                className="text-primary hover:underline"
              >
                {t("auth.resetPassword.backToSignIn")}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div> */
  );
}
