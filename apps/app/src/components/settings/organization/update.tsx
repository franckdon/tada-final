"use client";

import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { useAction } from "next-safe-action/hooks";

import { useCurrentLocale, useI18n } from "@/locales/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tada/ui/components/avatar";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tada/ui/components/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@tada/ui/components/select";
import { Icons } from "@/components/icons";
import { useUpload } from "@/hooks/use-upload";
import { countries } from "@/constants/countries";
import { sectors } from "@/constants/sectors";
import {
  type UpdateOrganizationFormData,
  updateOrganizationSchema,
} from "./utils";

import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { updateOrganizationAction } from "@/actions/organization/update-organization-action";

interface TeamMember {
  id: string;
  organizationId: string;
  createdAt: Date;
  role: "admin" | "member" | "owner";
  teamId?: string;
  userId: string;
  user: {
    email: string;
    name: string;
    image?: string;
  };
}

export type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: string | null;
  status?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

export default function SettingsPage() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const { toast } = useToast();
  const { uploadFile, isLoading } = useUpload();

  const { data: session } = authClient.useSession();

  const currentUserId = session?.user?.id;

  const currentMembership = members.find((m) => m.userId === currentUserId);
  const currentRole = currentMembership?.role;

  const canManageOrg = currentRole === "owner" || currentRole === "admin";

  const {
    data: organizations,
    isPending: isLoadingOrganizations,
    refetch,
  } = authClient.useListOrganizations();

  const updateOrg = useAction(updateOrganizationAction, {
    onSuccess: ({ data }) => {
      toast({
        title: t("teamMembers.organization.edit.success.title"),
        description: t("teamMembers.organization.edit.success.description", {
          name: organizations?.[0]?.name,
          newName: form.getValues("name"),
        }),
      });

      refetch();
      setAvatarFile(null);
    },
    onError: (error) => {
      console.error("updateOrganizationAction error", error);
      toast({
        title: t("teamMembers.organization.edit.error.title"),
        description: t("teamMembers.organization.edit.error.description"),
        variant: "destructive",
      });
    },
  });

  // Initialize form with react-hook-form
  const form = useForm<UpdateOrganizationFormData>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name: "",
      country: "",
      sector: "",
    },
  });

  // Update form when organization data is loaded
  useEffect(() => {
    if (organizations?.[0]) {
      const metadata = organizations[0]?.metadata
        ? JSON.parse(organizations[0].metadata)
        : { country: "", sector: "" };

      form.reset({
        name: organizations[0].name || "",
        country: metadata.country || "",
        sector: metadata.sector || "",
      });
      setAvatarUrl(organizations[0].logo ?? null);
    }
  }, [organizations, form]);

  // Load members when component mounts
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await authClient.organization.getFullOrganization({
          query: {
            organizationId: organizations?.[0]?.id,
          },
        });

        await authClient.organization.setActive({
          organizationId: organizations?.[0]?.id,
        });

        if (response.data?.members) {
          setMembers(response.data.members);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des membres:", error);
      }
    };
    if (!isLoadingOrganizations && organizations?.[0]?.id) {
      loadMembers();
    }
  }, [isLoadingOrganizations, organizations]);

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

  async function onSubmit(values: UpdateOrganizationFormData) {
    if (!canManageOrg) {
      toast({
        title: "Accès refusé",
        description: "Seuls les admins/owners peuvent modifier l’organisation.",
        variant: "destructive",
      });
      return;
    }
    try {
      let logoUrl = avatarUrl;

      const orgId = organizations?.[0]?.id;
      if (!orgId) {
        toast({
          title: t("teamMembers.organization.edit.missingId"),
          variant: "destructive",
        });
        return;
      }

      if (avatarFile) {
        setIsAvatarUploading(true);

        const fd = new FormData();
        fd.append("file", avatarFile);
        fd.append("orgId", orgId);

        const res = await fetch("/api/uploads/organization-logo", {
          method: "POST",
          body: fd,
        });

        const json = await res.json();

        if (!res.ok) {
          console.error("Upload error:", json);
          throw new Error(json.error || "Upload failed");
        }

        logoUrl = json.url;
        setIsAvatarUploading(false);
      }

      const result = await updateOrganizationAction({
        id: orgId,
        logo: logoUrl,
        name: values.name,
        metadata: {
          country: values.country,
          sector: values.sector,
        },
      });

      toast({
        title: t("teamMembers.organization.edit.success.title"),
        description: t("teamMembers.organization.edit.success.description", {
          name: organizations?.[0]?.name,
          newName: values.name,
        }),
      });

      refetch();
      setAvatarFile(null);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setIsAvatarUploading(false);
      toast({
        title: t("teamMembers.organization.edit.error.title"),
        description: t("teamMembers.organization.edit.error.description"),
        variant: "destructive",
      });
    }
  }

  return (
    <div className="p-6 space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Avatar Section */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="mb-4">
              <h1>{t("teamMembers.organization.avatar.title")}</h1>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar Display */}
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    <Icons.user className="h-12 w-12 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
                {isAvatarUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Icons.spinner className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload Area */}
              <div className="flex-1">
                <label className="block">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isAvatarUploading || !canManageOrg}
                  />
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
    ${canManageOrg ? "hover:border-gray-400 cursor-pointer" : "opacity-60 cursor-not-allowed"}
    ${canManageOrg ? "border-gray-300" : "border-gray-200"}
  `}
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>

                    <p className="text-blue-600 font-medium mb-2">
                      {t("teamMembers.organization.avatar.upload.button")}
                    </p>

                    <p className="text-gray-500 text-sm mb-1">
                      {t("teamMembers.organization.avatar.upload.formats")}
                    </p>

                    <p className="text-gray-400 text-xs">
                      {t("teamMembers.organization.avatar.upload.maxSize")}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Organization Form */}
          <div className="space-y-6">
            {/* Organization Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("teamMembers.organization.name.title")}
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        "teamMembers.organization.name.placeholder"
                      )}
                      {...field}
                      disabled={!canManageOrg}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country and Sector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("teamMembers.organization.country")}
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!canManageOrg}
                    >
                      <FormControl>
                        <SelectTrigger disabled={!canManageOrg}>
                          <SelectValue
                            placeholder={t(
                              "teamMembers.organization.countryPlaceholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(countries).map(([code, country]) => (
                          <SelectItem key={code} value={code}>
                            <span className="flex items-center gap-2">
                              <span>{country.emoji}</span>
                              <span>{country.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("teamMembers.organization.sector")}
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "teamMembers.organization.sectorPlaceholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(sectors).map(([code, sector]) => (
                          <SelectItem key={code} value={code}>
                            {sector.name[locale as "en" | "fr"]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={
                  !canManageOrg ||
                  form.formState.isSubmitting ||
                  isAvatarUploading
                }
                className="min-w-[120px]"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Icons.spinner className="h-4 w-4 animate-spin mr-2" />

                    {t("teamMembers.organization.name.saving")}
                  </>
                ) : (
                  t("teamMembers.organization.name.save")
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
