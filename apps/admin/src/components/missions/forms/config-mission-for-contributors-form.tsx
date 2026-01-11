import { createMissionConfigForContributorsSchema } from "@/actions/missions/schema";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tada/ui/components/form";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@tada/ui/components/input";
import { Textarea } from "@tada/ui/components/textarea";
import { useUpload } from "@/hooks/use-upload";
import { stripSpecialCharacters } from "@/lib/utils";
import Image from "next/image";
import { Loader2, Plus } from "lucide-react";
import { createConfigMissionAction } from "@/actions/missions/create-config-mission-action";

export function ConfigMissionForContributorsForm({
  missionId,
  goNext,
}: {
  missionId: string;
  goNext: () => void;
}) {
  const t = useI18n();
  const { toast } = useToast();
  const form = useFormContext();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const { uploadFile, isLoading } = useUpload();

  const createMission = useAction(createConfigMissionAction, {
    onSuccess: (data) => {
      // setMission(data.data?.data!);
      goNext();
      toast({
        title: t("missions.createMission.form.success"),
      });
    },
    onError: () => {
      toast({
        title: t("missions.createMission.form.error"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: object) => {
    let imageUrl = avatarUrl;
    if (avatarFile) {
      const filename = stripSpecialCharacters(avatarFile.name);
      const { url } = await uploadFile({
        file: avatarFile,
        path: ["missions-contributors", filename],
        bucket: "avatars",
      });

      setAvatarUrl(url);
      imageUrl = url;
    }
    createMission.execute(
      createMissionConfigForContributorsSchema.parse({
        ...values,
        missionId,
        imageUrl,
      })
    );
  };

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
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 md:space-y-6"
    >
      <div className="space-y-4">
        <div>
          <FormLabel>{t("settings.personalInfo.avatar")}</FormLabel>

          <div className="flex items-center">
            <div className="flex-1 border border-input rounded-md shadow-sm">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  width={120}
                  height={120}
                  alt=""
                  className="w-full"
                />
              ) : (
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
              )}
            </div>
          </div>
        </div>
        <div>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm/5 font-medium">
                  {t("missions.publish.form.configMissionTitle")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("missions.publish.form.configMissionTitle")}
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm/5 font-medium">
                  {t("missions.publish.form.configMissionDescription")}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t(
                      "missions.publish.form.configMissionDescription"
                    )}
                    rows={8}
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
            name="gain"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm/5 font-medium">
                  {t("missions.publish.form.configMissionGain")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("missions.publish.form.configMissionGain")}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-1">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm/5 font-medium">
                    {t("missions.publish.form.configMissionDuration")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t(
                        "missions.publish.form.configMissionDuration"
                      )}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-1">
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm/5 font-medium">
                    {t("missions.publish.form.configMissionDeadline")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      placeholder={t("missions.publish.form.configMissionDeadline")}
                      {...field}
                      value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div>
          <FormField
            control={form.control}
            name="targetSampleSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm/5 font-medium">
                  {t("missions.publish.form.configMissionSampleSize")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("missions.publish.form.configMissionSampleSize")}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={createMission.status === "executing"}
          className="mt-4"
        >
          {createMission.status === "executing" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("common.loading")}
            </>
          ) : (
            <>{t("common.save")}</>
          )}
        </Button>
      </div>
    </form>
  );
}
