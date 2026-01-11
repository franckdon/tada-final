"use client";

import { type Dispatch, type SetStateAction } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { Button } from "@tada/ui/components/button";
import { Input } from "@tada/ui/components/input";
import { Label } from "@tada/ui/components/label";
import { Switch } from "@tada/ui/components/switch";
import { Loader2, Plus } from "lucide-react";
import { useI18n } from "@/locales/client";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { createSubDashboardAction } from "@/actions/missions/sub-dashboard/create-subdashboard-action";
import { useRouter } from "next/navigation";

const createSubDashboardSchema = (t: any) =>
  z.object({
    name: z
      .string()
      .min(3, t("missions.addSubDashboard.validation.nameMin"))
      .max(50, t("missions.addSubDashboard.validation.nameMax")),
    isShared: z.boolean().default(true),
  });

export type SubDashboardFormData = z.infer<
  ReturnType<typeof createSubDashboardSchema>
>;

interface AddSubDashboardProps {
  open: boolean;
  toggleOpen: Dispatch<SetStateAction<boolean>>;
  missionId: string;
  orgId: string;
}

export const AddSubDashboard = ({
  open,
  toggleOpen,
  orgId,
  missionId,
}: AddSubDashboardProps) => {
  const t = useI18n();
  const router = useRouter();

  const subDashboardSchema = createSubDashboardSchema(t);

  const form = useForm<SubDashboardFormData>({
    resolver: zodResolver(subDashboardSchema),
    defaultValues: {
      name: "",
      isShared: true,
    },
  });

  const createSubDashboard = useAction(createSubDashboardAction, {
    onSuccess: ({ data }) => {
      form.reset();
      toast({
        title: t("missions.addSubDashboard.create.success"),
      });

      const newPath = `/missions/${orgId}/${missionId}/sub-dashboard/${data?.data?.id}`;

      router.push(newPath);
    },
    onError: () => {
      toast({
        title: t("missions.addSubDashboard.create.error"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: SubDashboardFormData) => {
    createSubDashboard.execute({
      name: data.name,
      isShared: data.isShared,
      missionId: missionId,
      orgId: orgId,
    });
  };

  const isPending = createSubDashboard.status === "executing";

  return (
    <Dialog open={open} onOpenChange={toggleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("missions.addSubDashboard.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">
              {t("missions.addSubDashboard.form.nameLabel")}
            </Label>
            <Input
              id="name"
              type="text"
              {...form.register("name")}
              placeholder={t("missions.addSubDashboard.form.namePlaceholder")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isShared">
                  {t("missions.addSubDashboard.form.visibilityLabel")}
                </Label>
                <div className="text-xs text-muted-foreground">
                  {t("missions.addSubDashboard.form.visibilityDescription")}
                </div>
              </div>
              <Switch
                id="isShared"
                checked={form.watch("isShared")}
                onCheckedChange={(checked) =>
                  form.setValue("isShared", checked)
                }
              />
            </div>
            {form.formState.errors.isShared && (
              <p className="text-sm text-red-500">
                {form.formState.errors.isShared.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => toggleOpen(false)}
              disabled={isPending}
            >
              {t("missions.addSubDashboard.form.cancelButton")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("missions.addSubDashboard.form.submittingButton")}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("missions.addSubDashboard.form.addButton")}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
