"use client";

import { sendSupportAction } from "@/actions/support/send-support-action";
import { useZodForm } from "@/hooks/use-zod-form";
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
import { Textarea } from "@tada/ui/components/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { z } from "zod";
import { useI18n } from "@/locales/client";

const formSchema = z.object({
  subject: z.string(),
  priority: z.string(),
  type: z.string(),
  message: z.string(),
});

export function SupportForm() {
  const { toast } = useToast();
  const t = useI18n();

  const form = useZodForm(formSchema, {
    defaultValues: {
      subject: undefined,
      type: undefined,
      priority: undefined,
      message: undefined,
    },
  });

  const sendSupport = useAction(sendSupportAction, {
    onSuccess: () => {
      toast({
        duration: 5500,
        title: t("support.messageSent"),
        variant: "default",
      });

      form.reset();
      if (window) window.location.reload();
    },
    onError: () => {
      toast({
        duration: 5500,
        variant: "destructive",
        title: t("support.messageError"),
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(sendSupport.execute)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("support.subject")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("support.subjectPlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("support.product")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("support.selectProduct")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Missions">
                      {t("support.mission")}
                    </SelectItem>
                    <SelectItem value="Market Beats">
                      {t("support.marketBeats")}
                    </SelectItem>
                    <SelectItem value="General">
                      {t("support.general")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("support.priority")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("support.selectSeverity")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">{t("support.low")}</SelectItem>
                    <SelectItem value="normal">
                      {t("support.normal")}
                    </SelectItem>
                    <SelectItem value="high">{t("support.high")}</SelectItem>
                    <SelectItem value="urgent">
                      {t("support.urgent")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("support.message")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("support.messagePlaceholder")}
                  className="resize-none min-h-[150px]"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={
            sendSupport.status === "executing" || !form.formState.isValid
          }
        >
          {sendSupport.status === "executing" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("support.submit")
          )}
        </Button>
      </form>
    </Form>
  );
}
