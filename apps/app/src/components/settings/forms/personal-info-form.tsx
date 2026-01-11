"use client";

import { updateProfileAction } from "@/actions/user/update-profile-action";
import { Icons } from "@/components/icons";
import { countries } from "@/constants/countries";
import { type SectorCode, sectors } from "@/constants/sectors";
import { useUpload } from "@/hooks/use-upload";
import {
  type UpdateProfileFormData,
  updateProfileSchema,
} from "@/lib/schemas/profile";
import { stripSpecialCharacters } from "@/lib/utils";
import { useCurrentLocale, useI18n } from "@/locales/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tada/ui/components/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface PersonalInfoFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    position: string;
    country: string;
    sector: string;
    avatarUrl: string;
  };
}

export function PersonalInfoForm({ user }: PersonalInfoFormProps) {
  const t = useI18n();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { uploadFile, isLoading } = useUpload();

  const updateProfile = useAction(updateProfileAction, {
    onSuccess: () => {
      toast.success(t("settings.personalInfo.success"));
    },
    onError: () => {
      toast.error(t("settings.personalInfo.error"));
    },
  });

  useEffect(() => {
    form.setValue("name", user.name);
    form.setValue("email", user.email);
    form.setValue("position", user.position);
    /*   form.setValue("country", user.country);
    form.setValue("sector", user.sector); */
    setAvatarUrl(user.avatarUrl);
  }, [user]);

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema(t)),
    defaultValues: {
      name: user.name,
      email: user.email,
      position: user.position,
      /*  country: user.country,
      sector: user.sector, */
    },
  });

  async function onSubmit(values: UpdateProfileFormData) {
    if (avatarFile) {
      const filename = stripSpecialCharacters(avatarFile.name);
      const { url } = await uploadFile({
        file: avatarFile,
        path: [user.id, filename],
        bucket: "avatars",
      });

      setAvatarUrl(url);
    }

    updateProfile.execute({
      name: values.name,
      email: values.email,
      position: values.position,
      /*   country: values.country || "",
      sector: values.sector || "", */
      avatarUrl,
    });
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-medium text-gray-800 mb-1">
        {t("settings.personalInfo.title")}
      </h2>
      <p className="text-gray-500 mb-6">
        {t("settings.personalInfo.description")}
      </p>

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
              disabled={updateProfile.status === "executing" || isLoading}
            >
              {updateProfile.status === "executing" ||
                (isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ))}
              {t("common.save")}
            </Button>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("settings.personalInfo.name")}
                  <span className="text-primary ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("settings.personalInfo.email")}
                  <span className="text-primary ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Icons.mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <Input {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>{t("settings.personalInfo.avatar")}</FormLabel>
            <p className="text-gray-500 text-sm mb-2">
              {t("settings.personalInfo.avatarDescription")}
            </p>
            <div className="flex items-center">
              <Avatar className="h-28 w-28 mr-4">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback>
                  <Icons.user className="h-8 w-8 text-gray-500" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <label className=" p-6 text-center cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                  <div className="w-10 h-10 bg-red-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Icons.upload className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-primary mb-1">
                    {t("settings.personalInfo.uploadText")}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {t("settings.personalInfo.dragAndDrop")}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {t("settings.personalInfo.fileTypes")}
                  </p>
                </label>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("settings.personalInfo.position")}
                  <span className="text-primary ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
