"use client";

import { updatePasswordAction } from "@/actions/user/update-password-action";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import {
  type UpdatePasswordFormData,
  updatePasswordSchema,
} from "@/lib/schemas/password-change";
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
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function PasswordChangeForm() {
  const t = useI18n();
  const { toast } = useToast();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const updatePassword = useAction(updatePasswordAction, {
    onSuccess: () => {
      toast({
        title: t("settings.password.success"),
      });
      form.reset();
    },
    onError: () => {
      toast({ title: t("settings.password.error") });
    },
  });
  const form = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema(t)),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: UpdatePasswordFormData) {
    updatePassword.execute({
      newPassword: values.newPassword,
    });
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-medium text-gray-800 mb-1">
        {t("settings.password.title")}
      </h2>
      <p className="text-gray-500 mb-6">{t("settings.password.description")}</p>

      <Form {...form}>
        <form className="space-y-8">
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="mr-3"
              onClick={() => form.reset()}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={updatePassword.status === "executing"}
            >
              {updatePassword.status === "executing" && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("common.save")}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6 max-w-3xl">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <div className="grid grid-cols-2 gap-8 items-center">
                    <FormLabel>{t("settings.password.current")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPasswords.current ? "text" : "password"}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              current: !prev.current,
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Icons.eye className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <div className="grid grid-cols-2 gap-8 items-center">
                    <FormLabel>{t("settings.password.new")}</FormLabel>
                    <div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPasswords.new ? "text" : "password"}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                new: !prev.new,
                              }))
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <Icons.eye className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </FormControl>
                      <p className="text-gray-500 text-sm mt-1">
                        {t("settings.password.hint")}
                      </p>
                    </div>
                  </div>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <div className="grid grid-cols-2 gap-8 items-center">
                    <FormLabel>{t("settings.password.confirm")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPasswords.confirm ? "text" : "password"}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              confirm: !prev.confirm,
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Icons.eye className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
